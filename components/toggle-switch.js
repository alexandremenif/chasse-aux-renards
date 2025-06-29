// components/toggle-switch.js
class ToggleSwitch extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render(); // Initial render is fine

        // Attach a single, persistent event listener to the shadow root
        this.shadowRoot.addEventListener('change', (e) => {
            // Check if the event was fired by the input element
            if (e.target.matches('input')) {
                // Manually update the 'checked' attribute on the host element.
                // This is what allows the :host([checked]) CSS selector to work.
                if (e.target.checked) {
                    this.setAttribute('checked', '');
                } else {
                    this.removeAttribute('checked');
                }

                // Dispatch the custom event for the parent application to hear.
                this.dispatchEvent(new CustomEvent('change', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        checked: e.target.checked
                    }
                }));
            }
        });
    }
    
    render() {
        const label = this.getAttribute('label') || 'Mode';
        // We read the state from the attribute to ensure consistency.
        const isChecked = this.hasAttribute('checked');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                label {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    -webkit-user-select: none;
                    user-select: none;
                }
                .toggle-wrapper {
                    position: relative;
                }
                .toggle-block {
                    display: block;
                    background-color: #D1D5DB;
                    width: 3.5rem;
                    height: 2rem;
                    border-radius: 9999px;
                    transition: background-color 0.2s ease-in-out;
                }
                .toggle-dot {
                    position: absolute;
                    left: 0.25rem;
                    top: 0.25rem;
                    background-color: white;
                    width: 1.5rem;
                    height: 1.5rem;
                    border-radius: 9999px;
                    transition: transform 0.2s ease-in-out;
                }
                .label-text {
                    margin-left: 0.75rem;
                    color: #475569;
                    font-weight: 700;
                    font-size: 0.875rem;
                }
                /* Style the component based on its 'checked' attribute */
                :host([checked]) .toggle-block {
                    background-color: #fcd34d;
                }
                :host([checked]) .toggle-dot {
                    transform: translateX(100%);
                    background-color: #f59e0b;
                }
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border-width: 0;
                }
            </style>
            <label>
                <div class="toggle-wrapper">
                    <input type="checkbox" class="sr-only" ${isChecked ? 'checked' : ''}>
                    <div class="toggle-block"></div>
                    <div class="toggle-dot"></div>
                </div>
                <div class="label-text">${label}</div>
            </label>
        `;
    }
    
    static get observedAttributes() {
        return ['label', 'checked'];
    }

    // This callback is now responsible for re-rendering when props change from the outside.
    attributeChangedCallback(name, oldValue, newValue) {
        // We only re-render if the value has actually changed, to avoid unnecessary work.
        if (oldValue !== newValue) {
            this.render();
        }
    }
}

customElements.define('toggle-switch', ToggleSwitch);
