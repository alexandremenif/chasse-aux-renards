// components/board-selector.js
import { userService } from '../services/user-service.js';

class BoardSelector extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isParent = false;
        this.boardId = null;
    }

    static get observedAttributes() {
        return ['board-name', 'board-id'];
    }

    connectedCallback() {
        this.isParent = userService.getCurrentUser().isParent;
        
        this.render();
        this._attachEventListeners();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'board-id') {
            this.boardId = newValue;
        }
        this.render();
        this._attachEventListeners();
    }

    render() {
        const boardName = this.getAttribute('board-name') || '...';
        const displayName = `${boardName}`;

        this.shadowRoot.innerHTML = `
            <style>
                :host { font-family: inherit; }
                .selector-display {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    border-radius: 0.5rem;
                    transition: color 0.2s ease-in-out;
                }
                .selector-display.clickable {
                    cursor: pointer;
                }
                .selector-display.clickable:hover .display-name {
                    color: #D97706; /* amber-600 */
                }
                .display-name {
                    font-size: 1.25rem;
                    color: #64748B; /* slate-500 */
                    margin: 0; /* Ensure no default margin */
                }
                .arrow {
                    width: 1rem;
                    height: 1rem;
                    stroke-width: 3;
                    stroke: currentColor;
                    display: ${this.isParent ? 'inline-block' : 'none'};
                }
            </style>

            <div class="selector-display ${this.isParent ? 'clickable' : ''}">
                <div class="display-name">${displayName}</div>
                <svg class="arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </div>
        `;
    }

    _attachEventListeners() {
        if (this.isParent) {
            this.shadowRoot.querySelector('.selector-display').addEventListener('click', () => {
                const modal = document.querySelector('board-selection-modal');
                if (modal) {
                    modal.setAttribute('selected-board-id', this.boardId);
                    modal.setAttribute('visible', 'true');
                }
            });
        }
    }
}

customElements.define('board-selector', BoardSelector);
