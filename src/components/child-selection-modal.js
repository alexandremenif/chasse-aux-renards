// components/child-selection-modal.js
import { userStore } from '../stores/user-store.js';
import { rewardBoardStore } from '../stores/reward-board-store.js';

class ChildSelectionModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.userChildren = [];
        this.selectedChildId = null;
        this.unsubscribeUser = () => {};
    }

    static get observedAttributes() {
        return ['visible', 'selected-child-id'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(name, oldValue, newValue)
        if (name === 'visible' && newValue !== null) {
            this.show();
        } else if (name === 'visible' && newValue === null) {
            console.log("hide")
            this.hide();
        }
        
        if (name === 'selected-child-id' && oldValue !== newValue) {
            this.selectedChildId = newValue;
        }

        this._render();
    }

    connectedCallback() {
        this._render(); // Initial render (hidden)
    }

    disconnectedCallback() {
        this.unsubscribeUser();
    }
    
    show() {
        // When shown, subscribe to the user store to get the list of children
        this.unsubscribeUser = userStore.onAuthenticatedUser(userData => {
            this.userChildren = userData.children || [];
            this._render();
        });
    }

    hide() {
        this.unsubscribeUser();
        // The component removes its own 'visible' attribute to hide itself
        if (this.hasAttribute('visible')) {
            this.removeAttribute('visible');
        }
    }

    _render() {
        const isVisible = this.hasAttribute('visible');
        this.shadowRoot.innerHTML = `
            <style>
                .modal {
                    display: ${isVisible ? 'flex' : 'none'};
                    position: fixed;
                    inset: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    z-index: 50;
                }
                .modal-content {
                    background-color: white;
                    border-radius: 1rem;
                    padding: 2rem;
                    max-width: 24rem;
                    width: 100%;
                    text-align: center;
                }
                .modal-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0 0 1.5rem 0;
                }
                .child-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .child-button {
                    width: 100%;
                    text-align: left;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    font-weight: 700;
                    border: none;
                    background-color: transparent;
                    cursor: pointer;
                    font-size: 1rem;
                }
                .child-button:hover {
                    background-color: #F1F5F9;
                }
                .child-button.selected {
                    background-color: #FEF3C7;
                    color: #B45309;
                }
            </style>
            
            <div class="modal">
                <div class="modal-content">
                    <h3 class="modal-title">Changer de profil</h3>
                    <div class="child-list">
                        ${this.userChildren.map(child => `
                            <button class="child-button ${child.id === this.selectedChildId ? 'selected' : ''}" data-id="${child.id}">
                                ${child.name}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        this._attachEventListeners();
    }

    _attachEventListeners() {
        const modal = this.shadowRoot.querySelector('.modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hide();
                }
            });
        }

        this.shadowRoot.querySelectorAll('.child-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const childId = e.currentTarget.dataset.id;
                rewardBoardStore.selectCurrentChild(childId);
                this.hide(); // Hide after selection
            });
        });
    }
}

customElements.define('child-selection-modal', ChildSelectionModal);
