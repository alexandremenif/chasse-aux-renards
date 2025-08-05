import './style.css';

// Import all the components so they are registered
import './components/renard-icon.js';
import './components/add-renard-button.js';
import './components/renard-counter.js';
import './components/confirmation-modal.js';
import './components/reward-card.js';
import './components/child-selector.js';
import './components/child-selection-modal.js';
import './components/user-info.js';
import './components/reward-board.js';
import './components/login-page.js';

import { authService } from './services/auth-service.js';

const app = document.querySelector('#app');

authService.onUserChanged(user => {
  if (user) {
    app.innerHTML = `
      <user-info></user-info>
      <reward-board></reward-board>
      <add-renard-button></add-renard-button>
      <confirmation-modal id="confirmation-modal"></confirmation-modal>
      <child-selection-modal></child-selection-modal>
    `;
  } else {
    app.innerHTML = `<login-page></login-page>`;
  }
});
