import { LitElement, html, css, unsafeCSS } from 'lit';
import { M3Breakpoints } from './m3-breakpoints.js';

export class M3Dialog extends LitElement {
    static properties = {
        visible: { type: Boolean, reflect: true }, // Boolean attribute for internal state checks
        headline: { type: String },
    };

    static styles = css`
        :host {
            display: contents; /* logic wrapper only */
        }

        dialog {
            background-color: var(--md-sys-color-surface-container);
            border-radius: var(--md-sys-shape-corner-extra-large);
            padding: var(--md-sys-spacing-24);
            box-sizing: border-box;
            width: calc(100% - (var(--md-sys-spacing-24) * 2));
            max-width: 560px;
            min-width: 280px;
            border: none;
            outline: none;
            box-shadow: var(--md-sys-elevation-3);
            
            display: flex;
            flex-direction: column;
            gap: var(--md-sys-spacing-16);

            /* Layout fixes for native dialog */
            margin: auto;
            color: var(--md-sys-color-on-surface);
            
            opacity: 0;
            transform: scale(0.9);
            transition: opacity 0.15s var(--md-sys-motion-easing-standard), 
                        transform 0.15s var(--md-sys-motion-easing-standard),
                        display 0.15s allow-discrete, overlay 0.15s allow-discrete;
        }

        dialog[open] {
            opacity: 1;
            transform: scale(1);
        }
        
        /* Starting Style for Entry Animation (Newer browsers) */
        @starting-style {
            dialog[open] {
                opacity: 0;
                transform: scale(0.9);
            }
        }

        dialog::backdrop {
            background-color: rgba(0, 0, 0, 0.32);
            opacity: 0;
            transition: opacity 0.2s linear, display 0.2s allow-discrete, overlay 0.2s allow-discrete;
        }

        dialog[open]::backdrop {
            opacity: 1;
        }
        
        @starting-style {
            dialog[open]::backdrop {
                opacity: 0;
            }
        }

        .icon-header {
            align-self: center;
            margin-bottom: var(--md-sys-spacing-8);
            color: var(--md-sys-color-secondary);
        }

        .headline {
            margin: 0;
            text-align: center;
            font: var(--md-sys-typescale-headline-small);
            color: var(--md-sys-color-on-surface);
        }

        .content {
            font: var(--md-sys-typescale-body-medium);
            color: var(--md-sys-color-on-surface-variant);
            text-align: center;
        }

        .actions {
            display: flex;
            justify-content: flex-end;
            gap: var(--md-sys-spacing-8);
            margin-top: var(--md-sys-spacing-8);
        }
        
        .actions.stacked {
            flex-direction: column;
        }

        @media (max-width: ${unsafeCSS(M3Breakpoints.COMPACT)}) {
            .actions {
                flex-direction: column-reverse;
                align-items: stretch;
            }
            /* Target slotted buttons to full width */
            .actions ::slotted(*) {
                width: 100%;
            }
        }
    `;

    // Private Methods in Class Body (no binding needed if using arrow functions or proper event handling)
    
    constructor() {
        super();
        // Lit handles listener binding automatically in template if using arrow functions or this reference
    }

    connectedCallback() {
        super.connectedCallback();
        // Sync initial state is handled by updated lifecycle
    }

    updated(changedProperties) {
        if (changedProperties.has('visible')) {
            this.#updateVisibility();
        }
    }

    get #dialog() {
        return this.shadowRoot.querySelector('dialog');
    }

    #updateVisibility() {
        if (!this.#dialog) return;

        const isVisible = this.visible;
        const isOpen = this.#dialog.open;

        if (isVisible && !isOpen) {
            this.#dialog.showModal();
            this.#dialog.classList.add('visible');
        } else if (!isVisible && isOpen) {
             this.#dialog.classList.remove('visible');
             this.#dialog.close();
        }
    }

    // Handle 'Escape' key (native cancel event)
    #handleCancel(e) {
        e.preventDefault(); // Prevent immediate close to allow us to control state
        this.visible = false;
    }

    // Handle when dialog closes (programmatically or via form method="dialog")
    #handleClose() {
        if (this.visible) {
             this.visible = false;
        }
    }

    // Handle click on ::backdrop (it registers as a click on the dialog element)
    #handleBackdropClick(e) {
        const rect = this.#dialog.getBoundingClientRect();
        const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                          rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
        
        if (!isInDialog) {
            this.visible = false;
        }
    }

    render() {
        return html`
            <dialog 
                @cancel="${(e) => this.#handleCancel(e)}"
                @close="${() => this.#handleClose()}"
                @click="${(e) => this.#handleBackdropClick(e)}"
            >
                <div class="icon-header">
                    <slot name="icon"></slot>
                </div>
                ${this.headline ? html`<h2 class="headline">${this.headline}</h2>` : ''}
                <div class="content">
                    <slot></slot>
                </div>
                <div class="actions">
                    <slot name="actions"></slot>
                </div>
            </dialog>
        `;
    }
}

customElements.define('m3-dialog', M3Dialog);
