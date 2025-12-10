
export class M3Menu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._anchorEl = null;
        this._handleKeyDown = this._handleKeyDown.bind(this);
        this._handlePopoverToggle = this._handlePopoverToggle.bind(this);
    }

    static get observedAttributes() {
        return ['visible', 'anchor', 'alignment'];
    }

    set anchorElement(el) {
        this._anchorEl = el;
    }

    get anchorElement() {
        return this._anchorEl;
    }

    connectedCallback() {
        this.render();
        this._menuSurface = this.shadowRoot.querySelector('.menu-surface');
        
        if (this._menuSurface) {
            this._menuSurface.addEventListener('toggle', this._handlePopoverToggle);
            this._menuSurface.addEventListener('keydown', this._handleKeyDown);
        }
    }

    disconnectedCallback() {
        if (this._menuSurface) {
            this._menuSurface.removeEventListener('toggle', this._handlePopoverToggle);
            this._menuSurface.removeEventListener('keydown', this._handleKeyDown);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'visible' && oldValue !== newValue) {
            if (newValue === 'true') {
                this._show();
            } else {
                this._hide();
            }
        } else if (name === 'anchor') {
            const root = this.getRootNode();
            if (root) {
                this._anchorEl = root.getElementById(newValue);
            }
        }
    }

    _show() {
        if (!this._menuSurface) return;
        
        // Prevent double open if already open (check popoverOpen usually not needed if we check state, but good practice)
        if (this._menuSurface.matches(':popover-open')) return;

        // Positioning Logic (Native JS, Top Layer)
        if (this._anchorEl) {
           this._updatePosition();
        }

        try {
            this._menuSurface.showPopover();
            // Focus first item
            const firstItem = this.querySelector('[role="menuitem"], button, m3-menu-item');
            if (firstItem) firstItem.focus();
            
            this._previousFocus = document.activeElement;
        } catch (e) {
            console.error('Popover API not supported or error showing:', e);
        }
    }

    _updatePosition() {
        const anchorRect = this._anchorEl.getBoundingClientRect();
        const menuRect = this._menuSurface.getBoundingClientRect(); // Might be 0 if hidden, need to approximate or show-then-move?
        // Popover needs to be shown to get measuring in some cases, but we can set style before.
        // Actually, for popover, we might want to unhide briefly or just rely on estimated width? 
        // Let's set top/left.
        
        let top = anchorRect.bottom + 4; // 4px gap
        let left = anchorRect.left;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Simple Flip Logic
        // We can't easily measure the menu before showing it if it's `display: none` (default popover behavior).
        // Strategy: showing it takes it out of flow. 
        // We will set default styles, show it, then adjust if needed? 
        // Better: Set it to fixed position based on anchor.
        
        this._menuSurface.style.position = 'fixed';
        this._menuSurface.style.margin = '0';
        
        // Alignment
        const alignment = this.getAttribute('alignment') || 'start';
        
        if (alignment === 'end') {
            left = anchorRect.right; 
            // We ideally want right-aligned to anchor right, so we need to subtract menu width?
            // Since we can't measure yet, we might use CSS transforms or `right` property?
            // "right: calc(100vw - anchorRect.right)"
             this._menuSurface.style.left = 'auto';
             this._menuSurface.style.right = `${viewportWidth - anchorRect.right}px`;
        } else if (alignment === 'center') {
             this._menuSurface.style.left = `${anchorRect.left + (anchorRect.width / 2)}px`;
             this._menuSurface.style.transform = 'translateX(-50%)';
        } else {
             this._menuSurface.style.left = `${left}px`;
             this._menuSurface.style.right = 'auto';
        }

        this._menuSurface.style.top = `${top}px`;
        this._menuSurface.style.bottom = 'auto';

        // Check overflow (naive) - assuming standard height ~200px if we can't measure
        if (top + 200 > viewportHeight) {
            // Flip
             this._menuSurface.style.top = 'auto';
             this._menuSurface.style.bottom = `${viewportHeight - anchorRect.top + 4}px`;
        }
    }

    _hide() {
        if (this._menuSurface && this._menuSurface.matches(':popover-open')) {
            this._menuSurface.hidePopover();
        }
    }

    _handlePopoverToggle(e) {
        // "beforetoggle" or "toggle"
        // If state is "closed", sync attribute
        if (e.newState === 'closed') {
             this.setAttribute('visible', 'false');
             this.dispatchEvent(new CustomEvent('close'));
             
              // Restore focus
            if (this._previousFocus && this._previousFocus.focus) {
                this._previousFocus.focus();
            }
        }
    }

    _handleKeyDown(e) {
        const items = Array.from(this.querySelectorAll('[role="menuitem"], button, m3-menu-item'));
        if (!items.length) return;

        const currentIndex = items.indexOf(document.activeElement);
        let nextIndex;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                nextIndex = (currentIndex + 1) % items.length;
                items[nextIndex].focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                nextIndex = (currentIndex - 1 + items.length) % items.length;
                items[nextIndex].focus();
                break;
            case 'Escape':
                e.preventDefault();
                this._hide();
                break;
            case 'Tab':
                // Close on tab out
                 this._hide(); 
                 break;
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: contents; /* Wrapper triggers nothing */
                }

                .menu-surface {
                    background-color: var(--md-sys-color-surface-container);
                    border-radius: var(--md-sys-shape-corner-extra-small);
                    padding: var(--md-sys-spacing-8) 0;
                    width: 200px;
                    min-width: 112px;
                    max-width: 280px;
                    box-shadow: var(--md-sys-elevation-2);
                    border: none; 
                    
                    /* Popover Default Overrides */
                    margin: 0;
                    inset: auto; /* We manage position manually via JS */
                    
                    overflow: hidden;
                    flex-direction: column;
                    
                    /* Animation */
                    opacity: 0;
                    transform: scaleY(0.9);
                    transform-origin: top left;
                    transition: opacity 0.1s ease, transform 0.1s ease, display 0.1s allow-discrete, overlay 0.1s allow-discrete;
                }

                :popover-open {
                    display: flex; /* Override native 'block' */
                    opacity: 1;
                    transform: scaleY(1);
                }

                @starting-style {
                    :popover-open {
                        opacity: 0;
                        transform: scaleY(0.9);
                    }
                }
            </style>
            <div class="menu-surface" popover="auto">
                <slot></slot>
            </div>
        `;
    }
}

customElements.define('m3-menu', M3Menu);
