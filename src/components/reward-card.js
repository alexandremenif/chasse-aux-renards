
// components/reward-card.js
import { userService } from '../services/user-service.js';
import { M3Breakpoints } from './m3/m3-breakpoints.js';
import './renard-icon.js';
import './m3/m3-card.js';
import './m3/m3-icon.js';
import './m3/m3-icon-button.js';

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

        // 1. First Rendering (Initialization)
        if (!this.shadowRoot.getElementById('container')) {
            this.shadowRoot.innerHTML = `
                <style>
                    :host { display: block; height: 100%; position: relative; }

                    m3-card {
                        height: 100%;
                        /* Padding handled by m3-card default (16px / md-sys-spacing-16) */
                    }
                    
                    /* Internal Layout Wrapper to replace the old div behavior */
                    .card-content {
                        display: flex;
                        align-items: center;
                        justify-content: flex-start;
                        gap: var(--md-sys-spacing-16);
                        height: 100%;
                        box-sizing: border-box;
                        /* Padding removed to avoid double padding with m3-card container */
                    }

                    @media (min-width: ${M3Breakpoints.MEDIUM}) {
                        .card-content {
                            flex-direction: column;
                            justify-content: center;
                            text-align: center;
                            gap: var(--md-sys-spacing-8);
                            aspect-ratio: 1 / 1;
                        }
                    }

                    /* State Styling via ::part */
                    
                    /* Locked State */
                    :host(.state-locked) m3-card {
                        opacity: 0.6;
                        pointer-events: none;
                    }

                    /* Pending State */
                    :host(.state-pending) m3-card::part(card) {
                        background-color: var(--md-sys-color-surface-container); 
                        /* use box-shadow inset to avoid layout shift and potential border/background-clip issues */
                        box-shadow: var(--md-sys-elevation-1), inset 0 0 0 2px var(--renard-token-gold-fill);
                    }

                    .emoji {
                        /* font-size: 30px; -> Headline Large */
                        font: var(--md-sys-typescale-headline-large);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        line-height: 1;
                    }
                    @media (min-width: ${M3Breakpoints.MEDIUM}) { 
                        /* .emoji { font-size: 48px; } -> Display Medium */
                        .emoji { font: var(--md-sys-typescale-display-medium); } 
                    }
                    
                    .info {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0;
                    }
                    
                    @media (min-width: ${M3Breakpoints.MEDIUM}) {
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
                        gap: var(--md-sys-spacing-4);
                        font: var(--md-sys-typescale-label-large);
                        font-variant-numeric: tabular-nums;
                        color: var(--md-sys-color-primary);
                    }
                    @media (min-width: ${M3Breakpoints.MEDIUM}) { .cost-badge { justify-content: center; } }
                    
                    /* PRIMARY CONFIRMATION BUTTON */
                    .confirmation-badge {
                        /* Mobile: Static position (part of flux), pushed to end */
                        position: relative;
                        margin-left: auto; /* Push to right in flex row */
                        z-index: 2;
                        
                        /* Animation */
                        animation: var(--md-sys-motion-keyframes-scale-in) var(--md-sys-motion-duration-medium) var(--md-sys-motion-easing-emphasized);
                    }
                    
                    @media (min-width: ${M3Breakpoints.MEDIUM}) {
                        .confirmation-badge {
                            /* Desktop (Grid): Absolute Top-Right */
                            position: absolute;
                            top: var(--md-sys-spacing-12);
                            right: var(--md-sys-spacing-12);
                            margin-left: 0;
                        }
                    }
                    
                    }
                    
                    /* scaleIn is now global in style.css */
                </style>
                
                <m3-card id="container" variant="elevated" clickable>
                     <div class="card-content">
                        <div id="emoji-slot" class="emoji"></div>
                        <div class="info">
                            <h4 id="label-slot" class="label"></h4>
                            <div class="cost-badge">
                                <span id="cost-slot"></span>
                                <renard-icon type="normal" size="28px"></renard-icon>
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
                const btn = document.createElement('m3-icon-button');
                btn.id = 'confirm-btn';
                btn.className = 'confirmation-badge'; // For positioning
                btn.setAttribute('variant', 'filled');
                btn.setAttribute('aria-label', 'Valider la récompense');
                btn.setAttribute('icon', 'check');

                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.dispatchEvent(new CustomEvent('request-confirmation', {
                        bubbles: true,
                        composed: true
                    }));
                });

                // Append to m3-card (End of the flex container for "Trailing Icon" pattern)
                const contentDiv = this.shadowRoot.querySelector('.card-content');
                contentDiv.appendChild(btn);
            }
        } else {
            if (confirmBtn) {
                confirmBtn.remove();
            }
        }
    }
}

customElements.define('reward-card', RewardCard);
