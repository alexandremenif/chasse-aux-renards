import { userService } from '../services/user-service.js';
import { confirmationService } from '../services/confirmation-service.js';
import { boardSelectionService } from '../services/board-selection-service.js';

class RenardApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.user = null;
    }

    connectedCallback() {
        this.render();
        userService.onUserChanged(user => {
            this.user = user;
            this.render();
        });
    }

    render() {
        if (this.user) {
            this.shadowRoot.innerHTML = `
                <app-bar></app-bar>
                <main>
                    <reward-board></reward-board>
                    <add-renard-button id="add-renard-btn"></add-renard-button>
                </main>
                <confirmation-modal></confirmation-modal>
                <board-selection-modal></board-selection-modal>
            `;
            const confirmationModal = this.shadowRoot.querySelector('confirmation-modal');
            confirmationService.registerModal(confirmationModal);

            const boardSelectionModal = this.shadowRoot.querySelector('board-selection-modal');
            boardSelectionService.registerModal(boardSelectionModal);
        } else {
            this.shadowRoot.innerHTML = `<login-page></login-page>`;
        }
    }
}

customElements.define('renard-app', RenardApp);