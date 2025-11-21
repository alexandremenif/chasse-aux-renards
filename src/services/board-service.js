// services/board-service.js
import { userService } from './user-service';
import { db, functions } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

const LAST_SELECTED_BOARD_KEY = 'lastSelectedBoardId';

class BoardService {
  constructor() {
    this.currentBoardId = null;
    this.boardSubscribers = [];
    this.tokenSubscribers = [];
    this.unsubscribeFromBoard = () => { };
    this.localLastTokenUpdateTime = null;
    this.lastServerState = null;

    userService.onUserChanged(user => {
      if (user && user.boards.length > 0) {
        const lastSelectedId = localStorage.getItem(LAST_SELECTED_BOARD_KEY);
        const isValidLastSelected = user.boards.some(b => b.id === lastSelectedId);

        const boardIdToSelect = isValidLastSelected ? lastSelectedId : user.boards[0].id;
        this.selectCurrentBoard(boardIdToSelect);

      } else {
        this.currentBoardId = null;
        localStorage.removeItem(LAST_SELECTED_BOARD_KEY);
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
      // Reset local timestamp on board switch to ensure the logic works for each board.
      this.localLastTokenUpdateTime = null;
      this.lastServerState = null;

      const boardRef = doc(db, 'boards', this.currentBoardId);
      this.unsubscribeFromBoard = onSnapshot(boardRef, (doc) => {
        const boardData = { id: doc.id, ...doc.data() };
        this.#handleBoardUpdate(boardData);
      });
    }
  }

  #handleBoardUpdate(boardData) {
    this.lastServerState = boardData;
    const remoteTimestamp = boardData.lastTokenUpdateTime?.toMillis();

    this.#notifyBoardSubscribers(boardData);

    // Only notify subscribers if we have a previous timestamp and the new one is different.
    // This prevents the animation from firing on the initial load of a board.
    // Also check if the totalToken count actually changed to avoid re-triggering animation 
    // if the optimistic update already set the correct count.
    if (this.localLastTokenUpdateTime && remoteTimestamp !== this.localLastTokenUpdateTime) {
      // We can't easily check if the optimistic update already happened just by timestamp.
      // But we can check if the animation was recently triggered optimistically?
      // Simpler approach: The UI component checks (this.total <= this.previousTotal) before animating.
      // So if we notify here, and the total is the same as the optimistic one, the UI won't animate again.
      this.#notifyTokenSubscribers();
    }

    // Always update to the latest known timestamp from the server.
    this.localLastTokenUpdateTime = remoteTimestamp;
  }

  async addNewToken() {
    if (!this.currentBoardId || !this.lastServerState) return;

    // Optimistic Update
    const optimisticState = {
      ...this.lastServerState,
      totalToken: (this.lastServerState.totalToken || 0) + 1
    };
    this.#notifyBoardSubscribers(optimisticState);
    this.#notifyTokenSubscribers(); // Trigger animation immediately

    const addToken = httpsCallable(functions, 'addToken');
    try {
      await addToken({ boardId: this.currentBoardId });
    } catch (error) {
      console.error("Error adding token:", error);
      // Rollback
      this.#notifyBoardSubscribers(this.lastServerState);
    }
  }

  async toggleRewardSelection(rewardId) {
    if (!this.currentBoardId || !this.lastServerState) return;

    const reward = this.lastServerState.rewards[rewardId];
    if (!reward) return;

    const newTotalToken = reward.pending
      ? this.lastServerState.totalToken + reward.cost
      : this.lastServerState.totalToken - reward.cost;

    if (newTotalToken < 0 && !reward.pending) return;

    // Optimistic Update
    const optimisticState = {
      ...this.lastServerState,
      rewards: {
        ...this.lastServerState.rewards,
        [rewardId]: { ...reward, pending: !reward.pending }
      },
      totalToken: newTotalToken
    };
    this.#notifyBoardSubscribers(optimisticState);

    const toggleReward = httpsCallable(functions, 'toggleReward');
    try {
      await toggleReward({ boardId: this.currentBoardId, rewardId });
    } catch (error) {
      console.error("Error toggling reward:", error);
      // Rollback
      this.#notifyBoardSubscribers(this.lastServerState);
    }
  }

  async validateReward(rewardId) {
    if (!this.currentBoardId || !this.lastServerState) return;

    // Optimistic Update
    const optimisticState = {
      ...this.lastServerState,
      rewards: {
        ...this.lastServerState.rewards,
        [rewardId]: { ...this.lastServerState.rewards[rewardId], pending: false }
      }
    };
    this.#notifyBoardSubscribers(optimisticState);

    const confirmReward = httpsCallable(functions, 'confirmReward');
    try {
      await confirmReward({ boardId: this.currentBoardId, rewardId });
    } catch (error) {
      console.error("Error confirming reward:", error);
      // Rollback
      this.#notifyBoardSubscribers(this.lastServerState);
    }
  }

  #notifyBoardSubscribers(boardData) {
    this.boardSubscribers.forEach(handler => handler(boardData));
  }

  #notifyTokenSubscribers() {
    this.tokenSubscribers.forEach(handler => handler());
  }

  onCurrentBoardUpdated(handler) {
    this.boardSubscribers.push(handler);
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
