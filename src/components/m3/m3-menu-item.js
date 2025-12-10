
import './m3-ripple.js';
import './m3-icon.js';

export class M3MenuItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['label', 'icon', 'disabled', 'selected', 'preserve-icon-space'];
    }

    connectedCallback() {
        this.setAttribute('role', 'menuitem');
        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', this.hasAttribute('disabled') ? '-1' : '0');
        }
        
        this.render();

        this.addEventListener('keydown', this.handleKeyDown.bind(this));

        // Ensure click toggles selection if managed externally? 
        // For now, simple presentational component.
    }

    attributeChangedCallback() {
        this.render();
    }

    handleKeyDown(e) {
        if (this.hasAttribute('disabled')) return;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    }

    render() {
        const label = this.getAttribute('label') || '';
        const icon = this.getAttribute('icon') || '';
        const disabled = this.hasAttribute('disabled');
        const selected = this.hasAttribute('selected');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    outline: none;
                    /* Allow overriding colors via properties */
                }
                
                button {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    margin: 0;
                    height: 48px;
                    padding: 0 12px;
                    border: none;
                    background: none;
                    border-radius: 0;
                    text-align: left;
                    font: var(--md-sys-typescale-label-large);
                    color: var(--md-sys-color-on-surface);
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    gap: 12px;
                    box-sizing: border-box;
                    transition: background-color 0.2s;
                }
                
                button:disabled {
                    cursor: not-allowed;
                    color: var(--md-sys-color-on-surface);
                    opacity: 0.38;
                }
                
                /* Selected State */
                button.selected {
                    background-color: var(--md-sys-color-primary-container);
                    color: var(--md-sys-color-on-primary-container);
                    font-weight: 700; 
                }
                
                button.selected m3-icon {
                     color: inherit;
                }
                
                /* State Layer for Selected */
                button.selected::after {
                    background-color: var(--md-sys-color-on-primary-container);
                    opacity: 0; 
                }

                /* State Layer Overlay */
                button::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background-color: currentColor;
                    opacity: 0;
                    transition: opacity var(--md-sys-motion-duration-short) ease;
                    pointer-events: none;
                    z-index: 1;
                }

                /* Hover */
                button:hover:not(:disabled):not(.selected)::after {
                    opacity: var(--md-sys-state-hover-state-layer-opacity);
                }
                button.selected:hover:not(:disabled)::after {
                    opacity: var(--md-sys-state-hover-state-layer-opacity);
                }
                
                /* Focus Visible (Host) */
                :host(:focus-visible) button::after {
                    opacity: var(--md-sys-state-focus-state-layer-opacity);
                }

                /* We override the button focus logic since button won't receive focus directly now */
                button:focus-visible {
                    outline: none;
                }
                
                /* Active state handled by ripple */
                
                /* Selected hover: Darken via filter */
                /* Selected hover: Darken via state layer now, removed filter */
                button.selected:hover:not(:disabled) {
                     /* No filter needed, state layer handles it */ 
                }

                .state-layer {
                    display: none; /* We are handling states via ::after for consistency */
                }

                m3-icon {
                   /* Icon color inheritance */
                   color: inherit;
                }
                
                .label {
                    flex: 1;
                }
            </style>
            <button class="${selected ? 'selected' : ''}" ${disabled ? 'disabled' : ''} tabindex="-1">
                <div class="state-layer"></div>
                ${!disabled ? '<m3-ripple></m3-ripple>' : ''}
                ${icon
                ? (icon.includes(' ')
                    ? `<m3-icon svg-path="${icon}" size="20px"></m3-icon>`
                    : `<m3-icon name="${icon}" size="20px"></m3-icon>`)
                : (this.hasAttribute('preserve-icon-space')
                    ? `<div style="width: 20px; height: 20px;"></div>`
                    : '')
            }
                <span class="label">
                    ${label}
                    <slot></slot>
                </span>
            </button>
        `;
    }
}

customElements.define('m3-menu-item', M3MenuItem);
