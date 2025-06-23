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
    const goldContainer = document.getElementById('gold-fox-container');
    const silverContainer = document.getElementById('silver-fox-container');
    const normalContainer = document.getElementById('normal-fox-container');
    const rewardsGrid = document.getElementById('rewards-grid');
    const addFoxBtn = document.getElementById('add-fox-btn');
    const controlsSection = document.getElementById('controls');
    const modeToggle = document.getElementById('mode-toggle');
    const modeLabel = document.getElementById('mode-label');
    const childNameSelector = document.getElementById('child-name-selector');
    const childNameDisplay = document.getElementById('child-name-display');
    const modal = document.getElementById('confirmation-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    const childSelectionModal = document.getElementById('child-selection-modal');
    const childList = document.getElementById('child-list');


    // --- FONCTIONS DE LOGIQUE ---

    const getCurrentChild = () => state.children.find(c => c.id === state.currentChildId);

    const calculateFoxes = (total) => {
        const gold = Math.floor(total / 100);
        const silver = Math.floor((total % 100) / 10);
        const normal = total % 10;
        return { gold, silver, normal };
    };
    
    const createTokenSVG = (type, sizeClass = 'w-8 h-8') => {
        return `<svg class="${sizeClass} inline-block"><use href="#${type}-fox-token"></use></svg>`;
    };
    
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

    const renderDashboard = () => {
        const available = getAvailableTokens();
        const { gold, silver, normal } = calculateFoxes(available);
        
        goldContainer.innerHTML = `<h3 class="text-xl font-bold mb-2 text-yellow-600">Dorés</h3><div class="flex items-center justify-center gap-2"><div class="text-4xl font-black counter-value">${gold}</div>${createTokenSVG('gold', 'w-10 h-10')}</div>`;
        silverContainer.innerHTML = `<h3 class="text-xl font-bold mb-2 text-slate-600">Argentés</h3><div class="flex items-center justify-center gap-2"><div class="text-4xl font-black counter-value">${silver}</div>${createTokenSVG('silver', 'w-10 h-10')}</div>`;
        normalContainer.innerHTML = `<h3 class="text-xl font-bold mb-2 text-orange-600">Normaux</h3><div class="flex items-center justify-center gap-2"><div class="text-4xl font-black counter-value">${normal}</div>${createTokenSVG('orange', 'w-10 h-10')}</div>`;
    };

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
                    ${reward.cost} ${createTokenSVG('orange', 'w-6 h-6 ml-1')}
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
        const oldAvailable = getAvailableTokens();
        
        child.totalTokens++;
        render(); // Mise à jour immédiate de l'interface

        const newAvailable = getAvailableTokens();

        const normalCounterValue = normalContainer.querySelector('.counter-value');
        if(normalCounterValue){
            normalCounterValue.classList.add('counter-pulse');
            setTimeout(() => normalCounterValue.classList.remove('counter-pulse'), 400);
        }
        
        // Vérifier si une transformation est nécessaire
        if (Math.floor(newAvailable / 10) < Math.floor(oldAvailable / 10) || (oldAvailable % 10 === 9 && newAvailable % 10 === 0) ) {
            if(Math.floor(newAvailable / 100) < Math.floor(oldAvailable / 100)) {
                animateTransform(silverContainer, goldContainer);
            } else {
                animateTransform(normalContainer, silverContainer);
            }
        }
    };
    
    function animateTransform(fromContainer, toContainer) {
        const fromRect = fromContainer.getBoundingClientRect();
        const toRect = toContainer.getBoundingClientRect();
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            const type = fromContainer.id.includes('normal') ? 'orange' : 'silver';
            particle.innerHTML = createTokenSVG(type, 'w-10 h-10');
            particle.className = 'fox-transform';
            particle.style.position = 'fixed';
            particle.style.left = `${fromRect.left + fromRect.width / 2 + (Math.random() - 0.5) * 40}px`;
            particle.style.top = `${fromRect.top + fromRect.height / 2 + (Math.random() - 0.5) * 40}px`;
            document.body.appendChild(particle);
            setTimeout(() => {
                particle.style.transition = 'all 1.2s ease-in-out';
                particle.style.left = `${toRect.left + toRect.width / 2}px`;
                particle.style.top = `${toRect.top + toRect.height / 2}px`;
                particle.style.transform = 'scale(0)';
                particle.style.opacity = '0';
            }, 50);
            setTimeout(() => particle.remove(), 1600);
        }
    }

    const showConfirmationModal = (reward) => {
        const child = getCurrentChild();
        modalTitle.textContent = `Valider ${reward.name} ?`;
        modalText.innerHTML = `Cette action dépensera <strong>${reward.cost} renards</strong> pour <strong>${child.name}</strong> et est définitive.`;
        
        const newConfirmBtn = modalConfirmBtn.cloneNode(true);
        modalConfirmBtn.parentNode.replaceChild(newConfirmBtn, modalConfirmBtn);
        
        newConfirmBtn.addEventListener('click', () => {
            if (child.totalTokens >= reward.cost) {
                child.totalTokens -= reward.cost;
            }
            child.pendingRewardIds = child.pendingRewardIds.filter(id => id !== reward.id);
            modal.classList.add('hidden');
            render();
        });
        
        modal.classList.remove('hidden');
    }

    const showChildSelectionModal = () => {
        childList.innerHTML = ''; // Vide la liste
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

        if (state.isParentMode) {
            controlsSection.classList.remove('hidden');
            modeLabel.textContent = 'Mode Parent';
            childNameSelector.classList.add('clickable');
        } else {
            controlsSection.classList.add('hidden');
            modeLabel.textContent = 'Mode Enfant';
            childNameSelector.classList.remove('clickable');
        }
        renderDashboard();
        renderStore(isFirstLoad);
    };

    addFoxBtn.addEventListener('click', addFox);
    modeToggle.addEventListener('change', toggleMode);
    modalCancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
    childNameSelector.addEventListener('click', (e) => {
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