// components/add-renard-button.js
import { rewardBoardService } from '../services/reward-board.js';

class AddRenardButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['board-id'];
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.querySelector('button').addEventListener('click', () => {
            const boardId = this.getAttribute('board-id');
            if (boardId) {
                rewardBoardService.incrementToken(boardId);
            }
        });
    }

    render() {
        const size = '4.5rem';

        this.shadowRoot.innerHTML = `
            <style>
                button {
                    width: ${size};
                    height: ${size};
                    border-radius: 9999px;
                    background-color: #F97316;
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    transition: all 0.2s ease-out;
                }

                button:hover {
                    background-color: #EA580C;
                    transform: scale(1.05);
                }
            </style>
            
            <button>
                <renard-icon type="white" size="${size}"></renard-icon>
            </button>
        `;
    }
}

customElements.define('add-renard-button', AddRenardButton);
