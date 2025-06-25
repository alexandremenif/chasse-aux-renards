// components/renard-counter.js

class RenardCounter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.total = 0; // Garde une trace interne du total pour comparer les changements
    }

    connectedCallback() {
        this.total = parseInt(this.getAttribute('total') || '0', 10);
        this.render();
    }

    static get observedAttributes() {
        return ['total'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const newTotal = parseInt(newValue || '0', 10);
        if (this.total !== newTotal) {
            this.render(this.total, newTotal);
            this.total = newTotal; // Met à jour le total interne après le rendu
        }
    }

    _calculateRenards(total) {
        const gold = Math.floor(total / 100);
        const silver = Math.floor((total % 100) / 10);
        const normal = total % 10;
        return { gold, silver, normal };
    }

    _createCounterBlockHTML(id, label, count, iconType, colors) {
        return `
            <div id="${id}" class="counter-block" style="background-color: ${colors.bg}; border-color: ${colors.border};">
                <h3 class="counter-label" style="color: ${colors.text};">
                    ${label}
                </h3>
                <div class="counter-display">
                    <div id="${iconType}-value" class="counter-value">${count}</div>
                    <renard-icon type="${iconType}" size="40px"></renard-icon>
                </div>
            </div>
        `;
    }

    render(oldTotal = null, newTotal = null) {
        const totalToRender = newTotal !== null ? newTotal : this.total;
        const { gold, silver, normal } = this._calculateRenards(totalToRender);

        const goldHTML = this._createCounterBlockHTML('gold-container', 'Dorés', gold, 'gold', { bg: '#FEFCE8', border: '#FDE68A', text: '#CA8A04' });
        const silverHTML = this._createCounterBlockHTML('silver-container', 'Argentés', silver, 'silver', { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569' });
        const normalHTML = this._createCounterBlockHTML('normal-container', 'Normaux', normal, 'normal', { bg: '#FFF7ED', border: '#FED7AA', text: '#EA580C' });

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    font-family: inherit; 
                }
                .counter-grid {
                    display: grid;
                    grid-template-columns: repeat(1, minmax(0, 1fr));
                    gap: 1rem;
                    text-align: center;
                }
                @media (min-width: 768px) {
                    .counter-grid {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                }
                .counter-block {
                    padding: 1rem;
                    border-radius: 0.75rem;
                    border-width: 2px;
                }
                .counter-label {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
                .counter-display {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
                .counter-value {
                    font-size: 2.25rem;
                    font-weight: 900;
                }
                .counter-pulse {
                    animation: pulse-anim 0.4s ease-out;
                }
                @keyframes pulse-anim {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.25); color: #F97316; }
                    100% { transform: scale(1); }
                }
            </style>
            <div class="counter-grid">
                ${goldHTML}
                ${silverHTML}
                ${normalHTML}
            </div>
        `;
        
        if (oldTotal !== null && newTotal !== null) {
            const oldCounts = this._calculateRenards(oldTotal);
            const newCounts = this._calculateRenards(newTotal);

            if (newTotal > oldTotal) {
                const normalCounterEl = this.shadowRoot.querySelector('#normal-container .counter-value');
                if (normalCounterEl) {
                    normalCounterEl.classList.add('counter-pulse');
                    setTimeout(() => normalCounterEl.classList.remove('counter-pulse'), 400);
                }
            }
            if (newCounts.silver > oldCounts.silver) {
                this._animateTransform('normal-container', 'silver-container', 'normal');
            }
            if (newCounts.gold > oldCounts.gold) {
                this._animateTransform('silver-container', 'gold-container', 'silver');
            }
        }
    }

    _animateTransform(fromId, toId, particleType) {
        const fromContainer = this.shadowRoot.getElementById(fromId);
        const toContainer = this.shadowRoot.getElementById(toId);
        if (!fromContainer || !toContainer) return;

        const fromRect = fromContainer.getBoundingClientRect();
        const toRect = toContainer.getBoundingClientRect();

        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('renard-icon');
            particle.setAttribute('type', particleType);
            particle.setAttribute('size', '40px');
            Object.assign(particle.style, {
                position: 'fixed',
                zIndex: '100',
                left: `${fromRect.left + fromRect.width / 2 + (Math.random() - 0.5) * 40 - 20}px`,
                top: `${fromRect.top + fromRect.height / 2 + (Math.random() - 0.5) * 40 - 20}px`,
                transition: 'all 1.2s ease-in-out',
                pointerEvents: 'none'
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

            setTimeout(() => particle.remove(), 1600);
        }
    }
}

customElements.define('renard-counter', RenardCounter);
