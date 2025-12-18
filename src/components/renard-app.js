import { userService } from '../services/user-service.js';
import { boardService } from '../services/board-service.js';
import { M3Breakpoints } from './m3/m3-breakpoints.js';
import './login-page.js';
import './app-bar.js';
import './reward-board.js';
import './confirmation-modal.js';
import './m3/m3-loading-indicator.js';

// M3 Components
import './m3/m3-fab.js';
import './m3/m3-app-bar.js';

class RenardApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.user = undefined; // Initial state: unknown
        this.boardReady = false; // Phase 3 check
        this._unsubscribeUser = () => { };
        this._unsubscribeBoard = () => { };
    }

    connectedCallback() {
        this._unsubscribeUser = userService.onUserChanged(user => {
            this.user = user;
            
            // If user is logged out, we don't care about board
            if (!this.user) {
                this.boardReady = false;
            }
            
            this._render();
        });

        // We also need to know when board data is ready to switch Phase 2 -> 3
        this._unsubscribeBoard = boardService.onCurrentBoardUpdated(boardData => {
            // We consider the board "ready" if we have data OR if we know for sure there is no board selected (null)
            // If data is null, it means no board selected or loading. 
            // But boardService initializes with null.
            // We need to distinguish "initial null" from "no board selected".
            // However, boardService logic: 
            // onUserChanged -> selectCurrentBoard -> fires null (clearing) -> loads -> fires data.
            // If user has no boards, it fires null.
            
            // For simplicity/robustness:
            // If user exists but boardData is null, we might be loading OR have no board.
            // If user has boards, we expect data.
            // Let's rely on a simple check: if we receive an update, we can considered "loaded" regarding the initial fetch.
            // BUT: onCurrentBoardUpdated fires immediately with current value.
            // If initial value is null, we might flash loading then empty. 
            // In Phase 2 (User Found), the board service should have started loading.
            
            // Let's assume if we get ANY non-undefined update after user is resolved, we are "ready" to show board content (or empty state).
             if (this.user) {
                 this.boardReady = true;
                 this._render();
             }
        });

        this.shadowRoot.addEventListener('show-confirmation-modal', (event) => {
            const modal = this.shadowRoot.querySelector('confirmation-modal');
            if (modal) {
                modal.setAttribute('title', event.detail.title);
                modal.setAttribute('message', event.detail.message);
                modal.addEventListener('confirmed', event.detail.onConfirm, { once: true });
                modal.setAttribute('visible', 'true');
            }
        });
    }

    disconnectedCallback() {
        this._unsubscribeUser();
        this._unsubscribeBoard();
    }

    _render() {
        // Phase 1: Checking User
        if (this.user === undefined) {
            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: block;
                        background-color: var(--md-sys-color-surface-container);
                        height: 100vh;
                        width: 100vw;
                        overflow: hidden;
                    }
                    m3-loading-indicator {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                    }
                </style>
                <app-bar></app-bar>
                <m3-loading-indicator></m3-loading-indicator>
            `;
            return;
        }

        // Phase 1b: Login
        if (this.user === null) {
            this.shadowRoot.innerHTML = `<login-page></login-page>`;
            return;
        }

        // Phase 2: User Found, Board Loading
        // We show the "Shell" (Enabled AppBar) but content is still loading indicator
        if (!this.boardReady && this.user.boards && this.user.boards.length > 0) {
             this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: block;
                        background-color: var(--md-sys-color-surface-container);
                        min-height: 100vh;
                    }
                    
                    m3-loading-indicator {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                    }
                </style>
                <app-bar></app-bar>
                <m3-loading-indicator></m3-loading-indicator>
            `;
            return;
        }

        // Phase 3: Board Ready (or User has no boards)
        // OPTIMIZATION: If the board shell is already rendered, don't re-render entire innerHTML.
        // This prevents blowing away the DOM (and running animations/focus) on every data update.
        if (this.shadowRoot.querySelector('reward-board')) {
            return;
        }

        const isParent = this.user.isParent;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    background-color: var(--md-sys-color-surface-container);
                    min-height: 100vh;
                    padding-bottom: var(--md-sys-spacing-96); /* Space for FAB */
                }
                
                /* Utility for Centered Content */
                reward-board {
                    width: 100%;
                    margin: 0 auto;
                    padding: var(--md-sys-spacing-16);
                    box-sizing: border-box;
                }

                @media (min-width: ${M3Breakpoints.EXPANDED}) {
                    reward-board {
                        max-width: ${M3Breakpoints.EXPANDED};
                    }
                }

                @media (min-width: ${M3Breakpoints.LARGE}) {
                    reward-board {
                        max-width: ${M3Breakpoints.LARGE};
                    }
                }
                
                m3-fab {
                    position: fixed;
                    bottom: var(--md-sys-spacing-24);
                    right: var(--md-sys-spacing-24);
                    z-index: var(--md-sys-z-index-fab);
                }
            </style>

            <app-bar></app-bar>
            <reward-board></reward-board>

            ${isParent ? `<m3-fab id="fab-add" size="medium" icon="add"></m3-fab>` : ''}

            <confirmation-modal id="confirmation-modal"></confirmation-modal>
        `;

        if (isParent) {
            const fab = this.shadowRoot.getElementById('fab-add');
            if (fab) {
                fab.addEventListener('click', () => {
                    boardService.addToken();
                });
            }
        }
    }
}

customElements.define('renard-app', RenardApp);
