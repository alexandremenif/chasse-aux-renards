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
            transition: opacity var(--md-sys-motion-duration-extra-short) var(--md-sys-motion-easing-standard), transform var(--md-sys-motion-duration-extra-short) var(--md-sys-motion-easing-standard), display var(--md-sys-motion-duration-extra-short) allow-discrete, overlay var(--md-sys-motion-duration-extra-short) allow-discrete;
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

        this.#menuSurface.style.position = 'absolute';
        this.#menuSurface.style.margin = '0';
        
        // Alignment
        const alignment = this.alignment || 'start';
        
        // Add scroll offsets for absolute positioning
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        
        if (alignment === 'end') {
            // Right aligned: position right edge at anchor right
             this.#menuSurface.style.left = 'auto';
             // document width - (anchor right + scroll) ... wait. 
             // simpler: right relative to viewport? No, absolute is relative to document.
             // right = documentWidth - (anchorRight + scrollX)
             // Let's stick to left for absolute if possible, or right relative to Containing Block.
             // Since it's Top Layer, CB is ICB (viewport size but scrollable?). 
             // Actually, 'right' property on absolute element in top layer is relative to right edge of ICB.
             // It's safer to calculate Left:
             // Left = Anchor Right + ScrollX - MenuWidth. 
             // We don't know MenuWidth easily without layout.
             // But we can use style.right if we know document width? No.
             // Let's stick to using 'left' but calculated.
             // Wait, if alignment is end, we want menu's right edge to align with anchor's right edge.
             // Left = (AnchorRect.right + ScrollX) - MenuRect.width.
             // Getting MenuRect requires it to be visible. It is about to be shown.
             // If we use 'right' property: right: calc(100vw - (rect.right + scrollX)) ? No. 
             // Let's just use Left for everything to be safe.
             
             // For simplify, let's keep the existing logic but add scroll:
             // Original: left = anchorRect.right; style.right = (viewport - right)
             // Absolute: 
             //   style.left = anchorRect.right + scrollX - menuWidth?
             // let's try to just simply offset Top/Left for now and assume 'start' alignment for robustness, 
             // or handle 'end' by setting left properly.
             
             // Actually, the previous code for 'end' was:
             // this.#menuSurface.style.right = `${viewportWidth - anchorRect.right}px`;
             // For absolute: this.#menuSurface.style.right = `${document.documentElement.clientWidth - (anchorRect.right + scrollX)}px` ?
             
             // Let's stick to the simplest robustness fix: Absolute + Top/Left.
             // If alignment is end, we need menu width.
             this.#menuSurface.style.left = 'auto';
             this.#menuSurface.style.right = `${document.documentElement.clientWidth - (anchorRect.right + scrollX)}px`;
        } else if (alignment === 'center') {
             this.#menuSurface.style.left = `${anchorRect.left + (anchorRect.width / 2) + scrollX}px`;
             this.#menuSurface.style.transform = 'translateX(-50%)';
        } else {
             this.#menuSurface.style.left = `${left + scrollX}px`;
             this.#menuSurface.style.right = 'auto';
        }

        this.#menuSurface.style.top = `${top + scrollY}px`;
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
