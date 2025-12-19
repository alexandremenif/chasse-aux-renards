// components/confirmation-modal.js
import { LitElement, html, css } from 'lit';
import './m3/m3-dialog.js';
import './m3/m3-button.js';

class ConfirmationModal extends LitElement {
    static properties = {
        visible: { type: Boolean, reflect: true },
        title: { type: String },
        message: { type: String }
    };

    static styles = css`
        /* No specific host styles needed, usually handled by m3-dialog within */
    `;

    constructor() {
        super();
        this.title = 'Confirmation';
        this.message = 'Êtes-vous sûr ?';
    }

    close() {
        this.visible = false;
    }

    #handleConfirm() {
        this.dispatchEvent(new CustomEvent('confirmed'));
        this.close();
    }

    render() {
        return html`
            <m3-dialog ?visible="${this.visible}" headline="${this.title}">
                <!-- Icon removed per user request -->
                <p id="msg-body">${this.message}</p>
                <div slot="actions">
                    <m3-button variant="text" label="Annuler" id="cancel-btn" @click="${this.close}"></m3-button>
                    <m3-button variant="text" label="Confirmer" id="confirm-btn" @click="${() => this.#handleConfirm()}"></m3-button>
                </div>
            </m3-dialog>
        `;
    }
}

customElements.define('confirmation-modal', ConfirmationModal);
