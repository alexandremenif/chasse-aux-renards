
// components/reward-board.js
import { LitElement, html, css, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { userService } from '../services/user-service.js';
import { boardService } from '../services/board-service.js';
import './renard-counter.js';
import './reward-card.js';

class RewardBoard extends LitElement {
    static properties = {
        boardData: { type: Object, state: true }
    };

    static styles = css`
        :host { display: block; }
        
        .empty-message {
            padding: var(--md-sys-spacing-24);
            text-align: center;
            color: var(--md-sys-color-on-surface-variant);
            font: var(--md-sys-typescale-body-large);
        }

        h2 {
            font: var(--md-sys-typescale-title-large);
            color: var(--md-sys-color-on-surface);
            margin: 0 0 var(--md-sys-spacing-16) 0;
            text-align: left;
        }
        
        .rewards-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
        }
        
        @media (min-width: 768px) {
            .rewards-container { grid-template-columns: repeat(2, 1fr); }
        }
        
        @media (min-width: 1024px) {
            .rewards-container { grid-template-columns: repeat(3, 1fr); }
        }
    `;

    constructor() {
        super();
        this.boardData = null;
        this._unsubscribeBoard = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this._unsubscribeBoard = boardService.onCurrentBoardUpdated(boardData => {
            this.boardData = boardData;
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._unsubscribeBoard) {
            this._unsubscribeBoard();
        }
    }

    _handleRewardClick(rewardId) {
        boardService.toggleRewardSelection(rewardId);
    }
    
    _handleRequestConfirmation(e, reward) {
        e.stopPropagation();
        const user = userService.getCurrentUser();
        // rewardId is passed from the card usually, but here we can pass it from loop
        // The event from reward-card will have bubbles: true, but we can simplify by handling logic here if we pass data down or listen on item.
        // Actually, listener on element in template is cleaner.
        
        const rewardLabel = reward.name || reward.label || 'Récompense';
        const rewardCost = reward.cost;
        
        if (user && user.isParent) {
             this.dispatchEvent(new CustomEvent('show-confirmation-modal', {
                bubbles: true,
                composed: true,
                detail: {
                    title: `Valider "${rewardLabel}" ?`,
                    message: `Cela coûtera ${rewardCost} renards et marquera la récompense comme utilisée.`,
                    onConfirm: () => {
                        boardService.validateReward(reward.id);
                    }
                }
            }));
        }
    }

    render() {
        if (!this.boardData) {
            return html`
                <div class="empty-message">Aucun tableau sélectionné</div>
            `;
        }

        const { totalToken, availableToken, rewards } = this.boardData;
        const rewardsList = rewards ? Object.values(rewards) : [];

        // Sort
        rewardsList.sort((a, b) => {
            if (a.cost !== b.cost) return a.cost - b.cost;
            const nameA = a.name || a.label || '';
            const nameB = b.name || b.label || '';
            return nameA.localeCompare(nameB);
        });

        return html`
            <renard-counter total="${availableToken}"></renard-counter>
            <section>
                <h2>Les Récompenses</h2>
                <div class="rewards-container">
                    ${repeat(rewardsList, (reward) => reward.id, (reward) => html`
                        <reward-card
                            id="${reward.id}"
                            label="${reward.name || reward.label || 'Récompense'}"
                            cost="${reward.cost}"
                            emoji="${reward.icon || reward.emoji || '🎁'}"
                            available-token="${availableToken}"
                            ?pending="${reward.pending}"
                            @click="${() => this._handleRewardClick(reward.id)}"
                            @request-confirmation="${(e) => this._handleRequestConfirmation(e, reward)}"
                        ></reward-card>
                    `)}
                </div>
            </section>
        `;
    }
}

customElements.define('reward-board', RewardBoard);
