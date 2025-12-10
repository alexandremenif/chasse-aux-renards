
export class M3Dialog extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._handleCancel = this._handleCancel.bind(this);
        this._handleClose = this._handleClose.bind(this);
        this._handleBackdropClick = this._handleBackdropClick.bind(this);
    }

    static get observedAttributes() {
        return ['visible', 'headline'];
    }

    connectedCallback() {
        this.render();
        this._dialog = this.shadowRoot.querySelector('dialog');
        
        // Native dialog events
        this._dialog.addEventListener('cancel', this._handleCancel);
        this._dialog.addEventListener('close', this._handleClose);
        this._dialog.addEventListener('click', this._handleBackdropClick);

        // Sync initial state
        this._updateVisibility();
    }

    disconnectedCallback() {
        if (this._dialog) {
            this._dialog.removeEventListener('cancel', this._handleCancel);
            this._dialog.removeEventListener('close', this._handleClose);
            this._dialog.removeEventListener('click', this._handleBackdropClick);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'visible' && oldValue !== newValue) {
            this._updateVisibility();
        } else if (name === 'headline' && oldValue !== newValue) {
             const headlineEl = this.shadowRoot.querySelector('.headline');
             if (headlineEl) headlineEl.textContent = newValue || '';
        }
    }

    _updateVisibility() {
        if (!this._dialog) return;

        const isVisible = this.getAttribute('visible') === 'true';
        const isOpen = this._dialog.open;

        if (isVisible && !isOpen) {
            this._dialog.showModal();
            // Animation handling could go here if we want entry animations beyond default
            this._dialog.classList.add('visible');
        } else if (!isVisible && isOpen) {
            // optional: animate out before closing? 
            // For now, keep it simple effectively to match native behavior
             this._dialog.classList.remove('visible');
            this._dialog.close();
        }
    }

    // Handle 'Escape' key (native cancel event)
    _handleCancel(e) {
        e.preventDefault(); // Prevent immediate close to allow us to control state
        this.setAttribute('visible', 'false');
    }

    // Handle when dialog closes (programmatically or via form method="dialog")
    _handleClose() {
        if (this.getAttribute('visible') === 'true') {
             this.setAttribute('visible', 'false');
        }
    }

    // Handle click on ::backdrop (it registers as a click on the dialog element)
    _handleBackdropClick(e) {
        const rect = this._dialog.getBoundingClientRect();
        const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                          rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
        
        if (!isInDialog) {
            this.setAttribute('visible', 'false');
        }
    }

    render() {
        const headline = this.getAttribute('headline') || '';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: contents; /* logic wrapper only */
                }

                dialog {
                    background-color: var(--md-sys-color-surface-container-high);
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
                    background-color: rgba(0, 0, 0, 0.4);
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
            </style>
            <dialog>
                <div class="icon-header">
                    <slot name="icon"></slot>
                </div>
                ${headline ? `<h2 class="headline">${headline}</h2>` : ''}
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
