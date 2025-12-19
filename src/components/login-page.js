import { LitElement, html, css } from 'lit';
import { userService } from '../services/user-service';
import './m3/m3-button.js';

class LoginPage extends LitElement {
    static styles = css`
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
    `;

    #handleLogin() {
        userService.signIn();
    }

    render() {
        return html`
            <h1>La Chasse aux Renards</h1>
            <p>Connectez-vous pour commencer à suivre vos récompenses.</p>
            <m3-button variant="filled" label="Se connecter avec Google" @click="${() => this.#handleLogin()}"></m3-button>
        `;
    }
}

customElements.define('login-page', LoginPage);
