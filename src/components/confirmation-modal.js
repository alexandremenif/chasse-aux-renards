
// components/confirmation-modal.js
import './m3/m3-dialog.js';
import './m3/m3-button.js';

class ConfirmationModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['visible', 'title', 'message'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // Efficient update: Don't re-render entire shadow DOM
        // Just update the target custom element properties
        if (name === 'visible') {
            const dialog = this.shadowRoot.querySelector('m3-dialog');
            if (dialog) dialog.setAttribute('visible', newValue);
        } else if (name === 'title') {
            const dialog = this.shadowRoot.querySelector('m3-dialog');
            if (dialog) dialog.setAttribute('headline', newValue);
        } else if (name === 'message') {
            const msgEl = this.shadowRoot.getElementById('msg-body');
            if (msgEl) msgEl.textContent = newValue;
        } else {
            this.render();
        }
    }

    close() {
        this.setAttribute('visible', 'false');
    }

    render() {
        // Initial Render Only
        if (this.shadowRoot.querySelector('m3-dialog')) return;

        const visible = this.getAttribute('visible') || 'false';
        const modalTitle = this.getAttribute('title') || 'Confirmation';
        const message = this.getAttribute('message') || 'Êtes-vous sûr ?';

        this.shadowRoot.innerHTML = `
            <m3-dialog visible="${visible}" headline="${modalTitle}">
                <!-- Icon removed per user request -->
                <p id="msg-body">${message}</p>
                <div slot="actions">
                    <m3-button variant="text" label="Annuler" id="cancel-btn"></m3-button>
                    <m3-button variant="text" label="Confirmer" id="confirm-btn"></m3-button>
                </div>
            </m3-dialog>
        `;

        const cancelBtn = this.shadowRoot.querySelector('#cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
        }

        const confirmBtn = this.shadowRoot.querySelector('#confirm-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('confirmed'));
                this.close();
            });
        }
    }
}

customElements.define('confirmation-modal', ConfirmationModal);
