// components/add-renard-button.js

class AddRenardButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const size = '4.5rem'; // La taille est définie ici comme une variable.

        this.shadowRoot.innerHTML = `
            <style>
                button {
                    /* Style du bouton, repris de #add-fox-btn dans style.css */
                    width: ${size};
                    height: ${size};
                    border-radius: 9999px; /* Cercle complet */
                    background-color: #F97316; /* orange-500 */
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                    border: none;
                    cursor: pointer;
                    padding: 0; /* On s'assure qu'il n'y a pas de padding */
                    
                    /* Animation */
                    transition: all 0.2s ease-out;
                }

                button:hover {
                    background-color: #EA580C; /* orange-600 */
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
