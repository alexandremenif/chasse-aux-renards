
import { LitElement, html, css, unsafeCSS } from 'lit';
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

class RenardApp extends LitElement {
    static properties = {
        user: { type: Object },
        boardReady: { type: Boolean }
    };

    static styles = css`
        :host {
            display: block;
            background-color: var(--md-sys-color-surface-container);
            min-height: 100vh;
        }

        .loading-container {
             height: 100vh;
             width: 100vw;
             overflow: hidden;
        }
        
        m3-loading-indicator.center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .app-container {
            padding-bottom: var(--md-sys-spacing-96); /* Space for FAB */
        }
        
        /* Utility for Centered Content */
        reward-board {
            display: block;
            width: 100%;
            margin: 0 auto;
            padding: var(--md-sys-spacing-16);
            box-sizing: border-box;
        }

        @media (min-width: ${unsafeCSS(M3Breakpoints.EXPANDED)}) {
            reward-board {
                max-width: ${unsafeCSS(M3Breakpoints.EXPANDED)};
            }
        }

        @media (min-width: ${unsafeCSS(M3Breakpoints.LARGE)}) {
            reward-board {
                max-width: ${unsafeCSS(M3Breakpoints.LARGE)};
            }
        }
        
        m3-fab {
            position: fixed;
            bottom: var(--md-sys-spacing-24);
            right: var(--md-sys-spacing-24);
            z-index: var(--md-sys-z-index-fab);
        }
    `;

    // Private Fields
    #unsubscribeUser = () => { };
    #unsubscribeBoard = () => { };

    constructor() {
        super();
        this.user = undefined; // Initial state: unknown
        this.boardReady = false; // Phase 3 check
    }

    connectedCallback() {
        super.connectedCallback();
        this.#unsubscribeUser = userService.onUserChanged(user => {
            this.user = user;
            
            // If user is logged out, we don't care about board
            if (!this.user) {
                this.boardReady = false;
            }
        });

        // We also need to know when board data is ready to switch Phase 2 -> 3
        this.#unsubscribeBoard = boardService.onCurrentBoardUpdated(boardData => {
             if (this.user) {
                 this.boardReady = true;
             }
        });

        this.addEventListener('show-confirmation-modal', (event) => {
            const modal = this.shadowRoot.querySelector('#confirmation-modal');
            if (modal) {
                modal.setAttribute('title', event.detail.title);
                modal.setAttribute('message', event.detail.message);
                modal.addEventListener('confirmed', event.detail.onConfirm, { once: true });
                modal.setAttribute('visible', 'true');
            }
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.#unsubscribeUser();
        this.#unsubscribeBoard();
    }

    #onAddToken() {
        boardService.addToken();
    }

    render() {
        // Phase 1: Checking User
        if (this.user === undefined) {
             return html`
                <div class="loading-container">
                    <app-bar></app-bar>
                    <m3-loading-indicator class="center"></m3-loading-indicator>
                </div>
            `;
        }

        // Phase 1b: Login
        if (this.user === null) {
            return html`<login-page></login-page>`;
        }

        // Phase 2: User Found, Board Loading
        // We show the "Shell" (Enabled AppBar) but content is still loading indicator
        if (!this.boardReady && this.user.boards && this.user.boards.length > 0) {
             return html`
                <div class="app-container">
                    <app-bar></app-bar>
                    <m3-loading-indicator class="center"></m3-loading-indicator>
                </div>
            `;
        }

        // Phase 3: Board Ready (or User has no boards)
        const isParent = this.user.isParent;

        return html`
            <div class="app-container">
                <app-bar></app-bar>
                <reward-board></reward-board>

                ${isParent ? html`
                    <m3-fab id="fab-add" size="medium" icon="add" @click="${this.#onAddToken}"></m3-fab>
                ` : ''}

                <confirmation-modal id="confirmation-modal"></confirmation-modal>
            </div>
        `;
    }
}

customElements.define('renard-app', RenardApp);
