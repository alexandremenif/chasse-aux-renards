// src/components/app-bar.js
import { userService } from '../services/user-service.js';
import { boardService } from '../services/board-service.js';
import './user-info.js';
import './board-selector.js';

class AppBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.unsubscribeBoard = () => {};
    }

    connectedCallback() {
        const currentUser = userService.getCurrentUser();
        this._render(currentUser);

        this.unsubscribeBoard = boardService.onCurrentBoardUpdated(boardData => {
            if (boardData) {
                const boardSelector = this.shadowRoot.querySelector('board-selector');
                if (boardSelector) {
                    boardSelector.setAttribute('board-name', boardData.owner);
                    boardSelector.setAttribute('board-id', boardData.id);
                }
            }
        });
    }

    disconnectedCallback() {
        this.unsubscribeBoard();
    }

    _render(user) {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    padding: 1rem;
                    box-sizing: border-box;
                }
                header {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    align-items: center;
                    gap: 1rem; /* Add some space between columns */
                }
                
                .center-content {
                    grid-column: 2;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }

                .user-info-container {
                    grid-column: 3;
                    justify-self: end;
                }

                h1 {
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: #D97706; /* text-amber-600 */
                    margin: 0;
                    white-space: nowrap;
                    text-align: center;
                }

                /* On smaller screens, we can adjust the title size if needed */
                @media (max-width: 768px) {
                    h1 {
                        font-size: 1.25rem;
                    }
                    header {
                        gap: 0.5rem;
                    }
                }
            </style>
            <header>
                <div class="center-content">
                    <h1>La Chasse aux Renards</h1>
                    <div class="board-selector-container"></div>
                </div>
                <div class="user-info-container">
                    <user-info></user-info>
                </div>
            </header>
        `;

        if (user && user.isParent) {
            this.shadowRoot.querySelector('.board-selector-container').innerHTML = '<board-selector></board-selector>';
        }
    }
}

customElements.define('app-bar', AppBar);
