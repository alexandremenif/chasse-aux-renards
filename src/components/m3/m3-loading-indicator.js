// src/components/m3/m3-loading-indicator.js

class M3LoadingIndicator extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    min-height: 200px; /* Ensure visibility in empty content */
                }

                .container {
                    /* Standard M3 Loading Indicator size */
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    /* Rotate the whole container to add complexity */
                    animation: container-rotate 3s linear infinite;
                }

                /* The morphing shape */
                .shape {
                    width: 100%;
                    height: 100%;
                    background-color: var(--md-sys-color-primary);
                    /* Initial Shape: Circle */
                    border-radius: 50%; 
                    
                    /* The Expressive Animation:
                       1. Morph: Circle -> Squircle/Flower-ish -> Circle
                       2. Scale/Pulse: slightly breathe to feel alive
                    */
                    animation: 
                        morph-and-spin 1.5s var(--md-sys-motion-easing-emphasized, ease-in-out) infinite alternate;
                }

                @keyframes container-rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes morph-and-spin {
                    0% {
                        border-radius: 50%; /* Circle */
                        transform: rotate(0deg) scale(0.8);
                    }
                    50% {
                         /* Semi-square / Squircle */
                        border-radius: 20%; 
                        transform: rotate(180deg) scale(1.0);
                    }
                    100% {
                         /* Back to Circle-ish but rotated */
                        border-radius: 50%;
                        transform: rotate(360deg) scale(0.8);
                    }
                }
            </style>
            <div class="container" role="progressbar" aria-label="Loading">
                <div class="shape"></div>
            </div>
        `;
    }
}

customElements.define('m3-loading-indicator', M3LoadingIndicator);
