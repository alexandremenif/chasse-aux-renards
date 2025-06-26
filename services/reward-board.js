// services/reward-board.js

/**
 * Manages the state of all reward boards for the application.
 * This service separates state subscription from event/action subscription.
 */
class RewardBoardService {
    constructor() {
        this.boards = {
            'board-1': {
                totalTokens: 50,
                rewards: [
                    { id: 1, name: "Choisir le film", cost: 15, icon: '🎬', isPending: false },
                    { id: 2, name: "30 min de jeu spécial", cost: 20, icon: '🎲', isPending: false },
                    { id: 3, name: "Préparer un gâteau", cost: 35, icon: '🍰', isPending: false },
                    { id: 4, name: "Soirée pyjama", cost: 50, icon: '⛺', isPending: false },
                    { id: 5, name: "Sortie au parc", cost: 75, icon: '🌳', isPending: false },
                    { id: 6, name: "Le 'Grand Cadeau'", cost: 150, icon: '🎁', isPending: false },
                ]
            },
            'board-2': {
                totalTokens: 10,
                rewards: [
                    { id: 1, name: "Glace spéciale", cost: 10, icon: '🍦', isPending: false },
                    { id: 2, name: "Livre neuf", cost: 40, icon: '📚', isPending: false },
                    { id: 3, name: "Journée 'On fait tout ce que tu veux'", cost: 200, icon: '🎉', isPending: false },
                ]
            }
        };

        // Separate subscribers for state and for specific actions
        this.stateSubscribers = new Map();
        this.incrementSubscribers = new Map();
    }

    // --- State Subscription ---
    getBoardSubscription(boardId, callback) {
        if (!this.stateSubscribers.has(boardId)) {
            this.stateSubscribers.set(boardId, []);
        }
        const boardSubscribers = this.stateSubscribers.get(boardId);
        boardSubscribers.push(callback);
        
        const currentBoardData = this.boards[boardId];
        if (currentBoardData) {
            callback(currentBoardData);
        }
        
        return () => {
            const index = boardSubscribers.indexOf(callback);
            if (index > -1) boardSubscribers.splice(index, 1);
        };
    }
    
    // --- Event/Action Subscription ---
    onTokenIncrement(boardId, callback) {
        if (!this.incrementSubscribers.has(boardId)) {
            this.incrementSubscribers.set(boardId, []);
        }
        const actionSubscribers = this.incrementSubscribers.get(boardId);
        actionSubscribers.push(callback);
        
        return () => {
            const index = actionSubscribers.indexOf(callback);
            if (index > -1) actionSubscribers.splice(index, 1);
        };
    }

    // --- Action Methods ---
    incrementToken(boardId) {
        const currentBoard = this.boards[boardId];
        if (currentBoard) {
            this.boards[boardId] = { ...currentBoard, totalTokens: currentBoard.totalTokens + 1 };
            this.notifyState(boardId);
            this.notifyIncrement(boardId);
        }
    }

    toggleRewardSelection(boardId, rewardId) {
        const currentBoard = this.boards[boardId];
        if (!currentBoard) return;
        
        const reward = currentBoard.rewards.find(r => r.id === rewardId);
        if (!reward) return;
        
        let newTotalTokens = currentBoard.totalTokens;
        if (reward.isPending) {
            newTotalTokens += reward.cost;
        } else {
            if (newTotalTokens < reward.cost) return;
            newTotalTokens -= reward.cost;
        }

        const updatedRewards = currentBoard.rewards.map(r => 
            r.id === rewardId ? { ...r, isPending: !r.isPending } : r
        );

        this.boards[boardId] = { ...currentBoard, totalTokens: newTotalTokens, rewards: updatedRewards };
        this.notifyState(boardId);
    }

    validateReward(boardId, rewardId) {
        const currentBoard = this.boards[boardId];
        if (!currentBoard) return;
        
        const reward = currentBoard.rewards.find(r => r.id === rewardId);
        if (!reward || !reward.isPending) return;
        
        const updatedRewards = currentBoard.rewards.map(r => 
            r.id === rewardId ? { ...r, isPending: false } : r
        );
        
        this.boards[boardId] = { ...currentBoard, rewards: updatedRewards };
        this.notifyState(boardId);
    }
    
    // --- Notification Methods ---
    notifyState(boardId) {
        if (this.stateSubscribers.has(boardId)) {
            const boardData = this.boards[boardId];
            this.stateSubscribers.get(boardId).forEach(callback => callback(boardData));
        }
    }
    
    notifyIncrement(boardId) {
        if (this.incrementSubscribers.has(boardId)) {
            this.incrementSubscribers.get(boardId).forEach(callback => callback());
        }
    }
}

export const rewardBoardService = new RewardBoardService();
