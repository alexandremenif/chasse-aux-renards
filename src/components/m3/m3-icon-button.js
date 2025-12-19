import { LitElement, html, css, nothing } from 'lit';
import './m3-ripple.js';
import './m3-icon.js';

export class M3IconButton extends LitElement {
    static properties = {
        icon: { type: String },
        disabled: { type: Boolean, reflect: true },
        variant: { type: String }, // standard, filled, tonal, outlined
        selected: { type: Boolean, reflect: true },
        label: { type: String },
        ariaLabel: { type: String, attribute: 'aria-label' }
    };

    static styles = css`
        :host {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 48px; /* Touch target */
            height: 48px; /* Touch target */
            vertical-align: middle;
        }
        
        button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px; /* Visual size */
            height: 40px; /* Visual size */
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

        button:focus-visible {
            outline: var(--md-sys-state-focus-ring-width) solid var(--md-sys-state-focus-ring-color);
            outline-offset: var(--md-sys-state-focus-ring-offset);
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
        /* Active state handled by ripple */
        button:focus-visible:not(:disabled)::after {
            opacity: var(--md-sys-state-focus-state-layer-opacity);
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
    `;

    constructor() {
        super();
        this.variant = 'standard';
    }

    render() {
        // A11y: Propagate label from host to button
        const effectiveLabel = this.ariaLabel || this.label || this.icon;

        return html`
            <button 
                class="${this.variant}" 
                ?disabled="${this.disabled}" 
                aria-label="${effectiveLabel || nothing}"
            >
                <m3-ripple></m3-ripple>
                ${this.icon 
                    ? html`<m3-icon name="${this.icon}"></m3-icon>` 
                    : html`<slot></slot>`}
            </button>
        `;
    }
}

customElements.define('m3-icon-button', M3IconButton);
