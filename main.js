document.addEventListener('DOMContentLoaded', () => {

    // --- ÉTAT DE L'APPLICATION ---
    let state = {
        children: [
            { id: 1, name: 'Daniel', totalTokens: 0, pendingRewardIds: [] },
            { id: 2, name: 'Evelyne', totalTokens: 0, pendingRewardIds: [] }
        ],
        currentChildId: 1,
        isParentMode: false,
    };

    // --- DONNÉES ---
    const rewards = [
        { id: 1, name: "Choisir le film", cost: 15, icon: '🎬' },
        { id: 2, name: "30 min de jeu spécial", cost: 20, icon: '🎲' },
        { id: 3, name: "Préparer un gâteau", cost: 35, icon: '🍰' },
        { id: 4, name: "Soirée pyjama", cost: 50, icon: '⛺' },
        { id: 5, name: "Sortie au parc", cost: 75, icon: '🌳' },
        { id: 6, name: "Le 'Grand Cadeau'", cost: 150, icon: '🎁' },
    ];

    // --- ÉLÉMENTS DU DOM ---
    const renardCounter = document.querySelector('renard-counter');
    const rewardsGrid = document.getElementById('rewards-grid');
    const addFoxBtn = document.getElementById('add-fox-btn');
    const controlsSection = document.getElementById('controls');
    const modeToggle = document.getElementById('mode-toggle');
    const modeLabel = document.getElementById('mode-label');
    const childNameSelector = document.getElementById('child-name-selector');
    const childNameDisplay = document.getElementById('child-name-display');
    const modal = document.getElementById('confirmation-modal');
    const childSelectionModal = document.getElementById('child-selection-modal');
    const childList = document.getElementById('child-list');


    // --- FONCTIONS DE LOGIQUE ---

    const getCurrentChild = () => state.children.find(c => c.id === state.currentChildId);
    
    const getPendingCost = () => {
        const child = getCurrentChild();
        if (!child) return 0;
        return child.pendingRewardIds.reduce((sum, id) => {
            const reward = rewards.find(r => r.id === id);
            return sum + (reward ? reward.cost : 0);
        }, 0);
    };
    
    const getAvailableTokens = () => {
        const child = getCurrentChild();
        if (!child) return 0;
        return child.totalTokens - getPendingCost();
    }

    const renderStore = (isFirstLoad = false) => {
        rewardsGrid.innerHTML = '';
        const availableTokens = getAvailableTokens();

        rewards.forEach(reward => {
            const child = getCurrentChild();
            const isPending = child.pendingRewardIds.includes(reward.id);
            const canAfford = availableTokens >= reward.cost || isPending;
            
            const rewardCard = document.createElement('div');
            rewardCard.dataset.id = reward.id;
            rewardCard.className = `p-4 rounded-xl border-2 transition-all duration-300 relative text-center`;
            
            let cardClasses = [];
            if (isPending) {
                cardClasses.push('pending-reward', 'bg-white');
            } else if (canAfford) {
                cardClasses.push('bg-white', 'shadow-md', 'hover:shadow-lg', 'hover:-translate-y-1', 'cursor-pointer');
            } else {
                cardClasses.push('bg-slate-100', 'text-slate-400', 'cursor-not-allowed');
            }
            rewardCard.classList.add(...cardClasses);
            
            rewardCard.innerHTML = `
                <div class="text-4xl mb-2">${reward.icon}</div>
                <h4 class="text-lg font-bold">${reward.name}</h4>
                <div class="mt-2 font-black text-xl flex items-center justify-center gap-2 ${canAfford ? 'text-amber-500' : ''}">
                    ${reward.cost} <renard-icon size="24px" style="vertical-align: middle;"></renard-icon>
                </div>
            `;
            
            if (isPending && state.isParentMode) {
                const validateButton = document.createElement('button');
                validateButton.className = 'validate-btn absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg';
                validateButton.innerHTML = `<i class="fas fa-check"></i>`;
                validateButton.onclick = (e) => {
                    e.stopPropagation();
                    showConfirmationModal(reward);
                };
                rewardCard.appendChild(validateButton);
            }
            
            if(canAfford) {
                rewardCard.addEventListener('click', () => togglePendingReward(reward));
            }
            rewardsGrid.appendChild(rewardCard);
        });
    };
    
    const togglePendingReward = (reward) => {
        const child = getCurrentChild();
        const isPending = child.pendingRewardIds.includes(reward.id);
        const availableTokens = getAvailableTokens();
        
        if (isPending) {
            child.pendingRewardIds = child.pendingRewardIds.filter(id => id !== reward.id);
        } else if (availableTokens >= reward.cost) {
            child.pendingRewardIds.push(reward.id);
        }
        render();
    };
    
    const addFox = () => {
        const child = getCurrentChild();
        child.totalTokens++;
        
        // On appelle la fonction de rendu principale.
        // Elle se chargera de mettre à jour le compteur ET les cartes de récompenses.
        render();

        // On déclenche l'animation après que tout a été redessiné.
        renardCounter.playAnimation();
    };
    
    const showConfirmationModal = (reward) => {
        const child = getCurrentChild();
        modal.setAttribute('title', `Valider ${reward.name} ?`);
        modal.setAttribute('message', `Cette action dépensera <strong>${reward.cost} renards</strong> pour <strong>${child.name}</strong> et est définitive.`);
        
        const confirmHandler = () => {
            if (child.totalTokens >= reward.cost) {
                child.totalTokens -= reward.cost;
            }
            child.pendingRewardIds = child.pendingRewardIds.filter(id => id !== reward.id);
            render();
            // Retirer l'écouteur après utilisation pour éviter les fuites
            modal.removeEventListener('confirmed', confirmHandler);
        };
        
        modal.addEventListener('confirmed', confirmHandler, { once: true });
        modal.addEventListener('cancelled', () => {
             modal.removeEventListener('confirmed', confirmHandler);
        }, { once: true });
        
        modal.setAttribute('visible', '');
    }

    const showChildSelectionModal = () => {
        childList.innerHTML = '';
        state.children.forEach(child => {
            const childButton = document.createElement('button');
            childButton.textContent = child.name;
            childButton.className = 'w-full text-left p-4 rounded-lg hover:bg-slate-100 font-bold';
            if(child.id === state.currentChildId) {
                childButton.classList.add('bg-amber-100', 'text-amber-700');
            }
            childButton.onclick = () => {
                state.currentChildId = child.id;
                childSelectionModal.classList.add('hidden');
                render();
            };
            childList.appendChild(childButton);
        });
        childSelectionModal.classList.remove('hidden');
    };

    const toggleMode = () => {
        state.isParentMode = modeToggle.checked;
        render();
    };

    const render = (isFirstLoad = false) => {
        const child = getCurrentChild();
        childNameDisplay.textContent = `de ${child.name}`;

        controlsSection.classList.toggle('hidden', !state.isParentMode);
        modeLabel.textContent = state.isParentMode ? 'Mode Parent' : 'Mode Enfant';
        childNameSelector.classList.toggle('clickable', state.isParentMode);
        
        renardCounter.setAttribute('total', getAvailableTokens());
        renderStore(isFirstLoad);
    };

    addFoxBtn.addEventListener('click', addFox);
    modeToggle.addEventListener('change', toggleMode);
    childNameSelector.addEventListener('click', () => {
        if (state.isParentMode) {
            showChildSelectionModal();
        }
    });
    childSelectionModal.addEventListener('click', (e) => {
        if(e.target === childSelectionModal) {
            childSelectionModal.classList.add('hidden');
        }
    });
    
    // Initialisation
    render(true);
});
