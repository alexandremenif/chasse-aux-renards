import { userService } from '../services/user-service';
import './m3/m3-button.js';

class LoginPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          text-align: center;
        }

        h1 {
            margin: 0;
            font: var(--md-sys-typescale-display-medium);
            color: var(--md-sys-color-primary);
            margin-bottom: var(--md-sys-spacing-16);
        }

        p {
            margin: 0;
            font: var(--md-sys-typescale-body-large);
            color: var(--md-sys-color-on-surface-variant);
            margin-bottom: var(--md-sys-spacing-32);
        }
      </style>
      
      <h1>La Chasse aux Renards</h1>
      <p>Connectez-vous pour commencer à suivre vos récompenses.</p>
      <m3-button variant="filled" label="Se connecter avec Google"></m3-button>
    `;
  }

  connectedCallback() {
    // Defer event listener attachment to ensure shadow DOM is ready
    // or just attach to the element if available immediately (which it is in innerHTML)
    const btn = this.shadowRoot.querySelector('m3-button');
    if (btn) {
      btn.addEventListener('click', () => {
        userService.signIn();
      });
    }
  }
}

customElements.define('login-page', LoginPage);
