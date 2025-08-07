// components/reward-board.js
import { boardService } from '../services/board-service.js';
import { userService } from '../services/user-service.js';

class RewardBoard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.boardData = null;
        this.unsubscribeBoard = () => {};
    }

    connectedCallback() {
        const currentUser = userService.getCurrentUser();
        this._setupHTML(currentUser);
        
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

    _setupHTML(user) {
        this.shadowRoot.innerHTML = `
            <style>
                /* Header & Title */
                header {
                    text-align: center;
                    margin-bottom: 2rem;
                    padding-top: 3rem;
                }
                @media (min-width: 768px) {
                    header {
                        padding-top: 0;
                    }
                }
                header h1 {
                    font-size: 2.25rem; /* text-4xl */
                    font-weight: 900; /* font-black */
                    color: #D97706; /* text-amber-600 */
                    line-height: 1;
                    margin-top: 0;
                    margin-bottom: 0.5rem; /* Espace entre le titre et le sélecteur */
                }
                @media (min-width: 768px) {
                    header h1 {
                        font-size: 3rem; /* md:text-5xl */
                    }
                }
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
            
            <header>
                <h1>La Chasse aux Renards</h1>
                <div id="selector-container"></div>
            </header>

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

        if (user.isParent) {
            this.shadowRoot.querySelector('#selector-container').innerHTML = '<board-selector></board-selector>';
        }
    }

    _render() {
        const { owner, totalToken, rewards, id } = this.boardData;
        
        const boardSelector = this.shadowRoot.querySelector('board-selector');
        if (boardSelector) {
            boardSelector.setAttribute('board-name', owner);
            boardSelector.setAttribute('board-id', id);
        }

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
