// components/confirmation-modal.js

class ConfirmationModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this._attachEventListeners();
    }

    static get observedAttributes() {
        return ['title', 'message', 'visible'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        if (name === 'title' && this.shadowRoot.querySelector('.modal-title')) {
            this.shadowRoot.querySelector('.modal-title').textContent = newValue;
        }
        if (name === 'message' && this.shadowRoot.querySelector('.modal-text')) {
            this.shadowRoot.querySelector('.modal-text').innerHTML = newValue;
        }
        if (name === 'visible') {
            this.style.display = this.hasAttribute('visible') ? 'flex' : 'none';
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    inset: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: none; /* Masqué par défaut */
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    z-index: 50;
                }
                :host([visible]) {
                    display: flex; /* Affiché si l'attribut 'visible' est présent */
                }
                .modal-content {
                    background-color: white;
                    border-radius: 1rem;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    padding: 2rem;
                    max-width: 24rem;
                    width: 100%;
                    text-align: center;
                    font-family: inherit;
                }
                .modal-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
                .modal-text {
                    color: #475569;
                    margin-bottom: 1.5rem;
                }
                .modal-actions {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                }
                .modal-button {
                    font-weight: 700;
                    padding: 0.5rem 1.5rem;
                    border-radius: 9999px;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.15s ease-in-out;
                }
                .modal-cancel-btn {
                    background-color: #E2E8F0;
                    color: #1E293B;
                }
                .modal-cancel-btn:hover { background-color: #CBD5E1; }
                .modal-confirm-btn {
                    background-color: #22C55E;
                    color: white;
                }
                .modal-confirm-btn:hover { background-color: #16A34A; }
            </style>
            <div class="modal-content">
                <h3 class="modal-title">${this.getAttribute('title') || ''}</h3>
                <p class="modal-text">${this.getAttribute('message') || ''}</p>
                <div class="modal-actions">
                    <button class="modal-button modal-cancel-btn">Annuler</button>
                    <button class="modal-button modal-confirm-btn">Confirmer</button>
                </div>
            </div>
        `;
    }

    _attachEventListeners() {
        const cancelButton = this.shadowRoot.querySelector('.modal-cancel-btn');
        const confirmButton = this.shadowRoot.querySelector('.modal-confirm-btn');

        cancelButton.addEventListener('click', () => this._onCancel());
        confirmButton.addEventListener('click', () => this._onConfirm());
        
        // Clic sur le fond pour annuler
        this.addEventListener('click', (e) => {
            if (e.target === this) {
                this._onCancel();
            }
        });
    }

    _onConfirm() {
        this.removeAttribute('visible');
        this.dispatchEvent(new CustomEvent('confirmed'));
    }

    _onCancel() {
        this.removeAttribute('visible');
        this.dispatchEvent(new CustomEvent('cancelled'));
    }
}

customElements.define('confirmation-modal', ConfirmationModal);
