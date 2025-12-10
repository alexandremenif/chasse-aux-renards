import { userService } from '../services/user-service.js';
import { boardService } from '../services/board-service.js';
import { M3Breakpoints } from './m3/m3-breakpoints.js';
import './login-page.js';
import './app-bar.js';
import './reward-board.js';
import './confirmation-modal.js';


// M3 Components
import './m3/m3-fab.js';
import './m3/m3-app-bar.js';

class RenardApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.user = undefined; // Initial state: unknown
        this._unsubscribeUser = () => { };
    }

    connectedCallback() {
        this._unsubscribeUser = userService.onUserChanged(user => {
            this.user = user;
            this._render();
            if (this.user) {
                this._attachEventListeners();
            }
        });
    }

    disconnectedCallback() {
        this._unsubscribeUser();
    }

    _attachEventListeners() {


        this.shadowRoot.addEventListener('show-confirmation-modal', (event) => {
            const modal = this.shadowRoot.querySelector('confirmation-modal');
            if (modal) {
                modal.setAttribute('title', event.detail.title);
                modal.setAttribute('message', event.detail.message);
                modal.addEventListener('confirmed', event.detail.onConfirm, { once: true });
                modal.setAttribute('visible', 'true');
            }
        });

        if (this.user && this.user.isParent) {
            const fab = this.shadowRoot.querySelector('m3-fab');
            if (fab) {
                fab.addEventListener('click', () => {
                    boardService.addToken();
                });
            }
        }
    }

    _render() {
        if (this.user === undefined) {
            this.shadowRoot.innerHTML = '';
            return;
        }

        if (this.user === null) {
            this.shadowRoot.innerHTML = `<login-page></login-page>`;
        } else {
            const isParent = this.user.isParent;

            // New M3 Layout
            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: block;
                        background-color: var(--md-sys-color-surface-container); /* Matched to App Bar */
                        min-height: 100vh;
                        padding-bottom: var(--md-sys-spacing-96); /* Space for FAB */
                    }
                    
                    /* Utility for Centered Content */
                    .content-container {
                        width: 100%;
                        margin: 0 auto;
                        padding: var(--md-sys-spacing-16);
                        box-sizing: border-box;
                    }

                    @media (min-width: ${M3Breakpoints.EXPANDED}) {
                        .content-container {
                            max-width: ${M3Breakpoints.EXPANDED}; /* Expanded Start */
                            /* Removed: background, radius, shadow, margin-top */
                        }
                    }

                    @media (min-width: ${M3Breakpoints.LARGE}) {
                        .content-container {
                            max-width: ${M3Breakpoints.LARGE}; /* Large Start */
                        }
                    }
                    
                    m3-fab {
                        position: fixed;
                        bottom: var(--md-sys-spacing-24);
                        right: var(--md-sys-spacing-24);
                        z-index: var(--md-sys-z-index-fab);
                    }

                    /* App Bar Wrapper - Full Width */
                    .app-bar-wrapper {
                        position: sticky;
                        top: 0;
                        z-index: var(--md-sys-z-index-app-bar);
                        background-color: var(--md-sys-color-surface-container); /* Or surface */
                        width: 100%;
                    }
                </style>

                <!-- Full Width App Bar -->
                <div class="app-bar-wrapper">
                    <app-bar></app-bar>
                </div>
            
                <!-- Centered Content -->
                <div class="content-container">
                    <reward-board></reward-board>
                </div>

                <!-- FAB triggers the add token action (Parent Only) -->
                ${isParent ? `<m3-fab id="fab-add" size="medium"></m3-fab>` : ''}

                <!-- Modals -->
                <confirmation-modal id="confirmation-modal"></confirmation-modal>
            `;
        }
    }
}

customElements.define('renard-app', RenardApp);
