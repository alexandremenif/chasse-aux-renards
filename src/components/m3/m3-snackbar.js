import { LitElement, html, css } from 'lit';

export class M3Snackbar extends LitElement {
    static properties = {
        message: { type: String },
        action: { type: String },
        open: { type: Boolean, reflect: true }
    };

    static styles = css`
        :host {
            position: fixed;
            bottom: var(--md-sys-spacing-24);
            left: 50%;
            transform: translate(-50%, 100%);
            z-index: var(--md-sys-z-index-tooltip);
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-sizing: border-box;
            min-width: 300px;
            max-width: 600px;
            min-height: 48px;
            padding: 0 var(--md-sys-spacing-16);
            border-radius: var(--md-sys-shape-corner-extra-small);
            background-color: var(--md-sys-color-inverse-surface);
            color: var(--md-sys-color-inverse-on-surface);
            box-shadow: var(--md-sys-elevation-3);
            font: var(--md-sys-typescale-body-medium);
            opacity: 0;
            transition: transform var(--md-sys-motion-duration-medium) var(--md-sys-motion-easing-emphasized),
                        opacity var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
            pointer-events: none;
        }

        :host([open]) {
            transform: translate(-50%, 0);
            opacity: 1;
            pointer-events: auto;
        }

        .message {
            flex-grow: 1;
            padding: var(--md-sys-spacing-12) 0;
            margin-right: var(--md-sys-spacing-16);
        }

        .action {
            color: var(--md-sys-color-inverse-primary);
            cursor: pointer;
            font: var(--md-sys-typescale-label-large);
            background: none;
            border: none;
            padding: 0;
            margin: 0;
            height: 100%;
            min-height: 48px; /* Touch target */
            display: flex;
            align-items: center;
        }

        .action:hover {
            text-decoration: underline;
        }

        @media (max-width: 600px) {
            :host {
                left: var(--md-sys-spacing-16);
                right: var(--md-sys-spacing-16);
                bottom: var(--md-sys-spacing-16);
                transform: translate(0, 150%);
                width: auto;
                min-width: 0;
            }
            :host([open]) {
                transform: translate(0, 0);
            }
        }
    `;

    constructor() {
        super();
        this.open = false;
        this.message = '';
        this.action = '';
        this._timer = null;
    }

    show(message, action = null, duration = 5000) {
        this.message = message;
        this.action = action;
        this.open = true;

        if (this._timer) clearTimeout(this._timer);
        this._timer = setTimeout(() => {
            this.close();
        }, duration);
    }

    close() {
        this.open = false;
        if (this._timer) clearTimeout(this._timer);
    }

    #handleAction() {
        this.dispatchEvent(new CustomEvent('action-click', { bubbles: true, composed: true }));
        this.close();
    }

    render() {
        return html`
            <span class="message">${this.message}</span>
            ${this.action ? html`
                <button class="action" @click="${this.#handleAction}">
                    ${this.action}
                </button>
            ` : ''}
        `;
    }
}

customElements.define('m3-snackbar', M3Snackbar);
