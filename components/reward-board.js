// components/reward-board.js

class RewardBoard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        // --- Component State ---
        this._data = { child: null, rewards: [] };
        this._isParentMode = false;
        this._isSetup = false; // Flag to prevent re-rendering the scaffold
        // --- Element References ---
        this.renardCounter = null;
        this.rewardsGrid = null;
        this.modal = null;
    }

    // --- Properties for receiving data ---
    set data(data) {
        this._data = data;
        if (!this._isSetup && this._data.rewards && this._data.rewards.length > 0) {
            this._setup();
        }
        this._renderAll();
    }
    get data() { return this._data; }

    set parentMode(isParent) {
        this._isParentMode = isParent;
        this._renderStore();
    }
    get parentMode() { return this._isParentMode; }

    // --- Public Method ---
    addRenard() {
        if (!this.data.child || !this.renardCounter) return;
        
        // 1. Update the state. This is the new source of truth.
        this.data.child.totalTokens++;
        
        // 2. Schedule the non-critical store render for the next event loop tick.
        setTimeout(() => {
            this._renderStore();
        }, 0);

        // 3. Immediately execute the critical UI updates for instant feedback.
        this._renderCounter();
        this.renardCounter.playAnimation();
    }
    
    // --- Private Methods ---

    _setup() {
        this.shadowRoot.innerHTML = `
            <style>
                .dashboard-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
                .section { background-color: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1); }
                .section-title { text-align: center; font-size: 1.5rem; font-weight: 700; margin: 0 0 1rem 0; }
                .rewards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
            </style>
            <div class="dashboard-grid">
                <section class="section">
                    <h2 class="section-title">Ton Trésor Disponible</h2>
                    <renard-counter></renard-counter>
                </section>
                <section class="section">
                    <h2 class="section-title">Les Récompenses</h2>
                    <div class="rewards-grid"></div>
                </section>
            </div>
        `;
        this.renardCounter = this.shadowRoot.querySelector('renard-counter');
        this.rewardsGrid = this.shadowRoot.querySelector('.rewards-grid');
        this.modal = document.getElementById('confirmation-modal');
        this._isSetup = true;
    }

    _renderAll() {
        if (!this._isSetup) return;
        this._renderCounter();
        this._renderStore();
    }

    _renderCounter() {
        if (!this.renardCounter || !this.data.child) return;
        this.renardCounter.setAttribute('total', this._getAvailableTokens());
    }

    _renderStore() {
        if (!this.rewardsGrid || !this.data.child) return;

        const availableTokens = this._getAvailableTokens();
        this.rewardsGrid.innerHTML = '';

        this.data.rewards.forEach(reward => {
            const rewardCard = this._createRewardCard(reward, availableTokens);
            this.rewardsGrid.appendChild(rewardCard);
        });
    }
    
    _createRewardCard(reward, availableTokens) {
        const isPending = this.data.child.pendingRewardIds.includes(reward.id);
        const canAfford = availableTokens >= reward.cost || isPending;
        
        const rewardCard = document.createElement('reward-card');
        rewardCard.setAttribute('name', reward.name);
        rewardCard.setAttribute('cost', reward.cost);
        rewardCard.setAttribute('icon', reward.icon);
        rewardCard.setAttribute('is-pending', String(isPending));
        rewardCard.setAttribute('can-afford', String(canAfford));
        rewardCard.setAttribute('is-parent-mode', String(this.parentMode));

        rewardCard.addEventListener('toggle-pending', () => this._handleTogglePending(reward));
        rewardCard.addEventListener('validate-reward', () => this._handleValidate(reward));
        
        return rewardCard;
    }
    
    _handleTogglePending(reward) {
        const isPending = this.data.child.pendingRewardIds.includes(reward.id);
        if (isPending) {
            this.data.child.pendingRewardIds = this.data.child.pendingRewardIds.filter(id => id !== reward.id);
        } else if (this._getAvailableTokens() >= reward.cost) {
            this.data.child.pendingRewardIds.push(reward.id);
        }
        this._renderAll();
    }
    
    _handleValidate(reward) {
        this.modal.setAttribute('title', `Valider ${reward.name} ?`);
        this.modal.setAttribute('message', `Cette action dépensera <strong>${reward.cost} renards</strong> pour <strong>${this.data.child.name}</strong> et est définitive.`);
        
        const confirmHandler = () => {
            if (this.data.child.totalTokens >= reward.cost) {
                this.data.child.totalTokens -= reward.cost;
            }
            this.data.child.pendingRewardIds = this.data.child.pendingRewardIds.filter(id => id !== reward.id);
            this._renderAll();
            this.modal.removeEventListener('confirmed', confirmHandler);
        };
        
        this.modal.addEventListener('confirmed', confirmHandler, { once: true });
        this.modal.addEventListener('cancelled', () => {
             this.modal.removeEventListener('confirmed', confirmHandler);
        }, { once: true });
        
        this.modal.setAttribute('visible', '');
    }

    _calculatePendingCost() {
        if (!this.data.child) return 0;
        return this.data.child.pendingRewardIds.reduce((sum, id) => {
            const rewardData = this.data.rewards.find(r => r.id === id);
            return sum + (rewardData ? rewardData.cost : 0);
        }, 0);
    }
    
    _getAvailableTokens() {
        if (!this.data.child) return 0;
        return this.data.child.totalTokens - this._calculatePendingCost();
    }
}

customElements.define('reward-board', RewardBoard);
