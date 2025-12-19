import { LitElement, html, css } from 'lit';

export class M3Menu extends LitElement {
    static properties = {
        visible: { type: Boolean, reflect: true },
        anchor: { type: String },
        alignment: { type: String }
    };

    static styles = css`
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
    `;

    // Private Fields
    #anchorEl = null;
    #menuSurface = null;
    #previousFocus = null;
    #boundHandleKeyDown;
    #boundHandlePopoverToggle;

    constructor() {
        super();
        this.#boundHandleKeyDown = (e) => this.#handleKeyDown(e);
        this.#boundHandlePopoverToggle = (e) => this.#handlePopoverToggle(e);
    }

    set anchorElement(el) {
        this.#anchorEl = el;
    }

    get anchorElement() {
        return this.#anchorEl;
    }

    firstUpdated() {
        this.#menuSurface = this.shadowRoot.querySelector('.menu-surface');
        if (this.#menuSurface) {
            this.#menuSurface.addEventListener('toggle', this.#boundHandlePopoverToggle);
            this.#menuSurface.addEventListener('keydown', this.#boundHandleKeyDown);
        }
    }

    updated(changedProperties) {
        if (changedProperties.has('visible')) {
            if (this.visible) {
                this.#show();
            } else {
                this.#hide();
            }
        }

        if (changedProperties.has('anchor')) {
             const root = this.getRootNode();
             if (root && this.anchor) {
                 this.#anchorEl = root.getElementById(this.anchor);
             }
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.#menuSurface) {
            this.#menuSurface.removeEventListener('toggle', this.#boundHandlePopoverToggle);
            this.#menuSurface.removeEventListener('keydown', this.#boundHandleKeyDown);
        }
    }

    #show() {
        if (!this.#menuSurface) return;
        
        // Prevent double open if already open
        if (this.#menuSurface.matches(':popover-open')) return;

        // Positioning Logic (Native JS, Top Layer)
        if (this.#anchorEl) {
           this.#updatePosition();
        }

        try {
            this.#menuSurface.showPopover();
            // Focus first item
            const firstItem = this.querySelector('[role="menuitem"], button, m3-menu-item');
            if (firstItem) firstItem.focus();
            
            this.#previousFocus = document.activeElement;
        } catch (e) {
            console.error('Popover API not supported or error showing:', e);
        }
    }

    #updatePosition() {
        const anchorRect = this.#anchorEl.getBoundingClientRect();
        
        let top = anchorRect.bottom + 4; // 4px gap
        let left = anchorRect.left;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        this.#menuSurface.style.position = 'fixed';
        this.#menuSurface.style.margin = '0';
        
        // Alignment
        const alignment = this.alignment || 'start';
        
        if (alignment === 'end') {
            left = anchorRect.right; 
             this.#menuSurface.style.left = 'auto';
             this.#menuSurface.style.right = `${viewportWidth - anchorRect.right}px`;
        } else if (alignment === 'center') {
             this.#menuSurface.style.left = `${anchorRect.left + (anchorRect.width / 2)}px`;
             this.#menuSurface.style.transform = 'translateX(-50%)';
        } else {
             this.#menuSurface.style.left = `${left}px`;
             this.#menuSurface.style.right = 'auto';
        }

        this.#menuSurface.style.top = `${top}px`;
        this.#menuSurface.style.bottom = 'auto';

        // Check overflow (naive)
        if (top + 200 > viewportHeight) {
            // Flip
             this.#menuSurface.style.top = 'auto';
             this.#menuSurface.style.bottom = `${viewportHeight - anchorRect.top + 4}px`;
        }
    }

    #hide() {
        if (this.#menuSurface && this.#menuSurface.matches(':popover-open')) {
            this.#menuSurface.hidePopover();
        }
    }

    #handlePopoverToggle(e) {
        // "beforetoggle" or "toggle"
        // If state is "closed", sync attribute
        if (e.newState === 'closed') {
             // Avoid infinite loop if this was triggered by property change
             if (this.visible) {
                this.visible = false;
                this.dispatchEvent(new CustomEvent('close'));
                
                // Restore focus
                if (this.#previousFocus && this.#previousFocus.focus) {
                    this.#previousFocus.focus();
                }
             }
        }
    }

    #handleKeyDown(e) {
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
                this.#hide();
                break;
            case 'Tab':
                // Close on tab out
                 this.#hide(); 
                 break;
        }
    }

    render() {
        return html`
            <div class="menu-surface" popover="auto">
                <slot></slot>
            </div>
        `;
    }
}

customElements.define('m3-menu', M3Menu);
