// src/components/user-info.js
import { userService } from '../services/user-service';

class UserInfo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .user-info-container {
          position: relative;
        }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
        }
        .popup {
          display: none;
          position: absolute;
          top: 50px;
          right: 0;
          width: 300px;
          background-color: var(--surface-background);
          border: 1px solid #ccc;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
          z-index: 100;
        }
        .popup.show {
          display: block;
        }
        .popup-header {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color-light);
          padding-bottom: 1.5rem;
        }
        .popup-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          margin-right: 1rem;
        }
        .popup-name {
          font-weight: 700;
          font-size: 1.125rem;
          color: var(--text-color-dark);
        }
        .popup-email {
            font-size: 0.875rem;
            color: var(--text-color-light);
        }

        .btn {
            font-weight: 700;
            font-size: 1rem;
            border: 2px solid transparent;
            border-radius: 0.5rem;
            padding: 0.75rem 1.5rem;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s ease-in-out;
            display: block;
            width: 100%;
            box-sizing: border-box;
        }

        .btn-secondary {
            background-color: transparent;
            color: var(--text-color-light);
            border-color: var(--border-color);
        }

        .btn-secondary:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
        }
      </style>
      <div class="user-info-container">
        <img class="avatar" src="" alt="User avatar">
        <div class="popup">
          <div class="popup-header">
            <img class="popup-avatar" src="" alt="User avatar">
            <div>
              <div class="popup-name"></div>
              <div class="popup-email"></div>
            </div>
          </div>
          <button class="btn btn-secondary">Se déconnecter</button>
        </div>
      </div>
    `;

    this.togglePopup = this.togglePopup.bind(this);
    this._handleOutsideClick = this._handleOutsideClick.bind(this);
  }

  connectedCallback() {
    const user = userService.getCurrentUser();

    this.shadowRoot.querySelector('.avatar').src = user.photoURL || '';
    this.shadowRoot.querySelector('.popup-avatar').src = user.photoURL || '';
    this.shadowRoot.querySelector('.popup-name').textContent = user.displayName;
    this.shadowRoot.querySelector('.popup-email').textContent = user.email;

    this.shadowRoot.querySelector('.avatar').addEventListener('click', this.togglePopup);
    this.shadowRoot.querySelector('.btn-secondary').addEventListener('click', () => {
        userService.signOut();
    });
  }
  
  disconnectedCallback() {
      document.removeEventListener('click', this._handleOutsideClick);
  }

  togglePopup() {
    const popup = this.shadowRoot.querySelector('.popup');
    const isVisible = popup.classList.toggle('show');

    if (isVisible) {
        document.addEventListener('click', this._handleOutsideClick);
    } else {
        document.removeEventListener('click', this._handleOutsideClick);
    }
  }

  _handleOutsideClick(event) {
      if (!event.composedPath().includes(this)) {
          this.togglePopup();
      }
  }
}

customElements.define('user-info', UserInfo);
