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
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .title-container, .user-info-container, .board-selector-container {
                    flex: 1;
                }
                .title-container {
                    display: flex;
                    justify-content: flex-start;
                }
                .board-selector-container {
                    display: flex;
                    justify-content: center;
                }
                .user-info-container {
                    display: flex;
                    justify-content: flex-end;
                }
                h1 {
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: #D97706; /* text-amber-600 */
                    margin: 0;
                    white-space: nowrap;
                }
            </style>
            <header>
                <div class="title-container">
                    <h1>La Chasse aux Renards</h1>
                </div>
                <div class="board-selector-container"></div>
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
