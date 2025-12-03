// components/add-renard-button.js
import { userService } from '../services/user-service.js';
import { boardService } from '../services/board-service.js';
import './renard-icon.js';

class AddRenardButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();

        this.style.display = 'none';
        if (userService.getCurrentUser().isParent) {
            this.style.display = 'block';
        }

        this.shadowRoot.querySelector('button').addEventListener('click', () => {
            boardService.addToken();
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
                    background-color: var(--primary-color);
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    transition: transform 0.1s ease-out;
                    outline: none;
                }

                button:active {
                    transform: scale(0.95);
                }
                button:focus-visible {
                    box-shadow: 0 0 0 4px;
                }
            </style>
            
            <button>
                <renard-icon type="white" size="${size}"></renard-icon>
            </button>
        `;
    }
}

customElements.define('add-renard-button', AddRenardButton);
