
// components/reward-card.js
import { userService } from '../services/user-service.js';
import './renard-icon.js';
import './m3/m3-card.js';
import './m3/m3-icon.js';

class RewardCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['label', 'cost', 'emoji', 'available-token', 'pending'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const label = this.getAttribute('label') || 'Récompense';
        const cost = parseInt(this.getAttribute('cost') || '0', 10);
        const emoji = this.getAttribute('emoji') || '🎁';
        const availableToken = parseInt(this.getAttribute('available-token') || '0', 10);
        const isPending = this.hasAttribute('pending');

        const canAfford = availableToken >= cost;
        const isLocked = !canAfford && !isPending;

        // 1. First Rendering (Initialization)
        if (!this.shadowRoot.getElementById('container')) {
            this.shadowRoot.innerHTML = `
                <style>
                    :host { display: block; height: 100%; position: relative; }

                    m3-card {
                        height: 100%;
                        --md-card-padding: 0; /* We might want to control padding manually or let m3-card handle it */
                    }
                    
                    /* Internal Layout Wrapper to replace the old div behavior */
                    .card-content {
                        display: flex;
                        align-items: center;
                        justify-content: flex-start;
                        gap: var(--md-sys-spacing-16);
                        height: 100%;
                        box-sizing: border-box;
                        padding: var(--md-sys-spacing-16); /* Apply padding here */
                    }

                    @media (min-width: 768px) {
                        .card-content {
                            flex-direction: column;
                            justify-content: center;
                            text-align: center;
                            gap: var(--md-sys-spacing-8);
                            aspect-ratio: 1 / 1;
                            padding: var(--md-sys-spacing-16); /* Apply padding here */
                        }
                    }

                    /* State Styling via ::part */
                    /* Affordable: Hover Effect handled by m3-card clickable already? 
                       But we want specific translation. m3-card handles brightness. 
                       Let's trust m3-card for now, or add transform if desired. */
                    
                    /* Locked State */
                    :host(.state-locked) m3-card {
                        opacity: 0.6;
                        pointer-events: none;
                    }

                    /* Pending State */
                    :host(.state-pending) m3-card::part(card) {
                        background-color: var(--md-sys-color-surface-container); 
                        border: 3px solid var(--md-sys-color-tertiary); 
                    }

                    .emoji {
                        font-size: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        line-height: 1;
                    }
                    @media (min-width: 768px) { .emoji { font-size: 48px; } }
                    
                    .info {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0;
                    }
                    
                    @media (min-width: 768px) {
                        .info { align-items: center; justify-content: center; }
                    }

                    .label {
                        margin: 0;
                        font: var(--md-sys-typescale-title-medium);
                        color: var(--md-sys-color-on-surface);
                        line-height: 1.75rem;
                    }

                    .cost-badge {
                        display: inline-flex;
                        align-items: center;
                        justify-content: flex-start;
                        gap: 4px;
                        font: var(--md-sys-typescale-label-large);
                        color: var(--md-sys-color-primary);
                    }
                    @media (min-width: 768px) { .cost-badge { justify-content: center; } }
                    
                    /* PRIMARY CONFIRMATION BUTTON */
                    .confirmation-badge {
                        position: absolute;
                        top: 50%;
                        right: 16px;
                        transform: translateY(-50%);
                        background-color: var(--md-sys-color-primary); 
                        color: var(--md-sys-color-on-primary);
                        border-radius: 50%; 
                        width: 40px; 
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: var(--md-sys-elevation-2);
                        animation: scaleIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        cursor: pointer;
                        z-index: 10;
                        transition: transform 0.1s;
                    }
                    
                    @media (min-width: 768px) {
                        .confirmation-badge {
                            top: 12px;
                            right: 12px;
                            transform: translateY(0);
                        }
                    }
                    
                    .confirmation-badge:hover { transform: translateY(-50%) scale(1.1); }
                    @media (min-width: 768px) { .confirmation-badge:hover { transform: scale(1.1); } }
                    
                    .confirmation-badge:active { transform: translateY(-50%) scale(0.95); }
                    @media (min-width: 768px) { .confirmation-badge:active { transform: scale(0.95); } }

                    @keyframes scaleIn {
                        from { transform: translateY(-50%) scale(0); }
                        to { transform: translateY(-50%) scale(1); }
                    }
                    
                    @media (min-width: 768px) {
                        @keyframes scaleIn {
                            from { transform: scale(0); }
                            to { transform: scale(1); }
                        }
                    }
                </style>
                
                <m3-card id="container" variant="elevated" clickable>
                     <div class="card-content">
                        <div id="emoji-slot" class="emoji"></div>
                        <div class="info">
                            <h4 id="label-slot" class="label"></h4>
                            <div class="cost-badge">
                                <span id="cost-slot"></span>
                                <renard-icon size="28px" type="normal"></renard-icon>
                            </div>
                        </div>
                    </div>
                </m3-card>
            `;
        }

        // 2. DOM Updates (Fine-grained)
        const emojiSlot = this.shadowRoot.getElementById('emoji-slot');
        const labelSlot = this.shadowRoot.getElementById('label-slot');
        const costSlot = this.shadowRoot.getElementById('cost-slot');

        // Update Text
        if (emojiSlot.textContent !== emoji) emojiSlot.textContent = emoji;
        if (labelSlot.textContent !== label) labelSlot.textContent = label;
        if (costSlot.textContent !== String(cost)) costSlot.textContent = cost;

        // Update Host and Card Classes
        // We move state classes to the HOST to manage them cleaner in style block
        this.classList.remove('state-pending', 'state-affordable', 'state-locked');
        if (isPending) {
            this.classList.add('state-pending');
        } else if (canAfford) {
            this.classList.add('state-affordable');
        } else {
            this.classList.add('state-locked');
        }

        // 3. Handle Confirmation Badge (Add/Remove)
        let confirmBtn = this.shadowRoot.getElementById('confirm-btn');
        const currentUser = userService.getCurrentUser();
        const isParent = currentUser && currentUser.isParent;
        const cardComponent = this.shadowRoot.getElementById('container');

        // Show button ONLY if Pending AND isParent
        if (isPending && isParent) {
            if (!confirmBtn) {
                // ADD button if missing
                const div = document.createElement('div');
                div.id = 'confirm-btn';
                div.className = 'confirmation-badge';
                div.title = 'Valider';
                div.innerHTML = '<m3-icon svg-path="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" size="24px"></m3-icon>';

                div.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.dispatchEvent(new CustomEvent('request-confirmation', {
                        bubbles: true,
                        composed: true
                    }));
                });

                // Append to m3-card (it has relative positioning context via part? No, m3-card host is block)
                // We append it to the light DOM of m3-card so it sits inside the slot/padding? 
                // Actually, m3-card's slot is the content data.
                // We want it absolute positioned relative to the card.
                // The m3-card internal div is strictly overflow:hidden.
                // We might need to put the badge INSIDE the card content div.
                const contentDiv = this.shadowRoot.querySelector('.card-content');
                contentDiv.insertBefore(div, contentDiv.firstChild);
            }
        } else {
            if (confirmBtn) {
                confirmBtn.remove();
            }
        }
    }
}

customElements.define('reward-card', RewardCard);
