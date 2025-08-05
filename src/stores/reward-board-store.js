// stores/reward-board-store.js
import { userStore } from './user-store.js';

const boards = {
  child1: {
    owner: { id: 'child1', name: 'Daniel' },
    totalToken: 50,
    rewards: [
        { id: 'd-1', name: "Choisir le film", cost: 15, icon: '🎬', pending: false },
        { id: 'd-2', name: "30 min de jeu spécial", cost: 20, icon: '🎲', pending: false },
        { id: 'd-3', name: "Préparer un gâteau", cost: 35, icon: '🍰', pending: false },
        { id: 'd-4', name: "Soirée pyjama", cost: 50, icon: '⛺', pending: false },
        { id: 'd-5', name: "Sortie au parc", cost: 75, icon: '🌳', pending: false },
        { id: 'd-6', name: "Le 'Grand Cadeau'", cost: 150, icon: '🎁', pending: false },
    ]
  },
  child2: {
    owner: { id: 'child2', name: 'Evelyne' },
    totalToken: 10,
    rewards: [
        { id: 'e-1', name: "Glace spéciale", cost: 10, icon: '🍦', pending: false },
        { id: 'e-2', name: "Livre neuf", cost: 40, icon: '📚', pending: false },
        { id: 'e-3', name: "Journée 'On fait tout ce que tu veux'", cost: 200, icon: '🎉', pending: false },
    ]
  },
};

class RewardBoardStore {
  constructor() {
    this.currentChildId = null;
    this.boardSubscribers = [];
    this.tokenSubscribers = [];

    userStore.onAuthenticatedUser(userData => {
      if (!userData) {
        return;
      } if (userData.role === 'child') {
        this.selectCurrentChild(userData.id);
      } else if (userData.role === 'parent' && userData.children.length > 0) {
        if (!this.currentChildId) {
          this.selectCurrentChild(userData.children[0].id);
        }
      }
    });
  }

  #notifyBoardSubscribers() {
    if (this.currentChildId && boards[this.currentChildId]) {
      const boardData = boards[this.currentChildId];
      this.boardSubscribers.forEach(handler => handler(boardData));
    } else {
      this.boardSubscribers.forEach(handler => handler(null));
    }
  }
  
  #notifyTokenSubscribers() {
    this.tokenSubscribers.forEach(handler => handler());
  }

  selectCurrentChild(childId) {
    if (childId && boards[childId] && childId !== this.currentChildId) {
        this.currentChildId = childId;
        this.#notifyBoardSubscribers();
    }
  }

  addNewToken() {
    if (!this.currentChildId) return;
    boards[this.currentChildId].totalToken += 1;
    this.#notifyBoardSubscribers();
    this.#notifyTokenSubscribers();
  }

  toggleRewardSelection(rewardId) {
    if (!this.currentChildId) return;
    const board = boards[this.currentChildId];
    const reward = board.rewards.find(r => r.id === rewardId);
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
    if (!this.currentChildId) return;
    const board = boards[this.currentChildId];
    const reward = board.rewards.find(r => r.id === rewardId);
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

export const rewardBoardStore = new RewardBoardStore();
