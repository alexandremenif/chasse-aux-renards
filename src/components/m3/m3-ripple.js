
export class M3Ripple extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        // The parent element acts as the trigger surface container
        const parent = this.getRootNode().host || this.parentNode;
        if (parent) {
            // Ensure parent clips the ripple
            // We can't strictly enforce styles on parent from here easily without side effects, 
            // but usually the parent component should handle 'overflow: hidden'.

            parent.addEventListener('mousedown', (e) => this.createRipple(e));
        }
    }

    createRipple(event) {
        const ripple = document.createElement('div');
        ripple.classList.add('ripple');

        const rect = this.getBoundingClientRect();
        // Calculate radius to cover the largest distance to a corner
        const size = Math.max(rect.width, rect.height) * 2; // Enough to cover

        // Position relative to the component
        const x = event.clientX - rect.left - (size / 2);
        const y = event.clientY - rect.top - (size / 2);

        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        this.shadowRoot.appendChild(ripple);

        // Remove after animation
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: absolute;
                    inset: 0;
                    pointer-events: none; /* Let clicks pass through */
                    overflow: hidden;
                    border-radius: inherit; /* Inherit shape from parent */
                }

                .ripple {
                    position: absolute;
                    border-radius: 50%;
                    background-color: currentcolor;
                    opacity: 0.12; /* State layer opacity for pressed */
                    transform: scale(0);
                    animation: ripple-effect var(--md-sys-motion-duration-long) linear;
                }

                @keyframes ripple-effect {
                    to {
                        transform: scale(1);
                        opacity: 0;
                    }
                }
            </style>
        `;
    }
}

customElements.define('m3-ripple', M3Ripple);
