import { boardService } from '../services/board-service'
import './m3/m3-card.js';
import './renard-icon.js';

class RenardCounter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.total = 0;
        this.previousTotal = 0;
        this.isFirstRender = true;
        this.unsubscribeToken = () => { };
    }

    connectedCallback() {
        this.total = parseInt(this.getAttribute('total') || '0', 10);
        this.previousTotal = this.total;
        this.render();

        this.unsubscribeToken = boardService.onNewToken(() => {
            this.#playAnimation();
        });
    }

    disconnectedCallback() {
        this.unsubscribeToken();
    }

    static get observedAttributes() {
        return ['total'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.isFirstRender) return;
        this.previousTotal = parseInt(oldValue || '0', 10);
        this.total = parseInt(newValue || '0', 10);
        this.render();
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
        if (this.total <= this.previousTotal) return;

        const oldCounts = this.#calculateRenards(this.previousTotal);
        const newCounts = this.#calculateRenards(this.total);

        const normalCounterEl = this.shadowRoot.querySelector('#normal-container .counter-value');
        if (normalCounterEl) {
            normalCounterEl.classList.add('counter-pulse');
            // Use 'medium' duration for pulse removal
            const duration = this.#getMotionDuration('--md-sys-motion-duration-medium') || 400;
            setTimeout(() => normalCounterEl.classList.remove('counter-pulse'), duration);
        }

        // Normal to Silver (includes the case where we go from 9 to 0)
        if (newCounts.silver > oldCounts.silver || (oldCounts.silver === 9 && newCounts.silver === 0)) {
            this.#animateTransform('normal-container', 'silver-container', 'normal');
        }

        // Silver to Gold
        if (newCounts.gold > oldCounts.gold) {
            this.#animateTransform('silver-container', 'gold-container', 'silver');
        }
    }

    #calculateRenards(total) {
        const gold = Math.floor(total / 100);
        const silver = Math.floor((total % 100) / 10);
        const normal = total % 10;
        return { gold, silver, normal };
    }

    #createCounterBlockHTML(id, label, count, iconType, classSuffix) {
        return `
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
        // isFirstRender logic ensures this runs only after connectedCallback sets the initial total.
        const total = this.isFirstRender ? this.total : parseInt(this.getAttribute('total') || '0', 10);
        const { gold, silver, normal } = this.#calculateRenards(total);

        if (this.isFirstRender) {
            const goldHTML = this.#createCounterBlockHTML('gold-container', 'Dorés', gold, 'gold', 'tier-gold');
            const silverHTML = this.#createCounterBlockHTML('silver-container', 'Argentés', silver, 'silver', 'tier-silver');
            const normalHTML = this.#createCounterBlockHTML('normal-container', 'Normaux', normal, 'normal', 'tier-normal');

            this.shadowRoot.innerHTML = `
                <style>
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
                        border-radius: 16px; 
                        /* Uses specific tier colors defined in style.css */
                        background-color: var(--tier-bg);
                        color: var(--tier-text); /* Derived or manual */
                        /* Reverted Shadow on inner blocks */
                        /* box-shadow: var(--md-sys-elevation-2); */
                    }
                    
                    /* Mapping Tiers to CSS Variables */
                    .tier-gold {
                        --tier-bg: var(--renard-color-gold-bg);
                        --tier-border: var(--renard-color-gold-border);
                        color: var(--renard-color-gold-text);
                    }
                    .tier-silver {
                         --tier-bg: var(--renard-color-silver-bg);
                         --tier-border: var(--renard-color-silver-border);
                         color: var(--renard-color-silver-text);
                    }
                    .tier-normal {
                        --tier-bg: var(--renard-color-normal-bg);
                        --tier-border: var(--renard-color-normal-border);
                        color: var(--md-sys-color-primary);
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
                    
                    .counter-pulse { animation: pulse-anim var(--md-sys-motion-duration-medium) ease-out; }
                    
                    @keyframes pulse-anim {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.25); color: var(--md-sys-color-primary); }
                        100% { transform: scale(1); }
                    }

                        /* REMOVED .card-container styles as they are now handled by m3-card */

                        @media (max-width: 640px) {
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
                                font-size: 24px; /* Smaller on mobile */
                            }
                        }
                    </style>
                    <m3-card variant="elevated">
                        <h2>Ton Trésor Disponible</h2>
                        <div class="counter-grid">
                            ${goldHTML}
                            ${silverHTML}
                            ${normalHTML}
                        </div>
                    </m3-card>
                `;

            this.isFirstRender = false;
        } else {
            const goldValue = this.shadowRoot.querySelector('#gold-container .counter-value');
            const silverValue = this.shadowRoot.querySelector('#silver-container .counter-value');
            const normalValue = this.shadowRoot.querySelector('#normal-container .counter-value');

            // Safety check: if elements are missing (e.g. shadowRoot wiped), re-render? 
            // Better: trust isFirstRender flag unless we suspect it getting out of sync.
            if (!goldValue) {
                this.isFirstRender = true;
                this.render();
                return;
            }
            if (goldValue) goldValue.textContent = gold;
            if (silverValue) silverValue.textContent = silver;
            if (normalValue) normalValue.textContent = normal;
        }
    }

    #animateTransform(fromId, toId, particleType) {
        const fromContainer = this.shadowRoot.getElementById(fromId);
        const toContainer = this.shadowRoot.getElementById(toId);
        if (!fromContainer || !toContainer) return;

        const fromRect = fromContainer.getBoundingClientRect();
        const toRect = toContainer.getBoundingClientRect();

        // Get duration for long animation (1.2s approx 2 * long)
        // Let's standardise on using 'long' * 2 for this slow effect or just 'long'
        // Original was 1.2s. 'long' is 600ms. So 2 * long.
        const longDuration = this.#getMotionDuration('--md-sys-motion-duration-long') || 600;
        const animDuration = longDuration * 2; 

        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('renard-icon');
            particle.setAttribute('type', particleType);
            particle.setAttribute('size', '40px');
            Object.assign(particle.style, {
                position: 'fixed', zIndex: '100',
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
