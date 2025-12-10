// src/components/app-bar.js
import { userService } from '../services/user-service.js';
import { boardService } from '../services/board-service.js';
import './user-info.js';
import './m3/m3-icon.js';
import './board-selector.js';

class AppBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.unsubscribeBoard = () => { };
        this.currentBoardName = '...';
        this.currentBoardId = null;
        this.isParent = false;
    }

    connectedCallback() {
        const currentUser = userService.getCurrentUser();
        this.isParent = currentUser && currentUser.isParent;

        this._render();

        this.unsubscribeBoard = boardService.onCurrentBoardUpdated(boardData => {
            if (boardData) {
                this.currentBoardName = boardData.owner;
                this.currentBoardId = boardData.id;
                this._updateBoardSelector();
            }
        });
    }

    disconnectedCallback() {
        this.unsubscribeBoard();
    }

    _updateBoardSelector() {
        const selector = this.shadowRoot.querySelector('board-selector');
        if (selector) {
            selector.setAttribute('board-name', this.currentBoardName);
            selector.setAttribute('board-id', this.currentBoardId || '');
        }
    }

    _render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                   display: block;
                   width: 100%;
                }

                /* Title Styles */
                h1 {
                   margin: 0;
                   font: var(--md-sys-typescale-title-large);
                   color: var(--md-sys-color-on-surface);
                   white-space: nowrap;
                   overflow: hidden;
                   text-overflow: ellipsis;
                }

                /* Mobile: Hide Title ONLY if we have a selector to show (Parents) */
                @media (max-width: 600px) {
                    h1.hide-on-mobile {
                        display: none;
                    }
                }
            </style>
            <m3-app-bar>
                <div slot="start">
                   <!-- Title (Hidden on Mobile ONLY if parent) -->
                   <h1 class="${this.isParent ? 'hide-on-mobile' : ''}">La Chasse aux Renards</h1>
                </div>

                <div slot="center">
                    ${this.isParent
                ? `
                        <!-- Board Selector: Centers on Desktop, Shifts Left on Mobile -->
                        <board-selector 
                            id="board-switcher" 
                            board-name="${this.currentBoardName}"
                            board-id="${this.currentBoardId}">
                        </board-selector>
                        `
                : ``
            }
                </div>

                <div slot="end">
                    <user-info></user-info>
                </div>
            </m3-app-bar>
        `;
    }
}

customElements.define('app-bar', AppBar);
