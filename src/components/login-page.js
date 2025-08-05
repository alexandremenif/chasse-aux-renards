// src/components/login-page.js
import { authService } from '../services/auth-service';

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
            font-size: 3rem;
            font-weight: 900;
            color: var(--primary-color);
            margin-bottom: 1rem;
        }

        p {
            font-size: 1.25rem;
            color: var(--text-color-light);
            margin-bottom: 2rem;
        }
        
        .btn {
            /* font-family is inherited from body */
            font-weight: 700;
            font-size: 1rem;
            border: 2px solid transparent;
            border-radius: 0.5rem;
            padding: 0.75rem 1.5rem;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s ease-in-out;
            text-decoration: none;
            display: inline-block;
        }

        .btn-primary {
            background-color: var(--primary-color);
            color: var(--text-color-on-primary);
        }

        .btn-primary:hover {
            background-color: var(--primary-color-hover);
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
        }
      </style>
      
      <h1>La Chasse aux Renards</h1>
      <p>Connectez-vous pour commencer à suivre vos récompenses.</p>
      <button class="btn btn-primary">Se connecter avec Google</button>
    `;
  }

  connectedCallback() {
    this.shadowRoot.querySelector('button').addEventListener('click', () => {
      authService.signInWithGoogle();
    });
  }
}

customElements.define('login-page', LoginPage);
