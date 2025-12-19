import { LitElement, html, css, unsafeCSS } from 'lit';
import { boardService } from '../services/board-service'
import './m3/m3-card.js';
import './renard-icon.js';
import { M3Breakpoints } from './m3/m3-breakpoints.js';

class RenardCounter extends LitElement {
    static properties = {
        total: { type: Number, reflect: true }
    };

    static styles = css`
        :host { font-family: inherit; display: block; margin-bottom: var(--md-sys-spacing-24); }
        
        h2 {
            font: var(--md-sys-typescale-title-medium);
            color: var(--md-sys-color-on-surface-variant);
            margin: 0 0 var(--md-sys-spacing-16) 0;
        }

        .counter-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: var(--md-sys-spacing-16); 
            text-align: center; 
            justify-items: stretch;
            width: 100%;
        }
        
        .counter-block { 
            padding: var(--md-sys-spacing-16); 
            border-radius: var(--md-sys-shape-corner-large); 
            /* Uses specific tier colors defined in style.css */
            background-color: var(--tier-bg);
            color: var(--tier-text); /* Derived or manual */
        }
        
        /* Mapping Tiers to CSS Variables */
        .tier-gold {
            /* Lighter than container for better contrast with dark text */
            --tier-bg: color-mix(in srgb, var(--md-sys-color-tertiary-container), white 40%);
            color: var(--md-sys-color-on-tertiary-container);
        }
        .tier-silver {
                /* Lighter than container for better contrast with dark text */
                --tier-bg: color-mix(in srgb, var(--md-sys-color-secondary-container), white 40%);
                color: var(--md-sys-color-on-secondary-container);
        }
        .tier-normal {
            /* Darkened slightly (20% white instead of 40%) */
            --tier-bg: color-mix(in srgb, var(--md-sys-color-primary-container), white 20%);
            color: var(--md-sys-color-on-primary-container);
        }

        @media (prefers-color-scheme: dark) {
            .tier-gold {
                --tier-bg: var(--md-sys-color-tertiary-container);
                color: var(--md-sys-color-on-tertiary-container);
            }
            .tier-silver {
                --tier-bg: var(--md-sys-color-secondary-container);
                color: var(--md-sys-color-on-secondary-container);
            }
            .tier-normal {
                --tier-bg: var(--md-sys-color-primary-container);
                color: var(--md-sys-color-on-primary-container);
            }
        }

        .counter-label { 
            font: var(--md-sys-typescale-title-small);
            margin: 0 0 var(--md-sys-spacing-8) 0;
        }
        
        .counter-display { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: var(--md-sys-spacing-8); 
        }
        
        .counter-value { 
            font: var(--md-sys-typescale-display-small);
            font-weight: 700;
            font-variant-numeric: tabular-nums;
            color: var(--md-sys-color-on-surface); /* Blackish */
        }
        
        .counter-pulse { animation: pulse-anim var(--md-sys-motion-duration-medium) var(--md-sys-motion-easing-emphasized); }
        
        @keyframes pulse-anim {
            0% { transform: scale(1); }
            50% { transform: scale(1.25); color: var(--md-sys-color-primary); }
            100% { transform: scale(1); }
        }

        @media (max-width: ${unsafeCSS(M3Breakpoints.MEDIUM)}) {
            .counter-grid {
                gap: var(--md-sys-spacing-8);
            }
            .counter-label {
                display: none;
            }
            .counter-block {
                padding: var(--md-sys-spacing-8);
            }
            .counter-display {
                flex-direction: column;
                gap: var(--md-sys-spacing-4);
            }
            .counter-value {
                font: var(--md-sys-typescale-headline-small); /* Smaller on mobile (24px/32px matches old 24px size but with correct line-height) */
            }
        }
    `;

    // Private Fields
    #unsubscribeToken = () => {};
    #shouldAnimate = false;

    constructor() {
        super();
        this.total = 0;
    }

    connectedCallback() {
        super.connectedCallback();

        this.#unsubscribeToken = boardService.onNewToken(() => {
            // Signal that we should animate after the next update cycle
            this.#shouldAnimate = true;
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.#unsubscribeToken();
    }

    updated(changedProperties) {
        if (this.#shouldAnimate) {
            this.#playAnimation();
            this.#shouldAnimate = false;
        }
    }

    #getMotionDuration(tokenName) {
        // Helper to get duration in ms from CSS variable
        const style = getComputedStyle(document.body);
        const val = style.getPropertyValue(tokenName).trim();
        if (val.endsWith('ms')) return parseInt(val, 10);
        if (val.endsWith('s')) return parseFloat(val) * 1000;
        return 0;
    }

    #playAnimation() {
        const counters = this.#calculateRenards(this.total);

        const normalCounterEl = this.shadowRoot.querySelector('#normal-container .counter-value');
        if (normalCounterEl) {
            normalCounterEl.classList.add('counter-pulse');
            // Use 'medium' duration for pulse removal
            const duration = this.#getMotionDuration('--md-sys-motion-duration-medium') || 400;
            setTimeout(() => normalCounterEl.classList.remove('counter-pulse'), duration);
        }

        // Normal to Silver (includes the case where we go from 9 to 0)
        if (counters.silver > 0 && counters.normal == 0) {
            this.#animateTransform('normal-container', 'silver-container', 'normal');
        }

        // Silver to Gold
        if (counters.gold > 0 && counters.silver == 0 && counters.normal == 0) {
            this.#animateTransform('silver-container', 'gold-container', 'silver');
        }
    }

    #calculateRenards(total) {
        const gold = Math.floor(total / 100);
        const silver = Math.floor((total % 100) / 10);
        const normal = total % 10;
        return { gold, silver, normal };
    }

    #createCounterBlock(id, label, count, iconType, classSuffix) {
        return html`
            <div id="${id}" class="counter-block ${classSuffix}" title="${label}">
                <h3 class="counter-label">
                    ${label}
                </h3>
                <div class="counter-display">
                    <div class="counter-value">${count}</div>
                    <renard-icon type="${iconType}" size="40px"></renard-icon>
                </div>
            </div>
        `;
    }

    render() {
        const { gold, silver, normal } = this.#calculateRenards(this.total);

        return html`
            <m3-card variant="elevated">
                <h2>Ton Trésor Disponible</h2>
                <div class="counter-grid">
                    ${this.#createCounterBlock('gold-container', 'Dorés', gold, 'gold', 'tier-gold')}
                    ${this.#createCounterBlock('silver-container', 'Argentés', silver, 'silver', 'tier-silver')}
                    ${this.#createCounterBlock('normal-container', 'Normaux', normal, 'normal', 'tier-normal')}
                </div>
            </m3-card>
        `;
    }

    #animateTransform(fromId, toId, particleType) {
        const fromContainer = this.shadowRoot.getElementById(fromId);
        const toContainer = this.shadowRoot.getElementById(toId);
        if (!fromContainer || !toContainer) return;

        const fromRect = fromContainer.getBoundingClientRect();
        const toRect = toContainer.getBoundingClientRect();

        // Use 'extra-long' duration (2x long) for the coin shower effect to create delight.
        const longDuration = this.#getMotionDuration('--md-sys-motion-duration-long') || 600;
        const animDuration = longDuration * 2; 

        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('renard-icon');
            particle.setAttribute('type', particleType);
            particle.setAttribute('size', '40px');
            Object.assign(particle.style, {
                position: 'fixed', zIndex: 'var(--md-sys-z-index-tooltip)',
                left: `${fromRect.left + fromRect.width / 2 + (Math.random() - 0.5) * 40 - 20}px`,
                top: `${fromRect.top + fromRect.height / 2 + (Math.random() - 0.5) * 40 - 20}px`,
                transition: `all ${animDuration}ms ease-in-out`, pointerEvents: 'none'
            });

            document.body.appendChild(particle);

            requestAnimationFrame(() => {
                setTimeout(() => {
                    particle.style.left = `${toRect.left + toRect.width / 2 - 20}px`;
                    particle.style.top = `${toRect.top + toRect.height / 2 - 20}px`;
                    particle.style.transform = 'scale(0)';
                    particle.style.opacity = '0';
                }, 50);
            });

            setTimeout(() => particle.remove(), animDuration + 100);
        }
    }
}

customElements.define('renard-counter', RenardCounter);
