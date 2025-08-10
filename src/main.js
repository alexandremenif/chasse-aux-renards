import './firebase.js'; // Import and execute Firebase initialization
import './style.css';

// This special import will register the service worker.
import 'virtual:pwa-register'; 

// Import all the components so they are registered
import './components/renard-icon.js';
import './components/add-renard-button.js';
import './components/renard-counter.js';
import './components/confirmation-modal.js';
import './components/reward-card.js';
import './components/board-selector.js';
import './components/board-selection-modal.js';
import './components/user-info.js';
import './components/reward-board.js';
import './components/login-page.js';

import { userService } from './services/user-service.js';

const app = document.querySelector('#app');

userService.onUserChanged(user => {
  if (user) {
    app.innerHTML = `
      <user-info></user-info>
      <reward-board></reward-board>
      <add-renard-button id="add-renard-btn"></add-renard-button>
      <confirmation-modal id="confirmation-modal"></confirmation-modal>
      <board-selection-modal></board-selection-modal>
    `;
  } else {
    app.innerHTML = `<login-page></login-page>`;
  }
});
