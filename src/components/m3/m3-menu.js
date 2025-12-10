
export class M3Menu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._anchorEl = null;
        this._handleClickOutside = this._handleClickOutside.bind(this);
        this._handleKeyDown = this._handleKeyDown.bind(this);
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
        // Defer listener attachment to avoid immediate close on trigger click
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'visible') {
            if (newValue === 'true') {
                this._show();
            } else {
                this._hide();
            }
        } else if (name === 'anchor') {
            // If passed as ID string
            const root = this.getRootNode();
            if (root) {
                this._anchorEl = root.getElementById(newValue);
            }
        }
    }

    set anchorElement(el) {
        this._anchorEl = el;
    }

    async _show() {
        const menu = this.shadowRoot.querySelector('.menu-surface');
        if (!menu) return;

        menu.classList.add('visible');
        menu.setAttribute('role', 'menu');

        // Save focus
        this._previousFocus = document.activeElement;

        // Listener
        setTimeout(() => {
            window.addEventListener('click', this._handleClickOutside);
            this.addEventListener('keydown', this._handleKeyDown.bind(this));

            // Focus first item
            const firstItem = this.querySelector('[role="menuitem"], button, m3-menu-item');
            if (firstItem) firstItem.focus();
        }, 50);
    }

    _hide() {
        const menu = this.shadowRoot.querySelector('.menu-surface');
        if (menu) menu.classList.remove('visible');
        window.removeEventListener('click', this._handleClickOutside);
        this.removeEventListener('keydown', this._handleKeyDown.bind(this)); // Bound function ref issue?
        // Note: bind(this) creates a new function every time. 
        // We need to store the bound function or use class property arrow function if we want to remove it correctly.
        // For now, let's fix the bind issue in constructor.

        this.dispatchEvent(new CustomEvent('close'));

        // Restore focus
        if (this._previousFocus && this._previousFocus.focus) {
            this._previousFocus.focus();
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
                this.setAttribute('visible', 'false');
                break;
            case 'Tab':
                e.preventDefault(); // Trap focus or close? M3 menus usually close or trap.
                this.setAttribute('visible', 'false');
                break;
        }
    }

    _handleClickOutside(e) {
        const menu = this.shadowRoot.querySelector('.menu-surface');
        const path = e.composedPath();
        if (!path.includes(menu)) {
            this.setAttribute('visible', 'false');
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: absolute; /* Contextual to parent */
                    z-index: 2000;
                    top: 100%; /* Below the anchor */
                    margin-top: var(--md-sys-spacing-4); /* Small gap */
                    width: max-content;
                    height: auto;
                    pointer-events: none; 
                }
                
                /* Alignment Classes */
                :host([alignment="end"]) {
                    right: 0;
                    left: auto;
                }
                :host([alignment="center"]) {
                    left: 50%;
                    right: auto;
                    /* We apply transform to the HOST to center it, 
                       but wait, pure CSS centering on absolute element: */
                    transform: translateX(-50%);
                }
                :host([alignment="start"]), :host(:not([alignment])) {
                    left: 0;
                    right: auto;
                }

                .menu-surface {
                    position: relative; /* Relative to Host */
                    background-color: var(--md-sys-color-surface-container-high);
                    border-radius: 12px;
                    padding: var(--md-sys-spacing-8) 0;
                    min-width: 200px;
                    max-width: 280px;
                    box-shadow: var(--md-sys-elevation-3);
                    
                    opacity: 0;
                    /* Scale animation needs to interact with the centering transform if we are not careful.
                       The HOST has the centering transform. The SURFACE has the scale transform.
                       They are separate elements, so this is SAFE. */
                    transform: scale(0.9); 
                    transform-origin: top left;
                    transition: opacity 0.1s ease, transform 0.1s ease;
                    pointer-events: auto; /* Re-enable clicks */
                    display: none;
                }
                
                :host([alignment="end"]) .menu-surface {
                    transform-origin: top right;
                }
                :host([alignment="center"]) .menu-surface {
                    transform-origin: top center;
                }

                .menu-surface.visible {
                    opacity: 1;
                    transform: scale(1);
                    display: block;
                }

                /* Default Item Styles if used directly */
                ::slotted(m3-menu-item), ::slotted(button) {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    height: 48px;
                    padding: 0 12px;
                    border: none;
                    background: none;
                    text-align: left;
                    font: var(--md-sys-typescale-label-large);
                    color: var(--md-sys-color-on-surface);
                    cursor: pointer;
                    box-sizing: border-box;
                }
                ::slotted(m3-menu-item:hover), ::slotted(button:hover) {
                    background-color: var(--md-sys-color-surface-container-high);
                }
            </style>
            <div class="menu-surface">
                <slot></slot>
            </div>
        `;
    }
}

customElements.define('m3-menu', M3Menu);
