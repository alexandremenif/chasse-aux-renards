// components/board-selector.js
import { LitElement, html, css, nothing } from 'lit';
import { userService } from '../services/user-service.js';
import { boardService } from '../services/board-service.js';
import './m3/m3-button.js';
import './m3/m3-icon.js';
import './m3/m3-menu.js';
import './m3/m3-menu-item.js';

class BoardSelector extends LitElement {
    static properties = {
        boardId: { type: String, attribute: 'board-id' },
        boardName: { type: String, attribute: 'board-name' },
        isParent: { type: Boolean, state: true },
        boards: { type: Array, state: true },
        menuVisible: { type: Boolean, state: true },
        menuAlignment: { type: String, state: true }
    };

    static styles = css`
        :host { 
            display: inline-block; 
            position: relative; /* Anchor for absolute menu */
        }
        
        .empty-state {
            padding: var(--md-sys-spacing-16);
            color: var(--md-sys-color-error);
            text-align: center;
        }
    `;

    // Private Fields
    #boundUpdateAlignment;

    constructor() {
        super();
        this.boardName = '...';
        this.isParent = false;
        this.boards = [];
        this.menuVisible = false;
        this.menuAlignment = 'center';
        this.#boundUpdateAlignment = this.#updateAlignment.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        const user = userService.getCurrentUser();
        this.isParent = user ? user.isParent : false;
        if (user && user.boards) {
            this.boards = user.boards;
        }
        
        this.#updateAlignment();
        window.addEventListener('resize', this.#boundUpdateAlignment);
    }
    
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('resize', this.#boundUpdateAlignment);
    }

    #updateAlignment() {
        const isMobile = window.matchMedia('(max-width: 600px)').matches;
        this.menuAlignment = isMobile ? 'start' : 'center';
    }

    selectBoard(boardId) {
        boardService.selectCurrentBoard(boardId);
        this.menuVisible = false;
    }
    
    #toggleMenu() {
        this.menuVisible = !this.menuVisible;
    }
    
    #handleMenuClose() {
        this.menuVisible = false;
    }

    updated(changedProperties) {
        if (changedProperties.has('isParent') && this.isParent) {
            const btn = this.shadowRoot.getElementById('selector-btn');
            const menu = this.shadowRoot.getElementById('board-menu');
            if (menu && btn) {
                menu.anchorElement = btn;
            }
        }
    }

    render() {
        let menuItemsHTML = html``;
        if (this.boards.length > 0) {
            menuItemsHTML = this.boards.map(board => {
                const isSelected = board.id === this.boardId;
                return html`
                    <m3-menu-item 
                        class="menu-item" 
                        data-id="${board.id}"
                        label="${board.owner}"
                        ?selected="${isSelected}"
                        icon="${isSelected ? 'check' : ''}"
                        preserve-icon-space
                        @click="${() => this.selectBoard(board.id)}"
                    >
                    </m3-menu-item>
                `;
            });
        } else {
            menuItemsHTML = html`<div class="empty-state">Aucun tableau</div>`;
        }

        return html`
            <m3-button 
                id="selector-btn"
                variant="primary-tonal" 
                label="${this.boardName}"
                icon="${this.isParent ? 'expand_more' : ''}"
                ?disabled="${!this.isParent}"
                @click="${this.isParent ? () => this.#toggleMenu() : null}"
            >
                ${this.isParent ? html`<m3-icon slot="icon" name="expand_more" size="20px"></m3-icon>` : ''}
            </m3-button>

            ${this.isParent ? html`
                <m3-menu 
                    id="board-menu" 
                    anchor="selector-btn" 
                    alignment="${this.menuAlignment}"
                    ?visible="${this.menuVisible}"
                    @close="${() => this.#handleMenuClose()}"
                >
                   ${menuItemsHTML}
                </m3-menu>
            ` : nothing}
        `;
    }
}

customElements.define('board-selector', BoardSelector);
