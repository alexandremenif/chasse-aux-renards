// components/child-selector.js

class ChildSelector extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isModalOpen = false;
        this.data = { children: [], currentChildId: null };
        this.isParentMode = false;
    }

    // --- Properties for receiving data ---
    set componentData(data) {
        this.data = data;
        this.render();
    }

    set parentMode(isParent) {
        this.isParentMode = isParent;
        this.render();
    }

    connectedCallback() {
        this.render();
    }
    
    // --- Render method ---
    render() {
        const currentChild = this.data.children.find(c => c.id === this.data.currentChildId);
        const displayName = currentChild ? `de ${currentChild.name}` : '';
        const isClickable = this.isParentMode;

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
                    color: #D97706;
                }
                .display-name {
                    font-size: 1.25rem;
                    color: #64748B;
                }
                .arrow {
                    width: 1rem;
                    height: 1rem;
                    stroke-width: 3;
                    stroke: currentColor;
                    display: ${isClickable ? 'inline-block' : 'none'};
                }

                /* Modal Styles */
                .modal {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    z-index: 50;
                }
                .modal.visible {
                    display: flex;
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
                }
                .child-button:hover {
                    background-color: #F1F5F9;
                }
                .child-button.selected {
                    background-color: #FEF3C7;
                    color: #B45309;
                }
            </style>

            <div class="selector-display ${isClickable ? 'clickable' : ''}">
                <p class="display-name">${displayName}</p>
                <svg class="arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
            </div>
            
            <div class="modal ${this.isModalOpen ? 'visible' : ''}">
                <div class="modal-content">
                    <h3 class="modal-title">Changer de profil</h3>
                    <div class="child-list">
                        ${this.data.children.map(child => `
                            <button class="child-button ${child.id === this.data.currentChildId ? 'selected' : ''}" data-id="${child.id}">
                                ${child.name}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        this._attachEventListeners();
    }

    // --- Event Handling ---
    _attachEventListeners() {
        this.shadowRoot.querySelector('.selector-display').addEventListener('click', () => {
            if (this.isParentMode) this.openModal();
        });

        const modal = this.shadowRoot.querySelector('.modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        this.shadowRoot.querySelectorAll('.child-button').forEach(button => {
            button.addEventListener('click', (e) => this._selectChild(e));
        });
    }

    _selectChild(e) {
        const childId = parseInt(e.currentTarget.dataset.id, 10);
        this.dispatchEvent(new CustomEvent('child-selected', { detail: { childId } }));
        this.closeModal();
    }

    openModal() {
        this.isModalOpen = true;
        this.render();
    }

    closeModal() {
        this.isModalOpen = false;
        this.render();
    }
}

customElements.define('child-selector', ChildSelector);
