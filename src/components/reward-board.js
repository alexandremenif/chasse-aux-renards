
// components/reward-board.js
import { userService } from '../services/user-service.js';
import { boardService } from '../services/board-service.js';
import './renard-counter.js';
import './reward-card.js';

class RewardBoard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.unsubscribeBoard = () => { };
        this.boardData = null;
    }

    connectedCallback() {
        // Initial render (empty state)
        this._render();

        this.unsubscribeBoard = boardService.onCurrentBoardUpdated(boardData => {
            this.boardData = boardData;
            this._render();
        });
    }

    disconnectedCallback() {
        this.unsubscribeBoard();
    }

    _render() {
        if (!this.boardData) {
            this.shadowRoot.innerHTML = `
                <style>
                    :host { display: block; padding: var(--md-sys-spacing-24); text-align: center; color: var(--md-sys-color-on-surface-variant); font: var(--md-sys-typescale-body-large); }
                </style>
                <div>Aucun tableau sélectionné</div>
            `;
            return;
        }

        const { totalToken, availableToken, rewards } = this.boardData;

        // 1. Setup Shell specific for RewardBoard (if not exists)
        // Check if we have the structure already
        let container = this.shadowRoot.querySelector('.rewards-container');
        if (!container) {
            this.shadowRoot.innerHTML = `
                <style>
                    :host { display: block; }
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
                </style>
                <renard-counter total="0"></renard-counter>
                <section>
                    <h2>Les Récompenses</h2>
                    <div class="rewards-container"></div>
                </section>
            `;
            container = this.shadowRoot.querySelector('.rewards-container');
        }

        // Update Counter
        const counter = this.shadowRoot.querySelector('renard-counter');
        if (counter && counter.getAttribute('total') !== String(availableToken)) {
            counter.setAttribute('total', availableToken);
        }

        const rewardsList = rewards ? Object.values(rewards) : [];

        // Sort
        rewardsList.sort((a, b) => {
            if (a.cost !== b.cost) return a.cost - b.cost;
            const nameA = a.name || a.label || '';
            const nameB = b.name || b.label || '';
            return nameA.localeCompare(nameB);
        });

        // 2. DOM Diffing / Reuse
        // Create a map of existing elements by ID
        const existingCards = new Map();
        Array.from(container.children).forEach(el => {
            if (el.tagName.toLowerCase() === 'reward-card') {
                existingCards.set(el.getAttribute('id'), el);
            }
        });

        const seenIds = new Set();

        rewardsList.forEach((reward, index) => {
            const id = String(reward.id);
            seenIds.add(id);

            let card = existingCards.get(id);
            const label = reward.name || reward.label || 'Récompense';
            const cost = String(reward.cost);
            const emoji = reward.icon || reward.emoji || '🎁';
            const pending = !!reward.pending;

            if (!card) {
                // Create new card
                card = document.createElement('reward-card');
                card.setAttribute('id', id);

                // Add event listeners ONCE upon creation
                this._attachCardListeners(card);
            }

            // OPTIMIZATION: Only move/append if not already in the correct slot
            // This prevents disconnectedCallback/connectedCallback from firing on stable nodes,
            // which prevents CSS animations (scaleIn) from resetting!
            const currentChildAtIndex = container.children[index];
            if (currentChildAtIndex !== card) {
                if (currentChildAtIndex) {
                    container.insertBefore(card, currentChildAtIndex);
                } else {
                    container.appendChild(card);
                }
            }
            // Else: It's already in the right spot, DO NOT TOUCH IT.

            // Update attributes only if changed
            if (card.getAttribute('label') !== label) card.setAttribute('label', label);
            if (card.getAttribute('cost') !== cost) card.setAttribute('cost', cost);
            if (card.getAttribute('emoji') !== emoji) card.setAttribute('emoji', emoji);
            if (card.getAttribute('available-token') !== String(availableToken)) {
                card.setAttribute('available-token', availableToken);
            }

            // Pending State
            if (pending) {
                if (!card.hasAttribute('pending')) card.setAttribute('pending', '');
            } else {
                if (card.hasAttribute('pending')) card.removeAttribute('pending');
            }
        });

        // 3. Remove stale cards
        existingCards.forEach((card, id) => {
            if (!seenIds.has(id)) {
                card.remove();
            }
        });
    }

    _attachCardListeners(card) {
        // 1. General Click = Toggle Selection
        card.addEventListener('click', () => {
            const rewardId = card.getAttribute('id');
            boardService.toggleRewardSelection(rewardId);
        });

        // 2. Button Click = Request Confirmation
        card.addEventListener('request-confirmation', (e) => {
            e.stopPropagation();
            const user = userService.getCurrentUser();
            const rewardId = card.getAttribute('id');
            const rewardLabel = card.getAttribute('label');
            const rewardCost = parseInt(card.getAttribute('cost'), 10);

            if (user.isParent) {
                this.dispatchEvent(new CustomEvent('show-confirmation-modal', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        title: `Valider "${rewardLabel}" ?`,
                        message: `Cela coûtera ${rewardCost} renards et marquera la récompense comme utilisée.`,
                        onConfirm: () => {
                            boardService.validateReward(rewardId);
                        }
                    }
                }));
            }
        });
    }
}

customElements.define('reward-board', RewardBoard);
