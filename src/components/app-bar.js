// src/components/app-bar.js
import { LitElement, html, css } from 'lit';
import { userService } from '../services/user-service.js';
import { boardService } from '../services/board-service.js';
import './user-info.js';
import './m3/m3-icon.js';
import './board-selector.js';

class AppBar extends LitElement {
    static properties = {
        currentBoardName: { type: String },
        currentBoardId: { type: String },
        isParent: { type: Boolean },
        currentUser: { type: Object }
    };

    static styles = css`
        :host {
           display: block;
           width: 100%;
        }

        /* Title Styles */
        h1 {
           margin: 0;
           font: var(--md-sys-typescale-title-large);
           color: var(--md-sys-color-on-surface);
           white-space: nowrap;
           overflow: hidden;
           text-overflow: ellipsis;
        }

        /* Mobile: Hide Title ONLY if selector needs space */
        @media (max-width: 600px) {
            h1.hide-on-mobile {
                display: none;
            }
        }
    `;

    constructor() {
        super();
        this.unsubscribeBoard = () => { };
        this.currentBoardName = '...';
        this.currentBoardId = null;
        this.isParent = false;
        this.currentUser = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.currentUser = userService.getCurrentUser();
        // Determine isParent immediately if possible, or wait for update
        this.isParent = this.currentUser && this.currentUser.isParent;

        this.unsubscribeBoard = boardService.onCurrentBoardUpdated(boardData => {
            if (boardData) {
                this.currentBoardName = boardData.owner;
                this.currentBoardId = boardData.id;
            }
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.unsubscribeBoard();
    }

    render() {
        const authenticated = this.currentUser !== null;
        const boardsCount = this.currentUser?.boards?.length ?? 0;
        
        // Show Selector ONLY if:
        // 1. Not Loading
        // 2. Is Parent (can switch/view)
        // 3. Has more than 1 board (otherwise no point switching)
        const shouldShowSelector = authenticated && this.isParent && boardsCount > 1;

        // Hide Title on Mobile ONLY if we are showing the selector (to save space)
        // If selector is hidden (loading or single board), we show title.
        const hideTitleOnMobile = shouldShowSelector;

        return html`
            <m3-app-bar>
                <div slot="start">
                   <!-- Title: Hidden on mobile only if selector is visible -->
                   <h1 class="${hideTitleOnMobile ? 'hide-on-mobile' : ''}">La Chasse aux Renards</h1>
                </div>

                <div slot="center">
                    ${shouldShowSelector
                        ? html`
                            <!-- Board Selector: Centers on Desktop, Shifts Left on Mobile -->
                            <board-selector 
                                id="board-switcher" 
                                board-name="${this.currentBoardName}"
                                board-id="${this.currentBoardId}">
                            </board-selector>
                        `
                        : ''
                    }
                </div>

                <div slot="end">
                    ${authenticated ? html`<user-info></user-info>` : ''}
                </div>
            </m3-app-bar>
        `;
    }
}

customElements.define('app-bar', AppBar);
