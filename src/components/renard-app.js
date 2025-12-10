import { userService } from '../services/user-service.js';
import { boardService } from '../services/board-service.js';
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
                        background-color: var(--md-sys-color-surface-container-high); /* Matched to App Bar */
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

                    @media (min-width: 768px) {
                        .content-container {
                            max-width: 768px; /* md:max-w-3xl */
                            /* Removed: background, radius, shadow, margin-top */
                        }
                    }

                    @media (min-width: 1024px) {
                        .content-container {
                            max-width: 1024px; /* lg:max-w-5xl */
                        }
                    }
                    
                    m3-fab {
                        position: fixed;
                        bottom: var(--md-sys-spacing-24);
                        right: var(--md-sys-spacing-24);
                        z-index: 50;
                    }

                    /* App Bar Wrapper - Full Width */
                    .app-bar-wrapper {
                        position: sticky;
                        top: 0;
                        z-index: 100;
                        background-color: var(--md-sys-color-surface-container-high); /* Or surface */
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
