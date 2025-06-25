// components/reward-card.js

class RewardCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this._attachEventListeners();
    }

    static get observedAttributes() {
        return ['name', 'cost', 'icon', 'is-pending', 'can-afford', 'is-parent-mode'];
    }

    attributeChangedCallback() {
        this.render();
        this._attachEventListeners();
    }

    render() {
        const name = this.getAttribute('name') || '';
        const cost = this.getAttribute('cost') || '0';
        const icon = this.getAttribute('icon') || '';
        const isPending = this.getAttribute('is-pending') === 'true';
        const canAfford = this.getAttribute('can-afford') === 'true';
        const isParentMode = this.getAttribute('is-parent-mode') === 'true';

        // Logique de classe corrigée pour la carte
        let stateClass = '';
        if (isPending) {
            stateClass = 'card--pending';
        } else if (canAfford) {
            stateClass = 'card--affordable';
        } else {
            stateClass = 'card--unaffordable';
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    height: 100%;
                    font-family: inherit;
                }
                .card {
                    position: relative;
                    text-align: center;
                    padding: 1rem;
                    border-radius: 0.75rem;
                    border-width: 2px;
                    height: 100%;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    transition: all 0.3s ease-in-out;
                    border-color: #E5E7EB; /* slate-200 */
                }
                .card--unaffordable {
                    background-color: #F1F5F9; /* slate-100 */
                    color: #94A3B8; /* slate-400 */
                    cursor: not-allowed;
                }
                .card--affordable {
                    background-color: white;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
                    cursor: pointer;
                }
                .card--affordable:hover {
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
                    transform: translateY(-4px);
                }
                /* La version "pending" est une variation de "affordable" */
                .card--pending {
                    background-color: white;
                    cursor: pointer;
                    /* Style du contour de sélection, qui écrase l'ombre par défaut */
                    box-shadow: 0 0 0 3px #FBBF24; /* amber-400 */
                    transform: translateY(-2px);
                }
                .icon {
                    font-size: 2.25rem;
                    margin-bottom: 0.5rem;
                }
                .name {
                    font-size: 1.125rem;
                    font-weight: 700;
                    margin: 0; /* Correction du bug de marge */
                }
                .cost {
                    margin-top: 0.5rem;
                    font-size: 1.25rem;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
                .cost--affordable {
                    color: #F59E0B; /* amber-500 */
                }
                .validate-btn {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    background-color: #22C55E; /* green-500 */
                    color: white;
                    width: 2rem;
                    height: 2rem;
                    border-radius: 9999px;
                    border: none;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
                    cursor: pointer;
                    font-size: 1.2rem;
                    line-height: 1;
                }
                .validate-btn:hover {
                    background-color: #16A34A; /* green-600 */
                }
                .validate-btn--visible {
                    display: flex;
                }
            </style>
            
            <div class="card ${stateClass}">
                <button class="validate-btn ${isPending && isParentMode ? 'validate-btn--visible' : ''}">
                    ✔
                </button>
                <div class="icon">${icon}</div>
                <h4 class="name">${name}</h4>
                <div class="cost ${canAfford ? 'cost--affordable' : ''}">
                    ${cost}
                    <renard-icon size="24px" style="vertical-align: middle;"></renard-icon>
                </div>
            </div>
        `;
    }

    _attachEventListeners() {
        const cardElement = this.shadowRoot.querySelector('.card');
        cardElement.addEventListener('click', (e) => {
            if (e.target.closest('.validate-btn')) return;
            if (this.getAttribute('can-afford') === 'true' || this.getAttribute('is-pending') === 'true') {
                this.dispatchEvent(new CustomEvent('toggle-pending'));
            }
        });

        const validateButton = this.shadowRoot.querySelector('.validate-btn');
        validateButton.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('validate-reward'));
        });
    }
}

customElements.define('reward-card', RewardCard);
