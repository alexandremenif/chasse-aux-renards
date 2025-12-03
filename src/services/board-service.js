// services/board-service.js
import { userService } from './user-service';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, runTransaction, serverTimestamp, FieldValue, increment } from 'firebase/firestore';

const LAST_SELECTED_BOARD_KEY = 'lastSelectedBoardId';

class BoardService {
  constructor() {
    this.currentBoardId = null;
    this.boardSubscribers = [];
    this.tokenSubscribers = [];
    this.unsubscribeFromBoard = () => { };

    this.currentBoardData = null;
    this.lastNewTokenTime = null;

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
        this.unsubscribeFromBoard();
        this.#notifyBoardSubscribers(null);
      }
    });
  }

  selectCurrentBoard(boardId) {
    if (boardId && boardId !== this.currentBoardId) {
      this.currentBoardId = boardId;
      localStorage.setItem(LAST_SELECTED_BOARD_KEY, boardId);

      this.unsubscribeFromBoard();
      this.currentBoardData = null;
      this.localLastNewTokenTime = null;

      const boardRef = doc(db, 'boards', this.currentBoardId);
      this.unsubscribeFromBoard = onSnapshot(boardRef, (doc) => {
        if (doc.exists()) {
          const boardData = { id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) };

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

          // Only notify subscribers if we have a previous timestamp and the new one is different.
          // This prevents the animation from firing on the initial load of a board.
          if (this.localLastNewTokenTime && remoteTimestamp !== this.localLastNewTokenTime) {
            this.#notifyTokenSubscribers();
          }

          // Always update to the latest known timestamp from the server.
          this.localLastNewTokenTime = remoteTimestamp;
        }
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

    const boardRef = doc(db, 'boards', this.currentBoardId);
    await updateDoc(boardRef, {
      [`rewards.${rewardId}.pending`]: newPendingStatus
    });
  }

  async validateReward(rewardId) {
    if (!this.currentBoardId) return;
    const boardRef = doc(db, 'boards', this.currentBoardId);

    try {
      await runTransaction(db, async (transaction) => {
        const boardDoc = await transaction.get(boardRef);
        if (!boardDoc.exists()) throw new Error("Board not found");

        const data = boardDoc.data();
        const reward = data.rewards[rewardId];

        if (!reward) throw new Error("Reward not found");
        if (!reward.pending) throw new Error("Reward not pending");

        // Check if we have enough BANKED tokens to confirm
        // (Since pending didn't reduce totalToken, we check totalToken directly)
        if (data.totalToken < reward.cost) throw new Error("Insufficient tokens");

        transaction.update(boardRef, {
          [`rewards.${rewardId}.pending`]: false,
          totalToken: increment(-reward.cost)
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
