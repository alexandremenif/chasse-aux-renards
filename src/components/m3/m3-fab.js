
import './m3-icon.js';
import './m3-ripple.js';

export class M3Fab extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open', delegatesFocus: true });
    }

    static get observedAttributes() {
        return ['size', 'icon'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const size = this.getAttribute('size') || 'medium'; // medium (default/56dp), small (40dp), large (96dp)
        const iconName = this.getAttribute('icon');
        const iconPath = this.getAttribute('svg-path');

        let iconContent = '';
        if (iconName) {
            iconContent = `<m3-icon name="${iconName}" size="${size === 'large' ? '36px' : '24px'}"></m3-icon>`;
        } else if (iconPath) {
             iconContent = `<m3-icon svg-path="${iconPath}" size="${size === 'large' ? '36px' : '24px'}"></m3-icon>`;
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                }
                button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    background-color: var(--md-sys-color-primary);
                    color: var(--md-sys-color-on-primary);
                    cursor: pointer;
                    transition: box-shadow var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard), 
                                transform var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
                    box-shadow: var(--md-sys-elevation-3);
                    position: relative;
                    overflow: hidden;
                    isolation: isolate;
                }

                /* State Layer Overlay */
                button::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background-color: var(--md-sys-color-on-primary);
                    opacity: 0;
                    z-index: 0;
                }

                button:hover:not(:disabled)::after {
                    opacity: var(--md-sys-state-hover-state-layer-opacity);
                }
                button:focus-visible:not(:disabled)::after {
                    opacity: var(--md-sys-state-focus-state-layer-opacity);
                }
                /* Active state handled by ripple */

                button:focus-visible {
                    outline: var(--md-sys-state-focus-ring-width) solid var(--md-sys-state-focus-ring-color);
                    outline-offset: var(--md-sys-state-focus-ring-offset);
                }
                
                /* Medium FAB (Default 56dp) */
                .medium {
                    width: 56px;
                    height: 56px;
                    border-radius: var(--md-sys-shape-corner-large);
                }
                
                /* Real M3 Large FAB (96dp) */
                .large {
                    width: 96px;
                    height: 96px;
                    border-radius: var(--md-sys-shape-corner-extra-large);
                }
                
                /* Small FAB (40dp) */
                .small {
                    width: 40px;
                    height: 40px;
                    border-radius: var(--md-sys-shape-corner-medium);
                }

                button:hover {
                     /* Elevation 4 */
                     box-shadow: var(--md-sys-elevation-4);
                     /* No scale transform for standard M3 */
                }

                button:active {
                     box-shadow: var(--md-sys-elevation-3);
                }

                /* Ensure icon is above state layer & ripple */
                m3-icon {
                    z-index: 2;
                    position: relative;
                    pointer-events: none;
                }
            </style>
            <button class="${size}" aria-label="${this.getAttribute('aria-label') || 'Floating action button'}">
                <m3-ripple style="z-index: 3;"></m3-ripple>
                ${iconContent}
            </button>
        `;
    }
}

customElements.define('m3-fab', M3Fab);
