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
        if (oldValue !== newValue) {
            const newTotal = parseInt(newValue || '0', 10);
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

    render(oldTotal = null, newTotal = null) {
        const total = this.total;
        const { gold, silver, normal } = this._calculateRenards(total);

        // Le HTML est dessiné une seule fois dans connectedCallback, puis les chiffres sont mis à jour.
        if (oldTotal === null) {
            this.shadowRoot.innerHTML = `
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
                    @import "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";
                    .counter-grid { display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 1rem; font-family: 'Nunito', sans-serif; }
                    @media (min-width: 768px) { .counter-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
                    .counter-value { font-weight: 900; }
                    .counter-pulse { animation: pulse-anim 0.4s ease-out; }
                    @keyframes pulse-anim {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.25); color: #F97316; }
                        100% { transform: scale(1); }
                    }
                </style>
                <div class="counter-grid text-center">
                    <div id="gold-container" class="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                        <h3 class="text-xl font-bold mb-2 text-yellow-600">Dorés</h3>
                        <div class="flex items-center justify-center gap-2">
                            <div id="gold-value" class="text-4xl counter-value">${gold}</div>
                            <renard-icon type="gold" size="40px"></renard-icon>
                        </div>
                    </div>
                    <div id="silver-container" class="bg-slate-50 p-4 rounded-xl border-2 border-slate-200">
                        <h3 class="text-xl font-bold mb-2 text-slate-600">Argentés</h3>
                        <div class="flex items-center justify-center gap-2">
                            <div id="silver-value" class="text-4xl counter-value">${silver}</div>
                            <renard-icon type="silver" size="40px"></renard-icon>
                        </div>
                    </div>
                    <div id="normal-container" class="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                        <h3 class="text-xl font-bold mb-2 text-orange-600">Normaux</h3>
                        <div class="flex items-center justify-center gap-2">
                            <div id="normal-value" class="text-4xl counter-value">${normal}</div>
                            <renard-icon type="normal" size="40px"></renard-icon>
                        </div>
                    </div>
                </div>
            `;
        } else {
             this.shadowRoot.getElementById('gold-value').textContent = gold;
             this.shadowRoot.getElementById('silver-value').textContent = silver;
             this.shadowRoot.getElementById('normal-value').textContent = normal;
        }

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
                transition: 'all 1.2s ease-in-out'
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
