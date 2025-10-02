// components/board-selection-modal.js
import { userService } from '../services/user-service.js';
import { boardService } from '../services/board-service.js';

class BoardSelectionModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.userBoards = [];
        this.selectedBoardId = null;
        this.isVisible = false;
    }

    connectedCallback() {
        this._render(); // Initial render (hidden)
    }

    open(boardId) {
        this.selectedBoardId = boardId;
        this.isVisible = true;
        this.userBoards = userService.getCurrentUser().boards || [];
        this._render();
    }

    hide() {
        this.isVisible = false;
        this._render();
    }

    _render() {
        const isVisible = this.isVisible;
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
                .board-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .board-button {
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
                .board-button:hover {
                    background-color: #F1F5F9;
                }
                .board-button.selected {
                    background-color: #FEF3C7;
                    color: #B45309;
                }
            </style>
            
            <div class="modal">
                <div class="modal-content">
                    <h3 class="modal-title">Changer de tableau</h3>
                    <div class="board-list">
                        ${this.userBoards.map(board => `
                            <button class="board-button ${board.id === this.selectedBoardId ? 'selected' : ''}" data-id="${board.id}">
                                ${board.owner}
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

        this.shadowRoot.querySelectorAll('.board-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const boardId = e.currentTarget.dataset.id;
                boardService.selectCurrentBoard(boardId);
                this.hide();
            });
        });
    }
}

customElements.define('board-selection-modal', BoardSelectionModal);
