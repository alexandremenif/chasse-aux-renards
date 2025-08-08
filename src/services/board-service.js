// services/board-service.js
import { userService } from './user-service';

const boards = {
  board_daniel: {
    owner: 'Daniel',
    totalToken: 50,
    rewards: {
      'd-1': { name: "Choisir le film", cost: 15, icon: '🎬', pending: false },
      'd-2': { name: "30 min de jeu spécial", cost: 20, icon: '🎲', pending: false },
      'd-3': { name: "Préparer un gâteau", cost: 35, icon: '🍰', pending: false },
      'd-4': { name: "Soirée pyjama", cost: 50, icon: '⛺', pending: false },
      'd-5': { name: "Sortie au parc", cost: 75, icon: '🌳', pending: false },
      'd-6': { name: "Le 'Grand Cadeau'", cost: 150, icon: '🎁', pending: false },
    }
  },
  board_evelyne: {
    owner: 'Evelyne',
    totalToken: 10,
    rewards: {
      'e-1': { name: "Glace spéciale", cost: 10, icon: '🍦', pending: false },
      'e-2': { name: "Livre neuf", cost: 40, icon: '📚', pending: false },
      'e-3': { name: "Journée 'On fait tout ce que tu veux'", cost: 200, icon: '🎉', pending: false },
    }
  },
};

const LAST_SELECTED_BOARD_KEY = 'lastSelectedBoardId';

class BoardService {
  constructor() {
    this.currentBoardId = null;
    this.boardSubscribers = [];
    this.tokenSubscribers = [];

    const lastSelectedId = localStorage.getItem(LAST_SELECTED_BOARD_KEY);

    userService.onUserChanged(user => {
      if (user && user.boards.length > 0) {
        const isValidLastSelected = user.boards.some(b => b.id === lastSelectedId);

        if (isValidLastSelected) {
          this.selectCurrentBoard(lastSelectedId);
        } else {
          this.selectCurrentBoard(user.boards[0].id);
        }
      } else {
        this.currentBoardId = null;
        this.#notifyBoardSubscribers();
      }
    });
  }

  #notifyBoardSubscribers() {
    if (this.currentBoardId && boards[this.currentBoardId]) {
      const board = boards[this.currentBoardId];
      const boardData = {
        id: this.currentBoardId,
        owner: board.owner,
        totalToken: board.totalToken,
        rewards: board.rewards, // Pass the rewards map directly
      };
      this.boardSubscribers.forEach(handler => handler(boardData));
    } else {
      this.boardSubscribers.forEach(handler => handler(null));
    }
  }

  #notifyTokenSubscribers() {
    this.tokenSubscribers.forEach(handler => handler());
  }

  selectCurrentBoard(boardId) {
    if (boardId && boards[boardId] && boardId !== this.currentBoardId) {
      this.currentBoardId = boardId;
      localStorage.setItem(LAST_SELECTED_BOARD_KEY, boardId);
      this.#notifyBoardSubscribers();
    }
  }

  addNewToken() {
    if (!this.currentBoardId) return;
    boards[this.currentBoardId].totalToken += 1;
    this.#notifyBoardSubscribers();
    this.#notifyTokenSubscribers();
  }

  toggleRewardSelection(rewardId) {
    if (!this.currentBoardId) return;
    const board = boards[this.currentBoardId];
    const reward = board.rewards[rewardId];
    if (!reward) return;

    if (reward.pending) {
      board.totalToken += reward.cost;
      reward.pending = false;
    } else {
      if (board.totalToken < reward.cost) {
        return;
      }
      board.totalToken -= reward.cost;
      reward.pending = true;
    }
    this.#notifyBoardSubscribers();
  }

  validateReward(rewardId) {
    if (!this.currentBoardId) return;
    const board = boards[this.currentBoardId];
    const reward = board.rewards[rewardId];
    if (reward && reward.pending) {
      reward.pending = false;
      this.#notifyBoardSubscribers();
    }
  }

  onCurrentBoardUpdated(handler) {
    this.boardSubscribers.push(handler);
    this.#notifyBoardSubscribers();
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
