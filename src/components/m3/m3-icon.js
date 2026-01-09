import { LitElement, html, css } from 'lit';

export class M3Icon extends LitElement {
    static properties = {
        name: { type: String },
        icon: { type: String }, // Alias for name
        svgPath: { type: String, attribute: 'svg-path' },
        size: { type: String },
        color: { type: String }
    };

    static styles = css`
        :host {
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-weight: normal;
            font-style: normal;
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
        svg {
            width: 100%;
            height: 100%;
            fill: currentColor;
        }
    `;

    render() {
        const size = this.size || '24px';
        const color = this.color || 'currentColor';
        const iconName = this.name || this.icon;
        
        // Apply dynamic styles to host
        this.style.width = size;
        this.style.height = size;
        this.style.color = color;

        if (iconName) {
            return html`
                <span class="material-symbols-outlined" 
                      style="font-size: ${size};"
                      aria-hidden="true">
                    ${iconName}
                </span>
            `;
        }

        if (this.svgPath) {
            return html`
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="${this.svgPath}"></path>
                </svg>
            `;
        }

        return html`<slot></slot>`;
    }
}

customElements.define('m3-icon', M3Icon);
