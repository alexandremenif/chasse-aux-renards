
export class M3Avatar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['src', 'alt', 'initials', 'size'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const src = this.getAttribute('src');
        const alt = this.getAttribute('alt') || 'Avatar';
        const initials = this.getAttribute('initials') || '';
        const size = this.getAttribute('size') || '40px';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    width: ${size};
                    height: ${size};
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
            </style>
            <div class="container" role="img" aria-label="${alt}">
                ${src
                ? `<img src="${src}" alt="${alt}">`
                : `<span>${initials.slice(0, 1)}</span>`
            }
            </div>
        `;
    }
}

customElements.define('m3-avatar', M3Avatar);
