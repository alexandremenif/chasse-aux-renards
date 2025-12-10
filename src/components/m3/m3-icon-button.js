import './m3-ripple.js';
import './m3-icon.js';

export class M3IconButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['icon', 'disabled', 'variant', 'selected'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const icon = this.getAttribute('icon') || '';
        const disabled = this.hasAttribute('disabled');
        const variant = this.getAttribute('variant') || 'standard'; // standard, filled, tonal, outlined
        const selected = this.hasAttribute('selected');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                }
                
                button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    padding: 0;
                    border: none;
                    cursor: pointer;
                    background-color: transparent;
                    color: var(--md-sys-color-on-surface-variant);
                    position: relative;
                    overflow: hidden;
                    outline: none;
                    transition: background-color 0.2s, color 0.2s;
                }

                button:disabled {
                    cursor: not-allowed;
                    opacity: 0.38;
                }
                
                /* State Layer */
                button::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background-color: currentColor;
                    opacity: 0;
                    transition: opacity 0.2s;
                    pointer-events: none;
                }
                
                button:hover:not(:disabled)::after {
                    opacity: var(--md-sys-state-hover-state-layer-opacity);
                }
                button:active:not(:disabled)::after {
                    opacity: var(--md-sys-state-pressed-state-layer-opacity);
                }

                /* Variants */
                .standard {
                    color: var(--md-sys-color-on-surface-variant);
                }
                :host([selected]) .standard {
                    color: var(--md-sys-color-primary);
                }

                .filled {
                    background-color: var(--md-sys-color-primary);
                    color: var(--md-sys-color-on-primary);
                }
                :host([selected]) .filled {
                    background-color: var(--md-sys-color-primary);
                    color: var(--md-sys-color-on-primary);
                }
                .filled:hover:not(:disabled) {
                    /* Elevation handled by shadow usually, simplified here */
                }

                .tonal {
                    background-color: var(--md-sys-color-secondary-container);
                    color: var(--md-sys-color-on-secondary-container);
                }
                :host([selected]) .tonal {
                    background-color: var(--md-sys-color-secondary-container); /* Typically changes for selected */
                }

                .outlined {
                    border: 1px solid var(--md-sys-color-outline);
                    color: var(--md-sys-color-on-surface-variant);
                }
                :host([selected]) .outlined {
                    background-color: var(--md-sys-color-inverse-surface);
                    color: var(--md-sys-color-inverse-on-surface);
                    border: none;
                }

                m3-icon {
                    font-size: 24px;
                    position: relative;
                    z-index: 1;
                }
            </style>
            
            <button class="${variant}" ${disabled ? 'disabled' : ''} aria-label="${icon}">
                <m3-ripple></m3-ripple>
                <div class="state-layer"></div>
                ${icon ? `<m3-icon name="${icon}"></m3-icon>` : '<slot></slot>'}
            </button>
        `;
    }
}

customElements.define('m3-icon-button', M3IconButton);
