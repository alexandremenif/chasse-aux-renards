// src/components/user-info.js
import { LitElement, html, css } from 'lit';
import { userService } from '../services/user-service.js';
import './m3/m3-menu.js';
import './m3/m3-avatar.js';
import './m3/m3-icon.js';
import './m3/m3-menu-item.js';
import './m3/m3-ripple.js';

class UserInfo extends LitElement {
    static properties = {
        user: { type: Object, state: true },
        menuVisible: { type: Boolean, state: true }
    };

    static styles = css`
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
             position: relative; /* Anchor ripple */
             overflow: hidden; /* Clip ripple to circle */
             transition: box-shadow var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
           }
           .avatar-btn:hover {
             /* simple hover effect */
             opacity: 0.8;
           }
           /* Active state ring */
           .avatar-btn.active {
             box-shadow: 0 0 0 var(--md-sys-state-focus-ring-width) var(--md-sys-color-primary);
           }
           
           .user-details {
               display: flex;
               flex-direction: column;
               align-items: center; /* Center align for account card look */
               padding: var(--md-sys-spacing-24) var(--md-sys-spacing-16);
               border-bottom: 1px solid var(--md-sys-color-outline-variant);
               margin-bottom: var(--md-sys-spacing-8);
               text-align: center;
               gap: var(--md-sys-spacing-8);
           }
           .user-name {
               font: var(--md-sys-typescale-title-medium);
               color: var(--md-sys-color-on-surface);
               margin-top: var(--md-sys-spacing-8);
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
               padding: var(--md-sys-spacing-12) var(--md-sys-spacing-24);
               font: var(--md-sys-typescale-label-large);
               color: var(--md-sys-color-on-surface);
               cursor: pointer;
               display: flex;
               align-items: center;
               justify-content: center; /* Center the content */
                gap: var(--md-sys-spacing-12);
           }
           button.menu-action:hover {
               background-color: var(--md-sys-color-surface-container);
           }
           button.menu-action.danger {
               color: var(--md-sys-color-error);
           }
    `;

    constructor() {
        super();
        this.user = null;
        this.menuVisible = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this.user = userService.getCurrentUser();
    }
    
    _toggleMenu() {
        this.menuVisible = !this.menuVisible;
    }
    
    _handleMenuClose() {
        this.menuVisible = false;
    }

    _handleLogout() {
        userService.signOut();
        this.menuVisible = false;
    }
    
    updated(changedProperties) {
        if (changedProperties.has('user')) {
            const btn = this.shadowRoot.getElementById('avatar-btn');
            const menu = this.shadowRoot.getElementById('user-menu');
            if (menu && btn) {
                menu.anchorElement = btn;
            }
        }
    }

    render() {
        if (!this.user) return html``;

        // Compute initials safely
        const initials = (this.user.displayName || 'U').charAt(0).toUpperCase();
        const displayName = this.user.displayName || 'Utilisateur';

        return html`
            <div class="relative-container">
                <button id="avatar-btn" class="avatar-btn" @click="${this._toggleMenu}">
                    <m3-ripple></m3-ripple>
                    <m3-avatar 
                        src="${this.user.photoURL || ''}" 
                        alt="${displayName}" 
                        initials="${initials}"
                        size="40px">
                    </m3-avatar>
                </button>

                <m3-menu 
                    id="user-menu" 
                    anchor="avatar-btn" 
                    alignment="end"
                    ?visible="${this.menuVisible}"
                    @close="${this._handleMenuClose}"
                >
                    <!-- Header (User Info) -->
                    <div class="user-details">
                        <m3-avatar 
                            src="${this.user.photoURL || ''}" 
                            alt="${displayName}" 
                            initials="${initials}"
                            size="64px">
                        </m3-avatar>
                        <div>
                             <div class="user-name">${displayName}</div>
                             <span class="user-email">${this.user.email}</span>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <m3-menu-item 
                        id="logout-btn"
                        icon="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5a2 2 0 00-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"
                        label="Déconnexion"
                        style="--md-sys-color-on-surface: var(--md-sys-color-error); --md-sys-color-on-surface-variant: var(--md-sys-color-error);"
                        @click="${this._handleLogout}"
                    >
                    </m3-menu-item>
                </m3-menu>
            </div>
        `;
    }
}

customElements.define('user-info', UserInfo);
