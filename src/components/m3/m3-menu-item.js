
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
                
                /* Selected State: Match primary-tonal button style */
                button.selected {
                    background-color: var(--md-sys-color-primary-container);
                    color: var(--md-sys-color-on-primary-container);
                    font-weight: 700; 
                }
                
                button.selected m3-icon {
                     color: inherit;
                }

                /* Hover / Focus States */
                /* Unselected hover: Subtle tint, default text */
                button:not(.selected):hover:not(:disabled),
                button:not(.selected):focus-visible {
                    background-color: rgba(0, 0, 0, 0.04); 
                    color: var(--md-sys-color-on-surface);
                    outline: none;
                }
                
                /* Selected hover: Darken background slightly, keep text color */
                button.selected:hover:not(:disabled),
                button.selected:focus-visible {
                     background-color: var(--md-sys-color-primary-container);
                     /* Add a linear gradient or filter to darken? Or just rely on state layer if we had one. 
                        Since we hid state-layer, let's use a filter or manual darkening.
                        Actually, primary-container is light. Darkening it a bit is correct.
                        Let's use a pseudo-element overlay approach or just filter. */
                     filter: brightness(0.95);
                     color: var(--md-sys-color-on-primary-container);
                     outline: none;
                }

                /* State Layer - Still hidden to avoid "blocky overlay", using direct bg manipulation above */
                .state-layer {
                    display: none;
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
