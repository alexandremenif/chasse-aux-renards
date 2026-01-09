import { LitElement, html, css, nothing } from 'lit';
import './m3-ripple.js';
import './m3-icon.js';

export class M3MenuItem extends LitElement {
    static properties = {
        label: { type: String },
        icon: { type: String },
        disabled: { type: Boolean, reflect: true },
        selected: { type: Boolean, reflect: true },
        preserveIconSpace: { type: Boolean, attribute: 'preserve-icon-space' }
    };

    static styles = css`
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
            transition: background-color var(--md-sys-motion-duration-short);
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
            transition: opacity var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
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
    `;

    constructor() {
        super();
        this.#boundHandleKeyDown = (e) => this.#handleKeyDown(e);
    }
    
    // Private
    #boundHandleKeyDown;

    connectedCallback() {
        super.connectedCallback();
        this.setAttribute('role', 'menuitem');
        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', this.disabled ? '-1' : '0');
        }
        this.addEventListener('keydown', this.#boundHandleKeyDown);
    }

    /* Lit handles attribute changes in properties */

    #handleKeyDown(e) {
        if (this.disabled) return;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    }

    render() {
        let iconContent = html``;
        
        if (this.icon) {
            iconContent = this.icon.includes(' ')
                ? html`<m3-icon svg-path="${this.icon}" size="20px"></m3-icon>`
                : html`<m3-icon name="${this.icon}" size="20px"></m3-icon>`;
        } else if (this.preserveIconSpace) {
            iconContent = html`<div style="width: 20px; height: 20px;"></div>`;
        }

        return html`
            <button class="${this.selected ? 'selected' : ''}" ?disabled="${this.disabled}" tabindex="-1">
                <div class="state-layer"></div>
                ${!this.disabled ? html`<m3-ripple></m3-ripple>` : ''}
                ${iconContent}
                <span class="label">
                    ${this.label}
                    <slot></slot>
                </span>
            </button>
        `;
    }
}

customElements.define('m3-menu-item', M3MenuItem);
