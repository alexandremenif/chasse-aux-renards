
import './m3-icon.js';
import './m3-ripple.js';

export class M3Fab extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
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
        const size = this.getAttribute('size') || 'large'; // large (default), small
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
                
                /* Large FAB (Default 56dp) */
                .large {
                    width: 56px;
                    height: 56px;
                    border-radius: var(--md-sys-shape-corner-large);
                }
                
                /* Small FAB (40dp) */
                .small {
                    width: 40px;
                    height: 40px;
                    border-radius: var(--md-sys-shape-corner-medium);
                }

                button:hover {
                     /* Simulated Elevation 4 (Slightly stronger than El 3) */
                     box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15);
                     transform: scale(1.05); 
                }

                button:active {
                    transform: scale(0.95);
                     /* Reset to base elevation on press? Or keep? M3 usually lowers elevation or spreads it. 
                        Let's standard M3 behavior: Pressed likely keeps simple. */
                }

                /* Ensure icon is above state layer */
                m3-icon {
                    z-index: 2;
                    position: relative;
                }
            </style>
            <button class="${size}">
                <div class="state-layer"></div>
                <m3-ripple></m3-ripple>
                <m3-icon svg-path="${iconPath}" size="24px"></m3-icon>
            </button>
        `;
    }
}

customElements.define('m3-fab', M3Fab);
