// components/user-selector.js
import { userStore } from '../stores/user-store.js';

class UserSelector extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.users = [];
    this.unsubscribeUser = () => {};
  }

  connectedCallback() {
    this.users = userStore.getUsers();
    this._render();
    
    const select = this.shadowRoot.querySelector('select');
    select.addEventListener('change', (e) => {
      userStore.selectUser(e.target.value);
    });

    this.unsubscribeUser = userStore.onAuthenticatedUser(currentUser => {
        if (select.value !== currentUser.id) {
            select.value = currentUser.id;
        }
    });
  }

  disconnectedCallback() {
      this.unsubscribeUser();
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        select {
          font-family: inherit;
          font-size: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #ccc;
        }
      </style>
      <select id="user-select">
        ${this.users.map(user => `<option value="${user.id}">${user.name}</option>`).join('')}
      </select>
    `;
  }
}

customElements.define('user-selector', UserSelector);
