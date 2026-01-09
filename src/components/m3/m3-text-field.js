
import { LitElement, html, css } from 'lit';

export class M3TextField extends LitElement {
    static properties = {
        label: { type: String },
        value: { type: String },
        type: { type: String }, // text, password, etc.
        placeholder: { type: String },
        disabled: { type: Boolean, reflect: true },
        readonly: { type: Boolean, reflect: true },
        required: { type: Boolean, reflect: true },
        variant: { type: String, reflect: true }, // 'filled' (default) | 'outlined'
        name: { type: String, reflect: true },
        pattern: { type: String },
        minlength: { type: Number },
        maxlength: { type: Number },
        min: { type: String },
        max: { type: String },
        step: { type: String },
        errorText: { type: String, attribute: 'error-text' }
    };

    static formAssociated = true;

    static styles = css`
        :host {
            display: block;
            margin-bottom: 16px;
        }

        .container {
            position: relative;
            background-color: var(--md-sys-color-surface-container-highest);
            border-radius: 4px 4px 0 0;
            height: 56px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid var(--md-sys-color-on-surface-variant);
            transition: background-color var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
        }

        /* Error Utility */
        :host([error-text]) .container {
             border-bottom-color: var(--md-sys-color-error);
        }
        :host([error-text]) label {
            color: var(--md-sys-color-error) !important;
        }
        :host([error-text]) input {
            caret-color: var(--md-sys-color-error);
        }

        .container:hover {
            background-color: var(--md-sys-color-surface-container-high);
        }

        .container:focus-within {
            border-bottom: 2px solid var(--md-sys-color-primary);
        }
        
        :host([error-text]) .container:focus-within {
            border-bottom-color: var(--md-sys-color-error);
        }

        input {
            width: 100%;
            height: 100%;
            border: none;
            background: none;
            padding: 24px 16px 8px;
            font: var(--md-sys-typescale-body-large);
            color: var(--md-sys-color-on-surface);
            outline: none;
            box-sizing: border-box;
            caret-color: var(--md-sys-color-primary);
        }

        label {
            position: absolute;
            left: 16px;
            top: 18px;
            color: var(--md-sys-color-on-surface-variant);
            pointer-events: none;
            transition: all var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
            font: var(--md-sys-typescale-body-large);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: calc(100% - 32px);
        }

        /* Float label when focused or has value */
        input:focus + label,
        input:not(:placeholder-shown) + label {
            top: 8px;
            font: var(--md-sys-typescale-body-small); /* 12px */
            color: var(--md-sys-color-primary);
        }
        
        :host([error-text]) input:focus + label,
        :host([error-text]) input:not(:placeholder-shown) + label {
            color: var(--md-sys-color-error);
        }

        input:not(:placeholder-shown):not(:focus) + label {
            color: var(--md-sys-color-on-surface-variant);
        }

        /* Logic to support visible placeholders:
           If a placeholder is visible (and not just the whitespace hack),
           we must float the label even if the input is empty.
           This is handled via the .has-placeholder class added in render().
        */

        
        /* Outlined Variant */
        /* Outlined Variant - Container Overrides */
        :host([variant="outlined"]) .container {
            background-color: transparent;
            border: none;
            border-bottom: none;
        }

        /* Notched Outline (Fieldset/Legend) */
        .outline {
            position: absolute;
            inset: 0;
            margin: 0;
            padding: 0 8px;
            pointer-events: none;
            border: 1px solid var(--md-sys-color-outline);
            border-radius: 4px;
            background: transparent;
            transition: border-color var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
        }

        legend {
            padding: 0;
            line-height: 11px; /* Match font size mostly */
            font-size: 11px;
            width: auto;
            max-width: 0.01px; /* Effectively hidden */
            height: 11px;
            visibility: hidden;
            white-space: nowrap;
            transition: max-width var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard), 
                        padding var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard); 
            /* Note: Transitioning max-width allows the gap to animate open */
        }
        
        legend span {
            padding: 0 4px;
            opacity: 0; /* Implicitly hidden commands space */
            visibility: hidden;
        }

        /* Focus Ring / Active Outline */
        :host([variant="outlined"]) .container:focus-within .outline {
             border: 2px solid var(--md-sys-color-primary);
        }

        :host([variant="outlined"][error-text]) .outline {
             border-color: var(--md-sys-color-error);
        }

        /* Gap Opening Logic */
        /* Open gap when focused OR has value OR has visible placeholder */
        :host([variant="outlined"]) input:focus ~ .outline legend,
        :host([variant="outlined"]) input:not(:placeholder-shown) ~ .outline legend,
        :host([variant="outlined"]) .container.has-placeholder .outline legend {
             max-width: 100%;
             visibility: visible;
        }

        /* Adjust Label Position for Outlined */
        :host([variant="outlined"]) label {
            left: 12px; 
            /* Initial centered position is handled by default label styles (top: 18px) */
            background-color: transparent; /* No more hack */
            padding: 0 0px; 
        }

        /* Float the label into the gap */
        :host([variant="outlined"]) input:focus + label,
        :host([variant="outlined"]) input:not(:placeholder-shown) + label,
        :host([variant="outlined"]) input:focus ~ label,
        :host([variant="outlined"]) input:not(:placeholder-shown) ~ label,
        :host([variant="outlined"]) .container.has-placeholder label {
             top: 0;
             transform: translateY(-50%);
             font: var(--md-sys-typescale-label-small);
             /* Default color for floated label if not focused is handled below */
        }
        
        /* Color: Focus typically takes precedence in the :focus rule above? 
           Wait, there is no generic :focus rule for color above used for Outline float?
           Ah, the generic 'input:focus + label' rule sets color to primary.
        */
        :host([variant="outlined"]) input:focus ~ label {
             color: var(--md-sys-color-primary);
        }

        /* Color adjustments for non-focused floating label */
        :host([variant="outlined"]) input:not(:focus):not(:placeholder-shown) ~ label,
        :host([variant="outlined"]) .container.has-placeholder input:not(:focus) ~ label {
             color: var(--md-sys-color-on-surface-variant);
        }
        
        :host([variant="outlined"][error-text]) input:not(:focus):not(:placeholder-shown) ~ label,
        :host([variant="outlined"][error-text]) .container.has-placeholder input:not(:focus) ~ label {
             color: var(--md-sys-color-error);
        }
        
        /* Supporting Text (Error) */
        .supporting-text {
            font-size: 12px;
            color: var(--md-sys-color-error);
            padding: 4px 16px 0 16px;
            display: none;
        }
        :host([error-text]) .supporting-text {
            display: block;
        }
    `;

    #internals;

    constructor() {
        super();
        this.#internals = this.attachInternals();
        this.type = 'text';
        this.value = '';
        this.placeholder = ' '; // Needed for :placeholder-shown trick
        this.required = false;
        this.errorText = '';
    }

    // Form-associated lifecycle
    formDisabledCallback(disabled) {
        this.disabled = disabled;
    }

    formResetCallback() {
        this.value = this.getAttribute('value') || '';
        this.#internals.setFormValue(this.value);
    }
    
    firstUpdated() {
        this.#updateValidity();
    }

    updated(changedProperties) {
        if (changedProperties.has('value')) {
            this.#internals.setFormValue(this.value);
            this.#updateValidity();
        }
    }

    #handleInput(e) {
        this.value = e.target.value;
        this.#internals.setFormValue(this.value);
        this.#updateValidity();
        
        this.dispatchEvent(new CustomEvent('input', {
            detail: { value: this.value },
            bubbles: true,
            composed: true
        }));
    }
    
    #handleChange(e) {
         this.dispatchEvent(new CustomEvent('change', {
            detail: { value: this.value },
            bubbles: true,
            composed: true
        }));
    }

    #updateValidity() {
        const input = this.shadowRoot.querySelector('input');
        if (!input) return;
        
        // Sync constraints
        // ElementInternals.setValidity() throws if flags are true but message is empty.
        // We ensure a fallback message is present if the input is invalid.
        if (this.#internals.validity.valid !== input.validity.valid || this.#internals.validationMessage !== input.validationMessage) {
             let message = input.validationMessage;
             if (!input.validity.valid && !message) {
                 message = this.errorText || 'Invalid input'; // Fallback
             }
             this.#internals.setValidity(input.validity, message, input);
        }
    }

    render() {
        // Detect if a substantive placeholder exists (ignoring the whitespace hack)
        const hasVisiblePlaceholder = this.placeholder && this.placeholder.trim().length > 0;

        return html`
            <div class="container ${hasVisiblePlaceholder ? 'has-placeholder' : ''}">
                <slot name="leading-icon"></slot>
                <input 
                    id="input"
                    type="${this.type}" 
                    .value="${this.value}" 
                    placeholder="${this.placeholder}"
                    ?disabled="${this.disabled}"
                    ?readonly="${this.readonly}"
                    ?required="${this.required}"
                    pattern="${this.pattern || ''}" 
                    minlength="${this.minlength || ''}"
                    maxlength="${this.maxlength || ''}"
                    min="${this.min || ''}"
                    max="${this.max || ''}"
                    step="${this.step || ''}"
                    @input="${this.#handleInput}"
                    @change="${this.#handleChange}"
                    aria-labelledby="label"
                    aria-invalid="${!!this.errorText}"
                    aria-describedby="${this.errorText ? 'error-msg' : ''}"
                >
                ${this.variant === 'outlined' ? html`
                    <fieldset class="outline" aria-hidden="true">
                        <legend><span>${this.label}</span></legend>
                    </fieldset>
                ` : ''}
                <label id="label" for="input">${this.label}</label>
                <slot name="trailing-icon"></slot>
            </div>
            <div id="error-msg" class="supporting-text">${this.errorText}</div>
        `;
    }
}

customElements.define('m3-text-field', M3TextField);
