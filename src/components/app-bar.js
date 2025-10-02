import { boardService } from '../services/board-service.js';
import { userService } from '../services/user-service.js';

class AppBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.boardData = null;
        this.unsubscribe = () => {};
    }

    connectedCallback() {
        this.render();
        const user = userService.getCurrentUser();
        if (user && user.isParent) {
            this.unsubscribe = boardService.onCurrentBoardUpdated(boardData => {
                this.boardData = boardData;
                this.render();
            });
        }
    }

    disconnectedCallback() {
        this.unsubscribe();
    }

    render() {
        const user = userService.getCurrentUser();

        this.shadowRoot.innerHTML = `
            <style>
                header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 2rem;
                    background-color: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                h1 {
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: #D97706;
                    margin: 0;
                }
                .left-content {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }
            </style>
            <header>
                <div class="left-content">
                    <h1>La Chasse aux Renards</h1>
                    ${user && user.isParent ? '<board-selector></board-selector>' : ''}
                </div>
                <user-info></user-info>
            </header>
        `;

        if (this.boardData) {
            const boardSelector = this.shadowRoot.querySelector('board-selector');
            if (boardSelector) {
                boardSelector.setAttribute('board-name', this.boardData.owner);
                boardSelector.setAttribute('board-id', this.boardData.id);
            }
        }
    }
}

customElements.define('app-bar', AppBar);