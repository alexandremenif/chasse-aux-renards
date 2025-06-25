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

    // --- DONNÉES STATIQUES ---
    const rewards = [
        { id: 1, name: "Choisir le film", cost: 15, icon: '🎬' },
        { id: 2, name: "30 min de jeu spécial", cost: 20, icon: '🎲' },
        { id: 3, name: "Préparer un gâteau", cost: 35, icon: '🍰' },
        { id: 4, name: "Soirée pyjama", cost: 50, icon: '⛺' },
        { id: 5, name: "Sortie au parc", cost: 75, icon: '🌳' },
        { id: 6, name: "Le 'Grand Cadeau'", cost: 150, icon: '🎁' },
    ];

    // --- ÉLÉMENTS DU DOM ---
    const rewardBoard = document.getElementById('reward-board');
    const addFoxBtn = document.getElementById('add-fox-btn');
    const controlsSection = document.getElementById('controls');
    const modeToggle = document.getElementById('mode-toggle');
    const modeLabel = document.getElementById('mode-label');
    const childNameSelector = document.getElementById('child-name-selector');
    const childNameDisplay = document.getElementById('child-name-display');
    const childSelectionModal = document.getElementById('child-selection-modal');
    const childList = document.getElementById('child-list');

    // --- FONCTIONS DE CONTRÔLE ---

    const showChildSelectionModal = () => {
        childList.innerHTML = '';
        state.children.forEach(child => {
            const childButton = document.createElement('button');
            childButton.textContent = child.name;
            childButton.className = 'w-full text-left p-4 rounded-lg hover:bg-slate-100 font-bold';
            if (child.id === state.currentChildId) {
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

    const render = () => {
        const child = state.children.find(c => c.id === state.currentChildId);
        
        // Mise à jour des éléments "globaux"
        childNameDisplay.textContent = `de ${child.name}`;
        controlsSection.classList.toggle('hidden', !state.isParentMode);
        modeLabel.textContent = state.isParentMode ? 'Mode Parent' : 'Mode Enfant';
        childNameSelector.classList.toggle('clickable', state.isParentMode);
        
        // On passe toutes les données nécessaires au composant principal
        rewardBoard.data = { child, rewards };
        rewardBoard.parentMode = state.isParentMode;
    };

    // --- ÉCOUTEURS D'ÉVÉNEMENTS ---
    addFoxBtn.addEventListener('click', () => {
        rewardBoard.addRenard();
    });
    
    modeToggle.addEventListener('change', toggleMode);
    
    childNameSelector.addEventListener('click', () => {
        if (state.isParentMode) {
            showChildSelectionModal();
        }
    });

    childSelectionModal.addEventListener('click', (e) => {
        if (e.target === childSelectionModal) {
            childSelectionModal.classList.add('hidden');
        }
    });

    // --- INITIALISATION ---
    render();
});
