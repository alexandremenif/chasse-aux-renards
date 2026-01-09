import { LitElement, html, css } from 'lit';
import './m3-icon.js';
import './m3-ripple.js';

export class M3Fab extends LitElement {
    static properties = {
        size: { type: String },
        icon: { type: String },
        svgPath: { type: String, attribute: 'svg-path' },
        ariaLabel: { type: String, attribute: 'aria-label' }
    };

    static styles = css`
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
            width: var(--md-sys-component-fab-medium-size, 56px);
            height: var(--md-sys-component-fab-medium-size, 56px);
            border-radius: var(--md-sys-shape-corner-large);
        }
        
        /* Real M3 Large FAB (96dp) */
        .large {
            width: var(--md-sys-component-fab-large-size, 96px);
            height: var(--md-sys-component-fab-large-size, 96px);
            border-radius: var(--md-sys-shape-corner-extra-large);
        }
        
        /* Small FAB (40dp) */
        .small {
            width: var(--md-sys-component-fab-small-size, 40px);
            height: var(--md-sys-component-fab-small-size, 40px);
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
    `;

    constructor() {
        super();
        this.size = 'medium';
    }

    render() {
        const iconSize = this.size === 'large' ? '36px' : '24px';
        
        let iconContent = html``;
        if (this.icon) {
            iconContent = html`<m3-icon name="${this.icon}" size="${iconSize}"></m3-icon>`;
        } else if (this.svgPath) {
             iconContent = html`<m3-icon svg-path="${this.svgPath}" size="${iconSize}"></m3-icon>`;
        }

        return html`
            <button class="${this.size || 'medium'}" aria-label="${this.ariaLabel || 'Floating action button'}">
                <m3-ripple style="z-index: 3;"></m3-ripple>
                ${iconContent}
            </button>
        `;
    }
}

customElements.define('m3-fab', M3Fab);
