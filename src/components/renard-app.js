import './reward-board.js';
import './add-renard-button.js';
import './user-selector.js';
import './confirmation-modal.js';
import './child-selection-modal.js';

class RenardApp extends HTMLElement {
    constructor() {
        super();
        // We don't use a shadow DOM here because the app's styles
        // and element IDs need to be globally accessible.
    }

    connectedCallback() {
        this.innerHTML = `
            <reward-board></reward-board>
    
            <add-renard-button></add-renard-button>
            
            <div id="user-selection-container">
                <user-selector></user-selector>
            </div>
    
            <confirmation-modal id="confirmation-modal"></confirmation-modal>
            <child-selection-modal></child-selection-modal>
        `;
    }
}

customElements.define('renard-app', RenardApp);
