// services/board-service.js
import { userService } from './user-service';
import { db } from '../firebase';
import { doc, collection, onSnapshot, updateDoc, runTransaction, serverTimestamp, FieldValue, increment } from 'firebase/firestore';

const LAST_SELECTED_BOARD_KEY = 'lastSelectedBoardId';

class BoardService {
  constructor() {
    this.currentBoardId = null;
    this.boardSubscribers = [];
    this.tokenSubscribers = [];
    this.unsubscribeFromBoard = () => { };
    this.unsubscribeFromRewards = () => { };

    this.currentBoardData = null;
    this.localLastNewTokenTime = null;

    userService.onUserChanged(user => {
      if (user === undefined) return;

      if (user && user.boards.length > 0) {
        const lastSelectedId = localStorage.getItem(LAST_SELECTED_BOARD_KEY);
        const isValidLastSelected = user.boards.some(b => b.id === lastSelectedId);

        const boardIdToSelect = isValidLastSelected ? lastSelectedId : user.boards[0].id;
        this.selectCurrentBoard(boardIdToSelect);

      } else {
        this.currentBoardId = null;
        this.currentBoardData = null;
        localStorage.removeItem(LAST_SELECTED_BOARD_KEY);
        this.unsubscribeFromBoard();
        this.unsubscribeFromRewards();
        this.#notifyBoardSubscribers(null);
      }
    });
  }

  selectCurrentBoard(boardId) {
    if (boardId && boardId !== this.currentBoardId) {
      this.currentBoardId = boardId;
      localStorage.setItem(LAST_SELECTED_BOARD_KEY, boardId);

      this.unsubscribeFromBoard();
      this.unsubscribeFromRewards();
      this.currentBoardData = null;
      this.localLastNewTokenTime = null;

      const boardRef = doc(db, 'boards', this.currentBoardId);
      const rewardsRef = collection(db, 'boards', this.currentBoardId, 'rewards');

      let boardDocData = null;
      let rewardsData = {};

      // Helper to merge and notify
      const updateState = () => {
        if (!boardDocData) return;

        const boardData = { ...boardDocData, rewards: rewardsData };

        // Calculate available tokens
        let pendingCost = 0;
        if (boardData.rewards) {
          Object.values(boardData.rewards).forEach(r => {
            if (r.pending) pendingCost += r.cost;
          });
        }
        boardData.availableToken = (boardData.totalToken || 0) - pendingCost;

        this.currentBoardData = boardData;
        const remoteTimestamp = boardData.lastNewTokenTime?.toMillis();

        this.#notifyBoardSubscribers(boardData);

        if (this.localLastNewTokenTime && remoteTimestamp !== this.localLastNewTokenTime) {
          this.#notifyTokenSubscribers();
        }

        this.localLastNewTokenTime = remoteTimestamp;
      };

      // 1. Subscribe to Board
      this.unsubscribeFromBoard = onSnapshot(boardRef, (doc) => {
        if (doc.exists()) {
          boardDocData = { id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) };
          updateState();
        }
      });

      // 2. Subscribe to Rewards Subcollection
      this.unsubscribeFromRewards = onSnapshot(rewardsRef, (snapshot) => {
        rewardsData = {};
        snapshot.forEach(doc => {
          rewardsData[doc.id] = { id: doc.id, ...doc.data() };
        });
        updateState();
      });
    }
  }

  async addToken() {
    if (!this.currentBoardId) return;
    const boardRef = doc(db, 'boards', this.currentBoardId);

    // Atomic update
    await updateDoc(boardRef, {
      totalToken: increment(1),
      lastNewTokenTime: new Date()
    });
  }

  async toggleRewardSelection(rewardId) {
    if (!this.currentBoardId || !this.currentBoardData) return;

    const reward = this.currentBoardData.rewards[rewardId];
    if (!reward) return;

    const newPendingStatus = !reward.pending;

    // Client-side validation for solvency
    if (newPendingStatus) {
      if (this.currentBoardData.availableToken < reward.cost) {
        console.warn("Insufficient funds to select reward");
        return;
      }
    }

    // Update specific reward document in subcollection
    const rewardRef = doc(db, 'boards', this.currentBoardId, 'rewards', rewardId);
    await updateDoc(rewardRef, {
      pending: newPendingStatus
    });
  }

  async validateReward(rewardId) {
    if (!this.currentBoardId) return;
    const boardRef = doc(db, 'boards', this.currentBoardId);
    const rewardRef = doc(db, 'boards', this.currentBoardId, 'rewards', rewardId);

    try {
      await runTransaction(db, async (transaction) => {
        const boardDoc = await transaction.get(boardRef);
        const rewardDoc = await transaction.get(rewardRef);

        if (!boardDoc.exists()) throw new Error("Board not found");
        if (!rewardDoc.exists()) throw new Error("Reward not found");

        const boardData = boardDoc.data();
        const rewardData = rewardDoc.data();

        if (!rewardData.pending) throw new Error("Reward not pending");

        // Check if we have enough BANKED tokens to confirm
        if (boardData.totalToken < rewardData.cost) throw new Error("Insufficient tokens");

        // 1. Update Reward (not pending anymore)
        transaction.update(rewardRef, {
          pending: false
        });

        // 2. Update Board (decrement tokens)
        transaction.update(boardRef, {
          totalToken: increment(-rewardData.cost)
        });
      });
    } catch (e) {
      console.error("Transaction failed: ", e);
    }
  }

  #notifyBoardSubscribers(data) {
    this.boardSubscribers.forEach(handler => handler(data));
  }

  #notifyTokenSubscribers() {
    this.tokenSubscribers.forEach(handler => handler());
  }

  onCurrentBoardUpdated(handler) {
    this.boardSubscribers.push(handler);
    if (this.currentBoardData) {
      handler(this.currentBoardData);
    }
    return () => {
      this.boardSubscribers = this.boardSubscribers.filter(sub => sub !== handler);
    };
  }

  onNewToken(handler) {
    this.tokenSubscribers.push(handler);
    return () => {
      this.tokenSubscribers = this.tokenSubscribers.filter(sub => sub !== handler);
    };
  }
}

export const boardService = new BoardService();
