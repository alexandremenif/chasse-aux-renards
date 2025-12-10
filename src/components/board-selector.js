// components/board-selector.js
import { userService } from '../services/user-service.js';
import { boardService } from '../services/board-service.js';
import './m3/m3-button.js';
import './m3/m3-icon.js';
import './m3/m3-menu.js';
import './m3/m3-menu-item.js';

class BoardSelector extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.boardId = null;
        this.boardName = '...';
        this.isParent = false;
        this.boards = [];
    }

    static get observedAttributes() {
        return ['board-name', 'board-id'];
    }

    connectedCallback() {
        const user = userService.getCurrentUser();
        this.isParent = user ? user.isParent : false;

        // Pre-load boards if available
        if (user && user.boards) {
            this.boards = user.boards;
        }

        this.render();
        this._setupListeners();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'board-id') {
            this.boardId = newValue;
            this.render(); // Re-render to update selected state in menu if needed
        }
        if (name === 'board-name') {
            this.boardName = newValue;
            // specific update for button label to avoid full re-render?
            const btn = this.shadowRoot.getElementById('selector-btn');
            if (btn) btn.setAttribute('label', newValue);
        }
    }

    _setupListeners() {
        // We need to re-attach listeners if full render happens? 
        // With current render() logic that nukes HTML, yes, or we delegate.
        // But m3-menu setup needs to persist. 
        // Let's make render smart or just re-attach. 
        // Actually, simple re-render is fine for this scale.
    }

    selectBoard(boardId) {
        boardService.selectCurrentBoard(boardId);
        const menu = this.shadowRoot.getElementById('board-menu');
        if (menu) menu.setAttribute('visible', 'false');
    }

    render() {
        // If we are re-rendering, we might lose the menu state.
        // Ideally we only update the button label.
        // But for now, full rebuild is safer for "Initial" + "Refactor".

        // Generate Menu Items
        let menuItemsHTML = '';
        if (this.boards.length > 0) {
            menuItemsHTML = this.boards.map(board => {
                const isSelected = board.id === this.boardId;

                // If not selected, we pass a empty transparent path or handle alignment differently.
                // For simplicity, let's just pass the icon if selected.

                return `
                    <m3-menu-item 
                        class="menu-item" 
                        data-id="${board.id}"
                        label="${board.owner}"
                        ${isSelected ? 'selected' : ''}
                        ${isSelected ? `icon="check"` : ''}
                        preserve-icon-space
                    >
                    </m3-menu-item>
                `;
            }).join('');
        } else {
            menuItemsHTML = `<div class="empty-state">Aucun tableau</div>`;
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host { 
                    display: inline-block; 
                    position: relative; /* Anchor for absolute menu */
                }
                
                /* Styles delegated to m3-menu-item */
                .empty-state {
                    padding: var(--md-sys-spacing-16);
                    color: var(--md-sys-color-error);
                    text-align: center;
                }
            </style>
            
            <m3-button 
                id="selector-btn"
                variant="primary-tonal" 
                label="${this.boardName}"
                icon="${this.isParent ? 'expand_more' : ''}"
                ${!this.isParent ? 'disabled' : ''}
            >
                ${this.isParent ? `<m3-icon slot="icon" name="expand_more" size="20px"></m3-icon>` : ''}
            </m3-button>

            ${this.isParent ? `
                <m3-menu id="board-menu" anchor="selector-btn" alignment="center">
                   ${menuItemsHTML}
                </m3-menu>
            ` : ''}
        `;

        if (this.isParent) {
            const btn = this.shadowRoot.getElementById('selector-btn');
            const menu = this.shadowRoot.getElementById('board-menu');

            // Explicitly link anchor to avoid ID resolution issues
            if (menu && btn) {
                menu.anchorElement = btn;
            }

            btn.addEventListener('click', (e) => {
                // Let event bubble so other menus can close via window listener
                menu.setAttribute('visible', 'true');
            });

            // Responsive Alignment Logic
            const updateAlignment = () => {
                const isMobile = window.matchMedia('(max-width: 600px)').matches;
                // On mobile, the button is Left-Aligned (flush start), so 'center' alignment crops it. Use 'start'.
                // On desktop, the button is Center-Aligned, so 'center' looks best.
                menu.setAttribute('alignment', isMobile ? 'start' : 'center');
            };

            // Run once
            updateAlignment();

            // Listen for changes
            const mql = window.matchMedia('(max-width: 600px)');
            mql.addEventListener('change', updateAlignment);

            const items = this.shadowRoot.querySelectorAll('.menu-item');
            items.forEach(item => {
                item.addEventListener('click', () => this.selectBoard(item.dataset.id));
            });
        }
    }
}

customElements.define('board-selector', BoardSelector);
