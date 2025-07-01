// components/add-renard-button.js
import { userStore } from '../stores/user-store.js';
import { rewardBoardStore } from '../stores/reward-board-store.js';

class AddRenardButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.unsubscribeUser = () => {};
    }

    connectedCallback() {
        this.render();

        // The button listens to the user store to manage its own visibility
        this.style.display = 'none'; // Hidden by default
        this.unsubscribeUser = userStore.onAuthenticatedUser(userData => {
            this.style.display = userData.role === 'parent' ? 'block' : 'none';
        });

        // The button now calls the store directly, no boardId needed
        this.shadowRoot.querySelector('button').addEventListener('click', () => {
            rewardBoardStore.addNewToken();
        });
    }

    disconnectedCallback() {
        this.unsubscribeUser();
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
