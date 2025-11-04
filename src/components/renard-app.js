
import { userService } from '../services/user-service.js';
import './login-page.js';
import './app-bar.js';
import './reward-board.js';
import './add-renard-button.js';
import './confirmation-modal.js';
import './board-selection-modal.js';

class RenardApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.user = undefined; // Initial state: unknown
        this._unsubscribeUser = () => {};
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
        this.shadowRoot.addEventListener('show-board-selection-modal', (event) => {
            const modal = this.shadowRoot.querySelector('board-selection-modal');
            if (modal) {
                modal.setAttribute('selected-board-id', event.detail.boardId);
                modal.setAttribute('visible', 'true');
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

    _render() {

        if (this.user === undefined) {
            // Auth state is unknown, render nothing.
            this.shadowRoot.innerHTML = '';
            return;
        }

        if (this.user === null) {
            // User is known to be logged out.
            this.shadowRoot.innerHTML = `<login-page></login-page>`;
        } else {
            // User is logged in.
            this.shadowRoot.innerHTML = `
                <style>
                    add-renard-button {
                        position: fixed;
                        bottom: 2rem;
                        right: 2rem;
                        z-index: 50;
                    }
                </style>
                <app-bar></app-bar>
                <reward-board></reward-board>
                <add-renard-button id="add-renard-btn"></add-renard-button>
                <confirmation-modal id="confirmation-modal"></confirmation-modal>
                <board-selection-modal></board-selection-modal>
            `;
        }
    }
}

customElements.define('renard-app', RenardApp);
