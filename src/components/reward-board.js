
// components/reward-board.js
import { LitElement, html, css, unsafeCSS } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { userService } from '../services/user-service.js';
import { boardService } from '../services/board-service.js';
import { M3Breakpoints } from './m3/m3-breakpoints.js';
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
        
        @media (min-width: ${unsafeCSS(M3Breakpoints.MEDIUM)}) {
            .rewards-container { grid-template-columns: repeat(2, 1fr); }
        }
        
        @media (min-width: ${unsafeCSS(M3Breakpoints.EXPANDED)}) {
            .rewards-container { grid-template-columns: repeat(3, 1fr); }
        }
    `;

    // Private Fields
    #unsubscribeBoard = null;

    constructor() {
        super();
        this.boardData = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.#unsubscribeBoard = boardService.onCurrentBoardUpdated(boardData => {
            this.boardData = boardData;
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.#unsubscribeBoard) {
            this.#unsubscribeBoard();
        }
    }

    #handleRewardClick(rewardId) {
        boardService.toggleRewardSelection(rewardId);
    }
    
    #handleRequestConfirmation(e, reward) {
        const user = userService.getCurrentUser();
        const rewardLabel = reward.name || reward.label || 'Récompense';
        const rewardCost = reward.cost;
        
        if (user?.isParent) {
             this.dispatchEvent(new CustomEvent('show-confirmation-modal', {
                bubbles: false,
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

        const { availableToken, rewards } = this.boardData;
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
                            @click="${() => this.#handleRewardClick(reward.id)}"
                            @request-confirmation="${(e) => this.#handleRequestConfirmation(e, reward)}"
                        ></reward-card>
                    `)}
                </div>
            </section>
        `;
    }
}

customElements.define('reward-board', RewardBoard);
