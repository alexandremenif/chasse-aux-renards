
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
        const iconAttr = this.getAttribute('icon');
        const defaultPlusPath = "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z";

        // Use attribute if provided (SVG path), otherwise default
        const iconPath = iconAttr || defaultPlusPath;

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
                button:active:not(:disabled)::after {
                    opacity: var(--md-sys-state-pressed-state-layer-opacity);
                }

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
                    /* transform: scale(0.95); - Removing active scale as well for consistency */
                     /* Reset to base elevation on press? Or keep? M3 usually lower elevation */
                     box-shadow: var(--md-sys-elevation-3);
                }

                /* Ensure icon is above state layer & ripple */
                m3-icon {
                    z-index: 2;
                    position: relative;
                    pointer-events: none;
                }
            </style>
            <button class="${size}">
                <m3-ripple style="z-index: 3;"></m3-ripple>
                <m3-icon svg-path="${iconPath}" size="24px"></m3-icon>
            </button>
        `;
    }
}

customElements.define('m3-fab', M3Fab);
