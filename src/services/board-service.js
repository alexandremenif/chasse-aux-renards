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
    this.localLastTokenUpdateTime = null;
    this.lastServerState = null;
    this.pendingActions = [];
    this.nextSequence = 1;
    this.currentUserId = null;

    userService.onUserChanged(user => {
      if (user === undefined) return;

      this.currentUserId = user ? user.id : null;
      if (user && user.boards.length > 0) {
        const lastSelectedId = localStorage.getItem(LAST_SELECTED_BOARD_KEY);
        const isValidLastSelected = user.boards.some(b => b.id === lastSelectedId);

        const boardIdToSelect = isValidLastSelected ? lastSelectedId : user.boards[0].id;
        this.selectCurrentBoard(boardIdToSelect);

      } else {
        this.currentBoardId = null;
        this.lastServerState = null; // Clear stale state to prevent unwanted renders
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

    // Cleanup pending actions based on server sequence
    const lastSequences = boardData.lastActionSequences || {};
    if (this.currentUserId) {
      const lastProcessed = lastSequences[this.currentUserId] || 0;

      // Sync local sequence counter if we are behind server (e.g. after reload)
      if (this.nextSequence <= lastProcessed) {
        this.nextSequence = lastProcessed + 1;
      }

      this.pendingActions = this.pendingActions.filter(a => a.seq > lastProcessed);
    }

    this.#notifyBoardSubscribers();

    // Trigger animation if the server timestamp has changed (meaning a new token was added by someone)
    if (this.localLastTokenUpdateTime && remoteTimestamp !== this.localLastTokenUpdateTime) {
      this.#notifyTokenSubscribers();
    }
    this.localLastTokenUpdateTime = remoteTimestamp;
  }

  async #performOptimisticAction(applyFn, serverCallFn, triggerAnimation = false) {
    if (!this.currentUserId || !this.currentBoardId) return;

    const seq = this.nextSequence++;
    const action = { seq, apply: applyFn };

    this.pendingActions.push(action);
    this.#notifyBoardSubscribers();

    if (triggerAnimation) {
      this.#notifyTokenSubscribers();
    }

    try {
      await serverCallFn(seq);
    } catch (error) {
      console.error("Action failed:", error);
      // Rollback: remove this specific action
      this.pendingActions = this.pendingActions.filter(a => a.seq !== seq);
      this.#notifyBoardSubscribers();
    }
  }

  async addNewToken() {
    await this.#performOptimisticAction(
      (state) => ({ ...state, totalToken: (state.totalToken || 0) + 1 }),
      (seq) => {
        const addToken = httpsCallable(functions, 'addToken');
        return addToken({ boardId: this.currentBoardId, sequence: seq });
      },
      true // Trigger animation
    );
  }

  async toggleRewardSelection(rewardId) {
    await this.#performOptimisticAction(
      (state) => {
        const reward = state.rewards[rewardId];
        if (!reward) return state;

        const newTotalToken = reward.pending
          ? state.totalToken + reward.cost
          : state.totalToken - reward.cost;

        if (newTotalToken < 0 && !reward.pending) return state;

        return {
          ...state,
          rewards: {
            ...state.rewards,
            [rewardId]: { ...reward, pending: !reward.pending }
          },
          totalToken: newTotalToken
        };
      },
      (seq) => {
        const toggleReward = httpsCallable(functions, 'toggleReward');
        return toggleReward({ boardId: this.currentBoardId, rewardId, sequence: seq });
      }
    );
  }

  async validateReward(rewardId) {
    await this.#performOptimisticAction(
      (state) => ({
        ...state,
        rewards: {
          ...state.rewards,
          [rewardId]: { ...state.rewards[rewardId], pending: false }
        }
      }),
      (seq) => {
        const confirmReward = httpsCallable(functions, 'confirmReward');
        return confirmReward({ boardId: this.currentBoardId, rewardId, sequence: seq });
      }
    );
  }

  #notifyBoardSubscribers() {
    if (!this.lastServerState) {
      this.boardSubscribers.forEach(handler => handler(null));
      return;
    }

    let viewState = { ...this.lastServerState };

    // Deep copy rewards to avoid mutating lastServerState during projection
    if (viewState.rewards) {
      viewState.rewards = { ...viewState.rewards };
      for (const key in viewState.rewards) {
        viewState.rewards[key] = { ...viewState.rewards[key] };
      }
    }

    // Apply pending actions
    for (const action of this.pendingActions) {
      viewState = action.apply(viewState);
    }

    this.boardSubscribers.forEach(handler => handler(viewState));
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
