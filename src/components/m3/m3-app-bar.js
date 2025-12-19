import { LitElement, html, css } from 'lit';


export class M3AppBar extends LitElement {
    static styles = css`
        :host {
            display: block;
            background-color: var(--md-sys-color-surface-container);
            color: var(--md-sys-color-on-surface);
            /* Sticky top */
            position: sticky;
            top: 0;
            z-index: var(--md-sys-z-index-app-bar);
        }
        
        .toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 64px; /* Standard M3 Height */
            padding: 0 16px;
        }

        .start, .end {
            display: flex;
            align-items: center;
            gap: var(--md-sys-spacing-12);
            flex: 1; /* Occupy available space */
        }

        /* Start aligns left */
        .start {
            justify-content: flex-start;
        }

        /* End aligns right */
        .end {
            justify-content: flex-end;
        }

        .center {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            font: var(--md-sys-typescale-title-large);
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--md-sys-spacing-12);
        }
        
        /* Responsive: Desktop centers absolute, Mobile flows naturally */
        @media (max-width: 600px) {
            .toolbar {
                height: 64px;
                padding-bottom: 0;
            }

            /* Collapse the Start spacer on mobile since Title is hidden */
            .start {
                flex: 0; 
                width: auto;
            }

            /* Make Center slot fill space and align left */
            .center {
               position: static;
               transform: none;
               display: flex;
               flex: 1;
               justify-content: flex-start; /* Align Selector to Left */
               padding-left: 0;
            }
        }
    `;

    render() {
        return html`
            <div class="toolbar">
                <div class="start">
                    <!-- Title usually goes here in M3 Center Aligned or Start Aligned -->
                    <slot name="start"></slot>
                </div>
                
                <div class="center">
                    <slot name="center"></slot> 
                </div>

                <div class="end">
                    <slot name="end"></slot>
                </div>
            </div>
        `;
    }
}

customElements.define('m3-app-bar', M3AppBar);
