import { LitElement, html, css, nothing } from 'lit';
import './m3-ripple.js';

export class M3Card extends LitElement {
    static properties = {
        variant: { type: String },
        clickable: { type: Boolean, reflect: true }
    };

    static styles = css`
        :host {
            display: block;
        }
        .card {
            border-radius: var(--md-sys-shape-corner-medium);
            padding: var(--md-sys-spacing-16);
            overflow: hidden;
            transition: all var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
            position: relative;
            height: 100%;
            box-sizing: border-box;
            outline: none; /* Focus ring handled by state layer or custom */
        }
        
        .clickable {
            cursor: pointer;
            user-select: none;
        }
        
        .clickable:focus-visible {
            outline: var(--md-sys-state-focus-ring-width) solid var(--md-sys-state-focus-ring-color);
            outline-offset: var(--md-sys-state-focus-ring-offset);
        }

        /* Variants */
        .filled {
            background-color: var(--md-sys-color-surface-container-highest); 
        }
        
        .outlined {
            background-color: var(--md-sys-color-surface);
            border: 1px solid var(--md-sys-color-outline-variant);
        }

        .elevated {
            background-color: var(--md-sys-color-surface-container-low);
            box-shadow: var(--md-sys-elevation-1);
        }

        /* Tint Layer */
        .tint-layer {
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-surface-tint);
            opacity: 0; /* Default */
            transition: opacity var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
            pointer-events: none;
            z-index: 0;
        }

        /* Tint Logic based on Elevation */
        .elevated .tint-layer {
            opacity: var(--md-sys-elevation-tint-level-1);
        }
        
        .elevated.clickable:hover .tint-layer {
                opacity: var(--md-sys-elevation-tint-level-2);
        }
        
        .elevated.clickable:active .tint-layer {
                opacity: var(--md-sys-elevation-tint-level-1);
        }

        /* State Layer */
        .state-layer {
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-on-surface);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
            pointer-events: none;
            z-index: 1; /* Above tint */
        }

        .clickable:hover .state-layer {
            opacity: var(--md-sys-state-hover-state-layer-opacity);
        }
        
        .clickable:focus-visible .state-layer {
            opacity: var(--md-sys-state-focus-state-layer-opacity);
        }

        /* Active state handled by ripple */
        
        /* Content above state layer */
        .content {
            position: relative;
            z-index: 2; /* Above state and tint */
        }
    `;

    constructor() {
        super();
        this.variant = 'filled';
    }

    #handleKeyDown(e) {
        if (this.clickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            this.click();
        }
    }

    render() {
        return html`
            <div 
                class="card ${this.variant || 'filled'} ${this.clickable ? 'clickable' : ''}" 
                part="card"
                tabindex="${this.clickable ? '0' : '-1'}"
                role="${this.clickable ? 'button' : nothing}"
                @keydown="${(e) => this.#handleKeyDown(e)}"
            >
                <div class="tint-layer"></div>
                <div class="state-layer"></div>
                ${this.clickable ? html`<m3-ripple></m3-ripple>` : ''}
                <div class="content"><slot></slot></div>
            </div>
        `;
    }
}

customElements.define('m3-card', M3Card);
