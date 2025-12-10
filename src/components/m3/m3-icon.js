
export class M3Icon extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['name', 'svg-path', 'size', 'color'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const svgPath = this.getAttribute('svg-path');
        const color = this.getAttribute('color') || 'currentColor';
        const size = this.getAttribute('size') || '24px';

        if (this.hasAttribute('name')) {
            const name = this.getAttribute('name');
            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: ${size};
                        height: ${size};
                        color: ${color};
                    }
                    .material-symbols-outlined {
                        font-family: 'Material Symbols Outlined';
                        font-weight: normal;
                        font-style: normal;
                        font-size: ${size}; /* Use component size for icon font size */
                        line-height: 1;
                        letter-spacing: normal;
                        text-transform: none;
                        display: inline-block;
                        white-space: nowrap;
                        word-wrap: normal;
                        direction: ltr;
                        -webkit-font-smoothing: antialiased;
                        font-variation-settings:
                            'FILL' 0,
                            'wght' 400,
                            'GRAD' 0,
                            'opsz' 24;
                    }
                </style>
                <span class="material-symbols-outlined">${name}</span>
            `;
        } else {
            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: ${size};
                        height: ${size};
                        color: ${color};
                    }
                    svg {
                        width: 100%;
                        height: 100%;
                        fill: currentColor;
                    }
                </style>
                ${svgPath ? `
                <svg viewBox="0 0 24 24">
                    <path d="${svgPath}"></path>
                </svg>` : '<slot></slot>'}
            `;
        }
    }
}

customElements.define('m3-icon', M3Icon);
