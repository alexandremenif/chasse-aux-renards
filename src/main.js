import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';

import 'material-symbols/outlined.css';
import './firebase.js'; // Import and execute Firebase initialization
import './style.css';

// This special import will register the service worker.
import 'virtual:pwa-register'; 

// Import the root component to start the application
import './components/renard-app.js';
