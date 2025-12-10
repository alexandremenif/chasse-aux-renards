
export class M3Ripple extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._parentListeners = [];
    }

    connectedCallback() {
        this.render();
        const parent = this.getRootNode().host || this.parentNode;
        if (parent) {
            // Use pointer events for better touch/mouse handling
            const handlePointerDown = (e) => this.startRipple(e);
            
            // We need to listen to global up/leave to ensure we catch release even if cursor moved off
            // But for a loose coupling, listening on parent for leave is usually enough, 
            // and window for up if we want to be super robust. 
            // Let's stick to parent listeners for encapsulation unless we drag.
            const handlePointerUp = () => this.endRipple();
            const handlePointerLeave = () => this.endRipple();

            const handleKeyDown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    // Center start
                    const rect = this.getBoundingClientRect();
                    this.startRipple({ 
                        clientX: rect.left + rect.width / 2, 
                        clientY: rect.top + rect.height / 2,
                        pointerType: 'keyboard' // Custom marker
                    });
                }
            };

            const handleKeyUp = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    this.endRipple();
                }
            };

            parent.addEventListener('pointerdown', handlePointerDown);
            parent.addEventListener('pointerup', handlePointerUp);
            parent.addEventListener('pointerleave', handlePointerLeave);
            parent.addEventListener('keydown', handleKeyDown);
            parent.addEventListener('keyup', handleKeyUp);
            
            this._parentListeners.push(
                { el: parent, type: 'pointerdown', handler: handlePointerDown },
                { el: parent, type: 'pointerup', handler: handlePointerUp },
                { el: parent, type: 'pointerleave', handler: handlePointerLeave },
                { el: parent, type: 'keydown', handler: handleKeyDown },
                { el: parent, type: 'keyup', handler: handleKeyUp }
            );
        }
    }

    disconnectedCallback() {
        this._parentListeners.forEach(({ el, type, handler }) => {
            el.removeEventListener(type, handler);
        });
        this._parentListeners = [];
    }

    startRipple(event) {
        // Remove existing ripples to keep it clean (single ripple effect usually preferred per press)
        // Or allow multiple? M3 allows multiple. Let's append.
        
        const ripple = document.createElement('div');
        ripple.classList.add('ripple');

        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2; 

        // If keyboard (mock event), center it. If click, use coords.
        const x = event.clientX ? event.clientX - rect.left - (size / 2) : (rect.width / 2) - (size / 2);
        const y = event.clientY ? event.clientY - rect.top - (size / 2) : (rect.height / 2) - (size / 2);

        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        this.shadowRoot.appendChild(ripple);

        // Animate Scale In
        requestAnimationFrame(() => {
            ripple.classList.add('visible');
        });

        this._currentRipple = ripple; // Track latest for release
        this._rippleStartTime = Date.now(); // Record start time
    }

    endRipple() {
        if (this._currentRipple) {
            const ripple = this._currentRipple;
            this._currentRipple = null; // Detach so we don't try again
            
            const elapsedTime = Date.now() - (this._rippleStartTime || 0);
            const minDuration = 200; // Minimum visibility time in ms
            const remainingTime = Math.max(0, minDuration - elapsedTime);

            setTimeout(() => {
                // Trigger Fade Out
                ripple.classList.add('fading-out');
                
                // Remove after fade
                ripple.addEventListener('transitionend', (e) => {
                    if (e.propertyName === 'opacity') {
                        ripple.remove();
                    }
                });
            }, remainingTime);
        }
        
        // Also clean up any old ripples that might be stuck (e.g. from rapid clicks)
        const stuckRipples = this.shadowRoot.querySelectorAll('.ripple.visible:not(.fading-out)');
        stuckRipples.forEach(r => {
             if (r !== this._currentRipple) {
                 r.classList.add('fading-out');
                 r.addEventListener('transitionend', (e) => { if(e.propertyName === 'opacity') r.remove(); });
             }
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    overflow: hidden;
                    border-radius: inherit;
                    z-index: 0; /* Behind content but above background */
                }

                .ripple {
                    position: absolute;
                    border-radius: 50%;
                    background-color: currentcolor;
                    opacity: 0; /* Start invisible for softer entry */
                    transform: scale(0.2); /* Start slightly larger to avoid spark effect */
                    /* Expansion: Slower, standard easing handles 'violent' linear feel better */
                    transition: transform 600ms linear, /* Standard easing */
                                opacity 200ms linear;
                }

                .ripple.visible {
                    transform: scale(1);
                    opacity: 0.16; /* Increased visibility */
                }

                .ripple.fading-out {
                    opacity: 0 !important;
                    transition: opacity 600ms ease-out; /* Slower fade out */
                }
            </style>
        `;
    }
}

customElements.define('m3-ripple', M3Ripple);
