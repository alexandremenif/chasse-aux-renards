// src/components/user-info.js
import { userService } from '../services/user-service.js';
import './m3/m3-menu.js';
import './m3/m3-avatar.js';
import './m3/m3-icon.js';
import './m3/m3-menu-item.js';

class UserInfo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
    this._setupListeners();
  }

  _render() {
    const user = userService.getCurrentUser();
    if (!user) return;

    // Compute initials safely
    const initials = (user.displayName || 'U').charAt(0).toUpperCase();

    this.shadowRoot.innerHTML = `
        <style>
           :host {
             display: inline-flex;
             align-items: center;
             justify-content: center;
             vertical-align: middle;
           }

           /* Container to tighten the coordinate system for the absolute menu */
           .relative-container {
               position: relative;
               display: inline-flex; /* Shrink to button size */
           }

           .avatar-btn {
             background: none;
             border: none;
             padding: 0;
             margin: 0;
             cursor: pointer;
             border-radius: 50%;
             display: block; /* Remove inline gaps */
             /* Highlight state logic */
             transition: box-shadow 0.2s;
           }
           .avatar-btn:hover {
             /* simple hover effect */
             opacity: 0.8;
           }
           /* Active state ring */
           .avatar-btn.active {
             box-shadow: 0 0 0 2px var(--md-sys-color-primary);
           }
           
           .user-details {
               display: flex;
               flex-direction: column;
               align-items: center; /* Center align for account card look */
               padding: 24px 16px;
               border-bottom: 1px solid var(--md-sys-color-outline-variant);
               margin-bottom: 8px;
               text-align: center;
               gap: 8px;
           }
           .user-name {
               font: var(--md-sys-typescale-title-medium);
               color: var(--md-sys-color-on-surface);
               margin-top: 8px;
           }
           .user-email {
               font: var(--md-sys-typescale-body-medium);
               color: var(--md-sys-color-on-surface-variant);
           }
           
           button.menu-action {
               width: 100%;
               border: none;
               background: none;
               text-align: center;
               padding: 12px 24px;
               font: var(--md-sys-typescale-label-large);
               color: var(--md-sys-color-on-surface);
               cursor: pointer;
               display: flex;
               align-items: center;
               justify-content: center; /* Center the content */
                gap: 12px;
           }
           button.menu-action:hover {
               background-color: var(--md-sys-color-surface-container-high);
           }
           button.menu-action.danger {
               color: var(--md-sys-color-error);
           }
        </style>

        <div class="relative-container">
            <button id="avatar-btn" class="avatar-btn">
                <m3-avatar 
                    src="${user.photoURL || ''}" 
                    alt="${user.displayName || 'User'}" 
                    initials="${initials}"
                    size="40px">
                </m3-avatar>
            </button>

            <m3-menu id="user-menu" anchor="avatar-btn" alignment="end">
                <!-- Header (User Info) -->
                <div class="user-details">
                    <m3-avatar 
                        src="${user.photoURL || ''}" 
                        alt="${user.displayName || 'User'}" 
                        initials="${initials}"
                        size="64px">
                    </m3-avatar>
                    <div>
                         <div class="user-name">${user.displayName || 'Utilisateur'}</div>
                         <span class="user-email">${user.email}</span>
                    </div>
                </div>
                
                <!-- Actions -->
                <!-- Actions -->
                <m3-menu-item 
                    id="logout-btn"
                    icon="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5a2 2 0 00-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"
                    label="Déconnexion"
                    style="--md-sys-color-on-surface: var(--md-sys-color-error); --md-sys-color-on-surface-variant: var(--md-sys-color-error);">
                </m3-menu-item>
            </m3-menu>
        </div>
      `;
  }

  _setupListeners() {
    const avatarBtn = this.shadowRoot.getElementById('avatar-btn');
    const menu = this.shadowRoot.getElementById('user-menu');
    const logoutBtn = this.shadowRoot.getElementById('logout-btn');

    // Explicitly link anchor to avoid ID resolution issues
    if (menu && avatarBtn) {
      menu.anchorElement = avatarBtn;
      if (avatarBtn) {
        avatarBtn.addEventListener('click', (e) => {
          // Let event bubble so other menus can close via window listener
          menu.setAttribute('visible', 'true');
        });
      }
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        userService.signOut();
        menu.setAttribute('visible', 'false');
      });
    }
  }
}

customElements.define('user-info', UserInfo);
