import { LitElement, html, css } from 'lit';

export class M3Avatar extends LitElement {
    static properties = {
        src: { type: String },
        alt: { type: String },
        initials: { type: String },
        size: { type: String }
    };

    static styles = css`
        :host {
            display: inline-block;
            border-radius: 50%;
            background-color: var(--md-sys-color-tertiary-container);
            color: var(--md-sys-color-on-tertiary-container);
            overflow: hidden;
            user-select: none;
            /* Default state layer behavior if interactive */
            position: relative;
        }

        .container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            font: var(--md-sys-typescale-title-medium);
            font-weight: 500;
            text-transform: uppercase;
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    `;

    constructor() {
        super();
        this.alt = 'Avatar';
        this.size = '40px';
    }

    render() {
        // Apply size to host
        this.style.width = this.size;
        this.style.height = this.size;

        return html`
            <div class="container" role="img" aria-label="${this.alt}">
                ${this.src
                ? html`<img src="${this.src}" alt="${this.alt}">`
                : html`<span>${(this.initials || '').slice(0, 1)}</span>`
            }
            </div>
        `;
    }
}

customElements.define('m3-avatar', M3Avatar);
