
// components/reward-card.js
import { LitElement, html, css, nothing, unsafeCSS } from 'lit';
import { userService } from '../services/user-service.js';
import { M3Breakpoints } from './m3/m3-breakpoints.js';
import './renard-icon.js';
import './m3/m3-card.js';

import './m3/m3-icon-button.js';

class RewardCard extends LitElement {
    static properties = {
        label: { type: String },
        cost: { type: Number },
        emoji: { type: String },
        availableToken: { type: Number, attribute: 'available-token' },
        pending: { type: Boolean, reflect: true }
    };

    static styles = css`
        :host { display: block; height: 100%; position: relative; }

        .card-content {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: var(--md-sys-spacing-16);
            height: 100%;
            box-sizing: border-box;
        }

        @media (min-width: ${unsafeCSS(M3Breakpoints.MEDIUM)}) {
            .card-content {
                flex-direction: column;
                justify-content: center;
                text-align: center;
                gap: var(--md-sys-spacing-8);
                aspect-ratio: 1 / 1;
            }
        }

        /* Locked State */
        :host(.state-locked) m3-card {
            opacity: 0.6;
            pointer-events: none;
        }

        /* Pending State */
        :host([pending]) m3-card {
            --m3-card-bg: var(--md-sys-color-surface-container); 
            --m3-card-shadow: var(--md-sys-elevation-1), inset 0 0 0 2px var(--renard-token-gold-fill);
        }

        .emoji {
            font: var(--md-sys-typescale-headline-large);
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }
        @media (min-width: ${unsafeCSS(M3Breakpoints.MEDIUM)}) { 
            .emoji { font: var(--md-sys-typescale-display-medium); } 
        }
        
        .info {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0;
        }
        
        @media (min-width: ${unsafeCSS(M3Breakpoints.MEDIUM)}) {
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
        @media (min-width: ${unsafeCSS(M3Breakpoints.MEDIUM)}) { .cost-badge { justify-content: center; } }
        
        /* PRIMARY CONFIRMATION BUTTON */
        .confirmation-badge {
            /* Mobile: Static position (part of flux), pushed to end */
            position: relative;
            margin-left: auto; /* Push to right in flex row */
            z-index: 2;
            
            /* Animation */
            animation: scale-in var(--md-sys-motion-duration-medium) var(--md-sys-motion-easing-emphasized);
        }
        
        @keyframes scale-in {
             from { transform: scale(0); opacity: 0; }
             to { transform: scale(1); opacity: 1; }
        }
        
        @media (min-width: ${unsafeCSS(M3Breakpoints.MEDIUM)}) {
            .confirmation-badge {
                /* Desktop (Grid): Absolute Top-Right */
                position: absolute;
                top: var(--md-sys-spacing-12);
                right: var(--md-sys-spacing-12);
                margin-left: 0;
            }
        }
    `;

    #handleConfirmClick(e) {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('request-confirmation', {
            bubbles: false,
            composed: true
        }));
    }

    updated(changedProperties) {
         if (changedProperties.has('availableToken') || changedProperties.has('cost') || changedProperties.has('pending')) {
             const canAfford = this.availableToken >= this.cost;
             
             this.classList.remove('state-pending', 'state-affordable', 'state-locked');
             
             if (this.pending) {
                 this.classList.add('state-pending');
             } else if (canAfford) {
                 this.classList.add('state-affordable');
             } else {
                 this.classList.add('state-locked');
             }
         }
    }

    render() {
        const currentUser = userService.getCurrentUser();
        const isParent = currentUser && currentUser.isParent;
        const showConfirmBtn = this.pending && isParent;

        return html`
            <m3-card id="container" variant="elevated" clickable>
                 <div class="card-content">
                    <div class="emoji">${this.emoji}</div>
                    <div class="info">
                        <h4 class="label">${this.label}</h4>
                        <div class="cost-badge">
                            <span>${this.cost}</span>
                            <renard-icon type="normal" size="28px"></renard-icon>
                        </div>
                    </div>
                    ${showConfirmBtn ? html`
                        <m3-icon-button
                            id="confirm-btn"
                            class="confirmation-badge"
                            variant="filled"
                            aria-label="Valider la récompense"
                            icon="check"
                            @click="${(e) => this.#handleConfirmClick(e)}"
                        ></m3-icon-button>
                    ` : nothing}
                </div>
            </m3-card>
        `;
    }
}

customElements.define('reward-card', RewardCard);
