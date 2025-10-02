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
import './components/renard-app.js';
import './components/app-bar.js';

// Import services to ensure they are initialized
import './services/confirmation-service.js';
import './services/board-selection-service.js';

const app = document.querySelector('#app');
app.innerHTML = `<renard-app></renard-app>`;
