// services/board-service.js
import { userService } from './user-service';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';

const LAST_SELECTED_BOARD_KEY = 'lastSelectedBoardId';

class BoardService {
  constructor() {
    this.currentBoardId = null;
    this.boardSubscribers = [];
    this.tokenSubscribers = [];
    this.unsubscribeFromBoard = () => {};
    this.localLastTokenUpdateTime = null;

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
      
      const boardRef = doc(db, 'boards', this.currentBoardId);
      this.unsubscribeFromBoard = onSnapshot(boardRef, (doc) => {
        const boardData = { id: doc.id, ...doc.data() };
        this.#handleBoardUpdate(boardData);
      });
    }
  }

  #handleBoardUpdate(boardData) {
    const remoteTimestamp = boardData.lastTokenUpdateTime?.toMillis();

    this.#notifyBoardSubscribers(boardData);

    // Only notify subscribers if we have a previous timestamp and the new one is different.
    // This prevents the animation from firing on the initial load of a board.
    if (this.localLastTokenUpdateTime && remoteTimestamp !== this.localLastTokenUpdateTime) {
        this.#notifyTokenSubscribers();
    }
    
    // Always update to the latest known timestamp from the server.
    this.localLastTokenUpdateTime = remoteTimestamp;
  }

  async addNewToken() {
    if (!this.currentBoardId) return;
    const boardRef = doc(db, 'boards', this.currentBoardId);
    const boardDoc = await getDoc(boardRef);
    const currentTokens = boardDoc.data().totalToken || 0;
    
    await updateDoc(boardRef, {
      totalToken: currentTokens + 1,
      lastTokenUpdateTime: serverTimestamp()
    });
  }

  async toggleRewardSelection(rewardId) {
    if (!this.currentBoardId) return;
    const boardRef = doc(db, 'boards', this.currentBoardId);
    const boardDoc = await getDoc(boardRef);
    const boardData = boardDoc.data();
    
    const reward = boardData.rewards[rewardId];
    if (!reward) return;

    const newTotalToken = reward.pending 
        ? boardData.totalToken + reward.cost
        : boardData.totalToken - reward.cost;

    if (newTotalToken < 0 && !reward.pending) return; // Not enough tokens and not un-pending
    
    const newRewards = {
        ...boardData.rewards,
        [rewardId]: { ...reward, pending: !reward.pending }
    };

    await updateDoc(boardRef, {
      rewards: newRewards,
      totalToken: newTotalToken
    });
  }

  async validateReward(rewardId) {
    if (!this.currentBoardId) return;
    const boardRef = doc(db, 'boards', this.currentBoardId);
    
    // Simply mark the reward as no longer pending. Do not delete it.
    // We use dot notation to update a specific field within the 'rewards' map.
    const rewardPendingField = `rewards.${rewardId}.pending`;
    await updateDoc(boardRef, {
      [rewardPendingField]: false
    });
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
