import './m3-ripple.js';
export class M3Button extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open', delegatesFocus: true });
    }

    static get observedAttributes() {
        return ['variant', 'disabled', 'icon', 'label'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }

    render() {
        const variant = this.getAttribute('variant') || 'filled'; // filled, tonal, text, outlined
        const disabled = this.hasAttribute('disabled');
        const label = this.getAttribute('label') || '';
        const icon = this.getAttribute('icon') || '';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    font-family: var(--md-sys-typescale-label-large);
                }
                button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--md-sys-spacing-8);
                    height: 40px;
                    border-radius: var(--md-sys-shape-corner-full);
                    padding: 0 var(--md-sys-spacing-24);
                    font: var(--md-sys-typescale-label-large);
                    cursor: pointer;
                    border: none;
                    transition: box-shadow var(--md-sys-motion-duration-short) ease, background-color var(--md-sys-motion-duration-short) ease;
                    outline: none;
                    position: relative;
                    overflow: hidden;
                    isolation: isolate;
                }
                
                /* Focus Ring */
                button:focus-visible {
                    outline: var(--md-sys-state-focus-ring-width) solid var(--md-sys-state-focus-ring-color);
                    outline-offset: var(--md-sys-state-focus-ring-offset);
                }

                /* State Layer Overlay */
                button::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background-color: currentColor; /* Default, overridden per variant */
                    opacity: 0;
                    transition: opacity var(--md-sys-motion-duration-short) ease;
                    pointer-events: none;
                    z-index: 1;
                }

                button:hover:not(:disabled)::after {
                    opacity: var(--md-sys-state-hover-state-layer-opacity);
                }
                button:focus-visible:not(:disabled)::after {
                    opacity: var(--md-sys-state-focus-state-layer-opacity);
                }
                button:active:not(:disabled)::after {
                    opacity: var(--md-sys-state-pressed-state-layer-opacity);
                }
                
                button:disabled {
                    cursor: not-allowed;
                    opacity: 0.38;
                    box-shadow: none !important; /* Remove elevation when disabled */
                }

                /* Variants */
                .filled {
                    background-color: var(--md-sys-color-primary);
                    color: var(--md-sys-color-on-primary);
                    box-shadow: var(--md-sys-elevation-0);
                }
                .filled::after { background-color: var(--md-sys-color-on-primary); }

                .filled:hover:not(:disabled) {
                    box-shadow: var(--md-sys-elevation-1);
                }
                .filled:active:not(:disabled) {
                    box-shadow: var(--md-sys-elevation-0); /* Depress on click */
                }

                .tonal {
                    background-color: var(--md-sys-color-secondary-container);
                    color: var(--md-sys-color-on-secondary-container);
                }
                .tonal::after { background-color: var(--md-sys-color-on-secondary-container); }

                .tonal:hover:not(:disabled) {
                    box-shadow: var(--md-sys-elevation-1);
                }
                .tonal:active:not(:disabled) {
                    box-shadow: var(--md-sys-elevation-0);
                }

                .primary-tonal {
                    background-color: var(--md-sys-color-primary-container);
                    color: var(--md-sys-color-on-primary-container);
                }
                .primary-tonal::after { background-color: var(--md-sys-color-on-primary-container); }

                .primary-tonal:hover:not(:disabled) {
                    box-shadow: var(--md-sys-elevation-1);
                }

                .text {
                    background-color: transparent;
                    color: var(--md-sys-color-primary);
                    padding: 0 var(--md-sys-spacing-12);
                }
                .text::after { background-color: var(--md-sys-color-primary); }

                .outlined {
                    background-color: transparent;
                    border: 1px solid var(--md-sys-color-outline);
                    color: var(--md-sys-color-primary);
                }
                .outlined::after { background-color: var(--md-sys-color-primary); }
                
                .outlined:hover:not(:disabled) {
                    border-color: var(--md-sys-color-primary);
                    background-color: rgba(var(--md-sys-color-primary-rgb), 0.08); /* Fallback or ensure state layer is enough */
                }
                .outlined:focus-visible {
                    border-color: var(--md-sys-color-primary);
                }

                /* Icon adjustments */
                .has-icon {
                    padding-left: var(--md-sys-spacing-16);
                }
                ::slotted(m3-icon) {
                    font-size: 18px;
                    z-index: 2; /* Ensure icon is above state layer */
                    position: relative;
                }
                .label, ::slotted(*) {
                     z-index: 2; /* Ensure content is above state layer */
                     position: relative;
                }
            </style>
            <button class="${variant} ${icon ? 'has-icon' : ''}" ${disabled ? 'disabled' : ''}>
                <div class="state-layer"></div>
                ${!disabled ? '<m3-ripple></m3-ripple>' : ''}
                ${icon ? `<slot name="icon"></slot>` : ''}
                <span class="label">${label}</span>
                <slot></slot>
            </button>
        `;
    }
}

customElements.define('m3-button', M3Button);
