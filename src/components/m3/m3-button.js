import { LitElement, html, css } from 'lit';
import './m3-ripple.js';
import './m3-icon.js';

export class M3Button extends LitElement {
    static properties = {
        variant: { type: String },
        disabled: { type: Boolean, reflect: true },
        icon: { type: String },
        label: { type: String },
        ariaLabel: { type: String, attribute: 'aria-label' },
        type: { type: String }, // submit, reset, button
        name: { type: String },
        value: { type: String }
    };

    static formAssociated = true;

    static shadowRootOptions = { mode: 'open', delegatesFocus: true };

    static styles = css`
        :host {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            vertical-align: middle;
            font: var(--md-sys-typescale-label-large);
            height: var(--md-sys-component-touch-target-size, 48px); /* Touch target enforcement */
            -webkit-tap-highlight-color: transparent;
        }
        button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--md-sys-spacing-8);
            height: var(--md-sys-component-button-height, 40px);
            border-radius: var(--md-sys-shape-corner-full);
            padding: 0 var(--md-sys-spacing-24);
            font: var(--md-sys-typescale-label-large);
            cursor: pointer;
            border: none;
            transition: box-shadow var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard), background-color var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
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

        /* Tint Layer (for Elevated) */
        button::before {
            content: "";
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-surface-tint);
            opacity: 0; /* Default */
            transition: opacity var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
            pointer-events: none;
            z-index: 0;
        }

        /* State Layer Overlay */
        button::after {
            content: "";
            position: absolute;
            inset: 0;
            background-color: currentColor; /* Default, overridden per variant */
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
            pointer-events: none;
            z-index: 1;
        }

        button:hover:not(:disabled)::after {
            opacity: var(--md-sys-state-hover-state-layer-opacity);
        }
        button:focus-visible:not(:disabled)::after {
            opacity: var(--md-sys-state-focus-state-layer-opacity);
        }
        /* Active state handled by ripple now */
        
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

        .filled-tonal {
            background-color: var(--md-sys-color-secondary-container);
            color: var(--md-sys-color-on-secondary-container);
        }
        .filled-tonal::after { background-color: var(--md-sys-color-on-secondary-container); }

        .filled-tonal:hover:not(:disabled) {
            box-shadow: var(--md-sys-elevation-1);
        }
        .filled-tonal:active:not(:disabled) {
            box-shadow: var(--md-sys-elevation-0);
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
            /* background-color handled by state layer */
        }
        .outlined:focus-visible {
            border-color: var(--md-sys-color-primary);
        }

        .elevated {
            background-color: var(--md-sys-color-surface-container-low);
            color: var(--md-sys-color-primary);
            box-shadow: var(--md-sys-elevation-1);
        }
        .elevated::after { background-color: var(--md-sys-color-primary); }
        .elevated::before { opacity: var(--md-sys-elevation-tint-level-1); }

        .elevated:hover:not(:disabled) {
            box-shadow: var(--md-sys-elevation-2);
        }
        .elevated:hover:not(:disabled)::before {
            opacity: var(--md-sys-elevation-tint-level-2);
        }
        
        .elevated:active:not(:disabled) {
            box-shadow: var(--md-sys-elevation-1);
        }
        .elevated:active:not(:disabled)::before {
            opacity: var(--md-sys-elevation-tint-level-1);
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
    `;

    #internals;
    
    // Computed property for render
    #normalizedVariant = 'filled';

    constructor() {
        super();
        this.#internals = this.attachInternals();
        this.variant = 'filled';
        this.type = 'submit'; // Default to standard button behavior (submit)
    }

    willUpdate(changedProperties) {
        if (changedProperties.has('variant')) {
            let v = this.variant || 'filled';
            if (v === 'tonal' || v === 'primary-tonal') {
                this.#normalizedVariant = 'filled-tonal';
            } else {
                this.#normalizedVariant = v;
            }
        }
    }
    
    #handleClick(e) {
        if (this.disabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (this.type === 'submit') {
            this.#internals.form?.requestSubmit();
        } else if (this.type === 'reset') {
            this.#internals.form?.reset();
        }
    }

    render() {
        const hasIcon = !!this.icon;
        const ariaLabel = this.ariaLabel || this.label || '';

        return html`
            <button 
                class="${this.#normalizedVariant} ${hasIcon ? 'has-icon' : ''}" 
                ?disabled="${this.disabled}" 
                aria-label="${ariaLabel}"
                @click="${this.#handleClick}"
            >
                ${!this.disabled ? html`<m3-ripple></m3-ripple>` : ''}
                ${hasIcon ? html`<slot name="icon"><m3-icon icon="${this.icon}"></m3-icon></slot>` : ''}
                <span class="label">${this.label}</span>
                <slot></slot>
            </button>
        `;
    }
}

customElements.define('m3-button', M3Button);
