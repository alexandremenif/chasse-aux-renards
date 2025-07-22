import './style.css'

// Import all the components so they are registered
import './components/renard-icon.js';
import './components/add-renard-button.js';
import './components/renard-counter.js';
import './components/confirmation-modal.js';
import './components/reward-card.js';
import './components/child-selector.js';
import './components/child-selection-modal.js';
import './components/user-selector.js';
import './components/reward-board.js';

// Import the stores
import './stores/user-store.js';
import './stores/reward-board-store.js';

document.querySelector('#app').innerHTML = `
  <reward-board></reward-board>
    
  <add-renard-button></add-renard-button>
  
  <div id="user-selection-container">
      <user-selector></user-selector>
  </div>
  
  <confirmation-modal id="confirmation-modal"></confirmation-modal>
  <child-selection-modal></child-selection-modal>
`;
