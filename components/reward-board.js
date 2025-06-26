// components/reward-board.js
import { rewardBoardService } from '../services/reward-board.js';

class RewardBoard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.boardData = null;
        this.unsubscribeState = () => {};
        this.unsubscribeIncrement = () => {};
    }

    static get observedAttributes() {
        return ['board-id', 'parent-mode'];
    }

    connectedCallback() {
        this._setupHTML();
        this._subscribeToData();
    }

    disconnectedCallback() {
        this.unsubscribeState();
        this.unsubscribeIncrement();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        if (name === 'board-id') {
            this.unsubscribeState();
            this.unsubscribeIncrement();
            this._subscribeToData();
        }
        if (name === 'parent-mode') {
            this._render();
        }
    }

    _subscribeToData() {
        const boardId = this.getAttribute('board-id');
        if (!boardId) return;

        // Subscription for state changes
        this.unsubscribeState = rewardBoardService.getBoardSubscription(boardId, (boardData) => {
            this.boardData = boardData;
            this._render();
        });

        // Subscription for the increment action
        this.unsubscribeIncrement = rewardBoardService.onTokenIncrement(boardId, () => {
            this.shadowRoot.querySelector('renard-counter')?.playAnimation();
        });
    }

    _setupHTML() {
        this.shadowRoot.innerHTML = `
            <style>
                .dashboard-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
                .section { background-color: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1); }
                .section-title { text-align: center; font-size: 1.5rem; font-weight: 700; margin: 0 0 1rem 0; }
                .rewards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
            </style>
            <div class="dashboard-grid">
                <section class="section">
                    <h2 class="section-title">Ton Trésor Disponible</h2>
                    <renard-counter></renard-counter>
                </section>
                <section class="section">
                    <h2 class="section-title">Les Récompenses</h2>
                    <div class="rewards-grid"></div>
                </section>
            </div>
        `;
    }

    _render() {
        if (!this.boardData) return;

        const { totalTokens, rewards } = this.boardData;
        const renardCounter = this.shadowRoot.querySelector('renard-counter');
        const rewardsGrid = this.shadowRoot.querySelector('.rewards-grid');
        
        renardCounter.setAttribute('total', totalTokens);
        
        rewardsGrid.innerHTML = '';
        rewards.forEach(reward => {
            const rewardCard = document.createElement('reward-card');
            rewardCard.setAttribute('name', reward.name);
            rewardCard.setAttribute('cost', reward.cost);
            rewardCard.setAttribute('icon', reward.icon);
            rewardCard.setAttribute('is-pending', String(reward.isPending));
            
            rewardCard.setAttribute('can-afford', String(totalTokens >= reward.cost || reward.isPending));
            rewardCard.setAttribute('is-parent-mode', this.getAttribute('parent-mode') || 'false');

            rewardCard.addEventListener('toggle-pending', () => {
                rewardBoardService.toggleRewardSelection(this.getAttribute('board-id'), reward.id);
            });
            rewardCard.addEventListener('validate-reward', () => {
                 const modal = document.getElementById('confirmation-modal');
                 modal.setAttribute('title', `Valider ${reward.name} ?`);
                 modal.setAttribute('message', `Cette action est définitive.`);
                 modal.addEventListener('confirmed', () => {
                    rewardBoardService.validateReward(this.getAttribute('board-id'), reward.id);
                 }, { once: true });
                 modal.setAttribute('visible', '');
            });

            rewardsGrid.appendChild(rewardCard);
        });
    }
}

customElements.define('reward-board', RewardBoard);
