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

    constructor() {
        super();
        this._anchorEl = null;
        this._handleKeyDown = this._handleKeyDown.bind(this);
        this._handlePopoverToggle = this._handlePopoverToggle.bind(this);
    }

    set anchorElement(el) {
        this._anchorEl = el;
    }

    get anchorElement() {
        return this._anchorEl;
    }

    firstUpdated() {
        this._menuSurface = this.shadowRoot.querySelector('.menu-surface');
        if (this._menuSurface) {
            this._menuSurface.addEventListener('toggle', this._handlePopoverToggle);
            this._menuSurface.addEventListener('keydown', this._handleKeyDown);
        }
    }

    updated(changedProperties) {
        if (changedProperties.has('visible')) {
            if (this.visible) {
                this._show();
            } else {
                this._hide();
            }
        }

        if (changedProperties.has('anchor')) {
             const root = this.getRootNode();
             if (root && this.anchor) {
                 this._anchorEl = root.getElementById(this.anchor);
             }
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._menuSurface) {
            this._menuSurface.removeEventListener('toggle', this._handlePopoverToggle);
            this._menuSurface.removeEventListener('keydown', this._handleKeyDown);
        }
    }

    _show() {
        if (!this._menuSurface) return;
        
        // Prevent double open if already open
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
        
        let top = anchorRect.bottom + 4; // 4px gap
        let left = anchorRect.left;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        this._menuSurface.style.position = 'fixed';
        this._menuSurface.style.margin = '0';
        
        // Alignment
        const alignment = this.alignment || 'start';
        
        if (alignment === 'end') {
            left = anchorRect.right; 
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

        // Check overflow (naive)
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
             // Avoid infinite loop if this was triggered by property change
             if (this.visible) {
                this.visible = false;
                this.dispatchEvent(new CustomEvent('close'));
                
                // Restore focus
                if (this._previousFocus && this._previousFocus.focus) {
                    this._previousFocus.focus();
                }
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
        return html`
            <div class="menu-surface" popover="auto">
                <slot></slot>
            </div>
        `;
    }
}

customElements.define('m3-menu', M3Menu);
