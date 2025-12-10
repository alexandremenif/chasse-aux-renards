
export class M3Dialog extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._handleKeyDown = this._handleKeyDown.bind(this);
    }

    static get observedAttributes() {
        return ['visible', 'headline'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'visible') {
            const container = this.shadowRoot.querySelector('.backdrop');
            if (container) {
                if (newValue === 'true') {
                    container.classList.remove('hidden');
                    // Add small delay for animation
                    requestAnimationFrame(() => container.classList.add('visible'));

                    // A11y & Focus
                    this.setAttribute('role', 'dialog');
                    this.setAttribute('aria-modal', 'true');
                    this._previousFocus = document.activeElement;

                    // Trap focus and listen for Escape
                    document.addEventListener('keydown', this._handleKeyDown);

                    // Focus first interactive element or dialog itself
                    setTimeout(() => {
                        const focusable = this.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                        if (focusable) {
                            focusable.focus();
                        } else {
                            this.shadowRoot.querySelector('.dialog').focus();
                        }
                    }, 50);

                } else {
                    container.classList.remove('visible');
                    setTimeout(() => container.classList.add('hidden'), 200);

                    document.removeEventListener('keydown', this._handleKeyDown);

                    // Restore focus
                    if (this._previousFocus && this._previousFocus.focus) {
                        this._previousFocus.focus();
                    }
                }
            }
        } else {
            this.render();
        }
    }

    _handleKeyDown(e) {
        if (e.key === 'Escape') {
            this.setAttribute('visible', 'false');
            e.stopPropagation(); // Prevent propagation
        }

        if (e.key === 'Tab') {
            const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
            // Get all focusable elements both in light DOM (slots) and Shadow DOM
            // This is tricky with slots. Simplified approach: Query assigned nodes of slots + internal buttons.

            // Actually, for this specific Dialog implementation, actions are in a slot, content is in a slot.
            // We need to find focusable elements in the distributed tree.
            // A simpler robust way for this specific app:
            // 1. Internal buttons (close?) - None currently.
            // 2. Slotted elements.

            const slot = this.shadowRoot.querySelector('slot[name="actions"]');
            const contentSlot = this.shadowRoot.querySelector('.content slot');

            let focusableItems = [];

            // Helper to get focusables from a slot
            const getFocusablesFromSlot = (s) => {
                if (!s) return [];
                return s.assignedElements({ flatten: true }).reduce((acc, el) => {
                    // Check the element itself
                    if (el.matches(focusableElementsString)) acc.push(el);
                    // Check its children
                    acc.push(...Array.from(el.querySelectorAll(focusableElementsString)));
                    return acc;
                }, []);
            };

            // 1. Content Slot
            focusableItems.push(...getFocusablesFromSlot(contentSlot));

            // 2. Actions Slot (Usually buttons)
            focusableItems.push(...getFocusablesFromSlot(slot));

            // Filter out hidden ones if any (simplified)
            focusableItems = focusableItems.filter(el => el.offsetParent !== null);

            if (focusableItems.length === 0) {
                e.preventDefault();
                return;
            }

            const firstItem = focusableItems[0];
            const lastItem = focusableItems[focusableItems.length - 1];

            // If shift + tab
            if (e.shiftKey) {
                if (document.activeElement === firstItem || this.shadowRoot.activeElement === firstItem) {
                    e.preventDefault();
                    lastItem.focus();
                }
            } else {
                // if tab
                if (document.activeElement === lastItem || this.shadowRoot.activeElement === lastItem) {
                    e.preventDefault();
                    firstItem.focus();
                }
            }
        }
    }

    render() {
        const headline = this.getAttribute('headline') || '';
        const visible = this.getAttribute('visible') === 'true';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    z-index: 100;
                    inset: 0;
                    pointer-events: none; /* Let clicks pass through when hidden */
                }
                :host([visible="true"]) {
                    pointer-events: auto;
                }

                .backdrop {
                    position: fixed;
                    inset: 0;
                    background-color: rgba(0, 0, 0, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.15s var(--md-sys-motion-easing-standard); /* Exit: Standard Accelerate */
                }

                .backdrop.hidden {
                    display: none;
                }
                
                .backdrop.visible {
                    opacity: 1;
                    transition: opacity var(--md-sys-motion-duration-medium) var(--md-sys-motion-easing-emphasized); /* Enter: Emphasized Decelerate */
                }

                .dialog {
                    background-color: var(--md-sys-color-surface-container-high);
                    border-radius: var(--md-sys-shape-corner-extra-large);
                    padding: var(--md-sys-spacing-24);
                    width: 90%;
                    max-width: 320px;
                    box-shadow: var(--md-sys-elevation-3);
                    transform: scale(0.9);
                    transition: transform 0.15s var(--md-sys-motion-easing-standard); /* Exit: Standard Accelerate */
                    display: flex;
                    flex-direction: column;
                    gap: var(--md-sys-spacing-16);
                    outline: none;
                }

                .backdrop.visible .dialog {
                    transform: scale(1);
                    transition: transform var(--md-sys-motion-duration-medium) var(--md-sys-motion-easing-emphasized); /* Enter: Emphasized Decelerate */
                }

                .icon-header {
                    align-self: center;
                    margin-bottom: var(--md-sys-spacing-8);
                    color: var(--md-sys-color-secondary);
                }

                .headline {
                    margin: 0;
                    text-align: center;
                    font: var(--md-sys-typescale-headline-small);
                    color: var(--md-sys-color-on-surface);
                }

                .content {
                    font: var(--md-sys-typescale-body-medium);
                    color: var(--md-sys-color-on-surface-variant);
                    text-align: center;
                }

                .actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: var(--md-sys-spacing-8);
                    margin-top: var(--md-sys-spacing-8);
                }
                
                .actions.stacked {
                    flex-direction: column;
                }
            </style>
            <div class="backdrop ${visible ? 'visible' : 'hidden'}">
                <div class="dialog" tabindex="-1">
                    <div class="icon-header">
                        <slot name="icon"></slot>
                    </div>
                    ${headline ? `<h2 class="headline">${headline}</h2>` : ''}
                    <div class="content">
                        <slot></slot>
                    </div>
                    <div class="actions">
                        <slot name="actions"></slot>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('m3-dialog', M3Dialog);
