
export class M3Ripple extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._parentListeners = [];
        this._ripples = new Set(); // Track active ripples
    }

    connectedCallback() {
        this.render();
        const parent = this.parentNode || this.getRootNode().host;
        if (parent) {
            // Ensure parent has a positioning context so ripple stays inside
            const computedStyle = getComputedStyle(parent);
            if (computedStyle.position === 'static') {
                parent.style.position = 'relative';
            }

            // Touch handling state
            this._touchStartTimer = null;
            this._isTouchAction = false;

            const handlePointerDown = (e) => {
                // If touch, delay slightly to check for scroll
                if (e.pointerType === 'touch') {
                    this._isTouchAction = true;
                    this._touchStartTimer = setTimeout(() => {
                        if (this._isTouchAction) {
                            this.startRipple(e);
                        }
                    }, 75); // 75ms delay to filter scrolls
                } else {
                    this._isTouchAction = false;
                    this.startRipple(e);
                }
            };
            
            const handlePointerUp = (e) => {
                if (this._touchStartTimer) {
                    clearTimeout(this._touchStartTimer);
                    this._touchStartTimer = null;
                }
                this._isTouchAction = false;
                this.endRipple();
            };

            const handlePointerLeave = (e) => {
                 // On touch, leave often happens on scroll cancellation
                 if (this._touchStartTimer) {
                    clearTimeout(this._touchStartTimer);
                    this._touchStartTimer = null;
                }
                 this._isTouchAction = false;
                 this.endRipple();
            };
            
            // Handle pointercancel for scrolling on mobile
            const handlePointerCancel = (e) => {
                 if (this._touchStartTimer) {
                    clearTimeout(this._touchStartTimer);
                    this._touchStartTimer = null;
                }
                this._isTouchAction = false;
                this.endRipple();
            };

            const handleKeyDown = (e) => {
                if (e.repeat) return; // Ignore hold-down repeats
                if (e.key === 'Enter' || e.key === ' ') {
                    const rect = this.getBoundingClientRect();
                    this.startRipple({ 
                        clientX: rect.left + rect.width / 2, 
                        clientY: rect.top + rect.height / 2,
                        pointerType: 'keyboard'
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
            parent.addEventListener('pointercancel', handlePointerCancel);
            parent.addEventListener('keydown', handleKeyDown);
            parent.addEventListener('keyup', handleKeyUp);
            
            this._parentListeners.push(
                { el: parent, type: 'pointerdown', handler: handlePointerDown },
                { el: parent, type: 'pointerup', handler: handlePointerUp },
                { el: parent, type: 'pointerleave', handler: handlePointerLeave },
                { el: parent, type: 'pointercancel', handler: handlePointerCancel },
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
        const ripple = document.createElement('div');
        ripple.classList.add('ripple');

        const rect = this.getBoundingClientRect();
        
        // Calculate size to cover corners: diagonal = hypot(w, h) * 2 to be safe
        const hypotenuse = Math.hypot(rect.width, rect.height);
        const size = hypotenuse * 2; 

        // Center calculation
        const x = event.clientX ? event.clientX - rect.left - (size / 2) : (rect.width / 2) - (size / 2);
        const y = event.clientY ? event.clientY - rect.top - (size / 2) : (rect.height / 2) - (size / 2);

        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        this.shadowRoot.appendChild(ripple);
        
        // Store metadata on the DOM element for cleanup logic
        ripple._startTime = Date.now();
        ripple._state = 'blooming'; // blooming -> visible -> fading
        this._ripples.add(ripple);

        // Animate Scale In
        requestAnimationFrame(() => {
            ripple.classList.add('visible');
        });
    }

    endRipple() {
        // Find ripples that are still 'blooming' or 'visible' and start fading them out.
        // In M3, releasing the press means the ripple should fade out, but it must wait for min duration.
        // We act on ALL currently active ripples that haven't started fading yet.
        // This handles multi-touch or rapid tap where multiple might be active.
        
        const now = Date.now();
        const minDuration = 200;

        this._ripples.forEach(ripple => {
            if (ripple._state === 'fading') return; // Already dying

            const elapsedTime = now - ripple._startTime;
            const remainingTime = Math.max(0, minDuration - elapsedTime);

            ripple._state = 'fading'; // Mark as condemned

            setTimeout(() => {
                ripple.classList.add('fading-out');
                
                // Remove after transition
                ripple.addEventListener('transitionend', (e) => {
                    if (e.propertyName === 'opacity') {
                        ripple.remove();
                        this._ripples.delete(ripple);
                    }
                }, { once: true }); // Ensure one-time cleanup
            }, remainingTime);
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
                    z-index: 0;
                }

                .ripple {
                    position: absolute;
                    border-radius: 50%;
                    background-color: currentcolor;
                    opacity: 0; 
                    transform: scale(0.2);
                    /* 
                       Expand: Standard Easing, ~450ms is good for the spread.
                       Opacity: Linear fade-in 75ms (fast entry)
                    */
                    transition: transform 450ms var(--md-sys-motion-easing-standard), 
                                opacity 75ms linear;
                }

                .ripple.visible {
                    transform: scale(1);
                    opacity: var(--md-sys-state-pressed-state-layer-opacity); /* M3 Pressed State Opacity */
                }

                .ripple.fading-out {
                    opacity: 0 !important;
                    /* Fade out: Linear or Standard, faster than bloom. 150ms-300ms. */
                    /* Ensure transform transition is preserved so it continues expanding */
                    transition: transform 450ms var(--md-sys-motion-easing-standard), 
                                opacity 150ms linear;
                }
            </style>
        `;
    }
}

customElements.define('m3-ripple', M3Ripple);
