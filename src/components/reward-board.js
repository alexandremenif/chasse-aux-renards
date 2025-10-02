// components/reward-board.js
import { boardService } from '../services/board-service.js';

class RewardBoard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.boardData = null;
        this.unsubscribeBoard = () => {};
    }

    connectedCallback() {
        this._setupHTML();
        
        this.unsubscribeBoard = boardService.onCurrentBoardUpdated(boardData => {
            if (boardData) {
                this.boardData = boardData;
                this._render();
            }
        });
    }

    disconnectedCallback() {
        this.unsubscribeBoard();
    }

    _setupHTML() {
        this.shadowRoot.innerHTML = `
            <style>
                main {
                    padding: 2rem;
                }
                .dashboard-grid { 
                    display: grid; 
                    grid-template-columns: 1fr; 
                    gap: 2rem; 
                }
                .section { 
                    background-color: white; 
                    padding: 1.5rem; 
                    border-radius: 1rem; 
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1); 
                }
                .section-title { 
                    text-align: center; 
                    font-size: 1.5rem; 
                    font-weight: 700; 
                    margin: 0 0 1rem 0; 
                }
                .rewards-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
                    gap: 1rem; 
                }
            </style>

            <main>
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
            </main>
        `;
    }

    _render() {
        const { totalToken, rewards } = this.boardData;

        const renardCounter = this.shadowRoot.querySelector('renard-counter');
        renardCounter.setAttribute('total', String(totalToken));
        
        const rewardsGrid = this.shadowRoot.querySelector('.rewards-grid');
        rewardsGrid.innerHTML = '';
        
        const sortedRewards = Object.entries(rewards)
            .map(([id, reward]) => ({ ...reward, id }))
            .sort((a, b) => a.cost - b.cost);

        sortedRewards.forEach(reward => {
            const rewardCard = document.createElement('reward-card');
            rewardCard.setAttribute('id', reward.id);
            rewardCard.setAttribute('name', reward.name);
            rewardCard.setAttribute('cost', reward.cost);
            rewardCard.setAttribute('icon', reward.icon);
            rewardCard.setAttribute('is-pending', String(reward.pending));
            rewardCard.setAttribute('can-afford', String(totalToken >= reward.cost || reward.pending));
            rewardsGrid.appendChild(rewardCard);
        });
    }
}

customElements.define('reward-board', RewardBoard);
