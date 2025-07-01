// components/child-selector.js
import { userStore } from '../stores/user-store.js';

class ChildSelector extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isParentMode = false;
        this.childId = null;
        this.unsubscribeUser = () => {};
    }

    static get observedAttributes() {
        return ['child-name', 'child-id'];
    }

    connectedCallback() {
        this.unsubscribeUser = userStore.onAuthenticatedUser(userData => {
            this.isParentMode = userData.role === 'parent';
            this.render();
            this._attachEventListeners();
        });
        this.render();
        this._attachEventListeners();
    }

    disconnectedCallback() {
        this.unsubscribeUser();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'child-id') {
            this.childId = newValue;
        }
        this.render();
        this._attachEventListeners();
    }

    render() {
        const childName = this.getAttribute('child-name') || '...';
        const displayName = `de ${childName}`;

        this.shadowRoot.innerHTML = `
            <style>
                :host { font-family: inherit; }
                .selector-display {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem;
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
                }
                .arrow {
                    width: 1rem;
                    height: 1rem;
                    stroke-width: 3;
                    stroke: currentColor;
                    display: ${this.isParentMode ? 'inline-block' : 'none'};
                }
            </style>

            <div class="selector-display ${this.isParentMode ? 'clickable' : ''}">
                <p class="display-name">${displayName}</p>
                <svg class="arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </div>
        `;
    }

    _attachEventListeners() {
        if (this.isParentMode) {
            this.shadowRoot.querySelector('.selector-display').addEventListener('click', () => {
                const modal = document.querySelector('child-selection-modal');
                if (modal) {
                    modal.setAttribute('selected-child-id', this.childId);
                    modal.setAttribute('visible', 'true');
                }
            });
        }
    }
}

customElements.define('child-selector', ChildSelector);
