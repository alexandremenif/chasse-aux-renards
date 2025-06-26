// main.js
import './services/reward-board.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Global State ---
    let state = {
        currentChildId: 1,
        isParentMode: false,
        // The list of children, now containing their associated boardId
        children: [
            { id: 1, name: 'Daniel', boardId: 'board-1' },
            { id: 2, name: 'Evelyne', boardId: 'board-2' }
        ]
    };

    // --- DOM Elements ---
    const rewardBoard = document.getElementById('reward-board');
    const addRenardBtn = document.getElementById('add-renard-btn');
    const controlsSection = document.getElementById('controls');
    const modeToggle = document.getElementById('mode-toggle');
    const modeLabel = document.getElementById('mode-label');
    const childNameSelector = document.getElementById('child-name-selector');
    const childNameDisplay = document.getElementById('child-name-display');
    const childSelectionModal = document.getElementById('child-selection-modal');
    const childList = document.getElementById('child-list');

    // --- Render Function ---
    function render() {
        const currentChild = state.children.find(c => c.id === state.currentChildId);

        // Update global UI elements
        childNameDisplay.textContent = `de ${currentChild.name}`;
        controlsSection.classList.toggle('hidden', !state.isParentMode);
        modeLabel.textContent = state.isParentMode ? 'Mode Parent' : 'Mode Enfant';
        childNameSelector.classList.toggle('clickable', state.isParentMode);
        
        // Pass the board ID directly from the child object to the components
        rewardBoard.setAttribute('board-id', currentChild.boardId);
        rewardBoard.setAttribute('parent-mode', state.isParentMode);
        addRenardBtn.setAttribute('board-id', currentChild.boardId);
    }

    // --- Event Handlers ---
    function handleModeToggle() {
        state.isParentMode = modeToggle.checked;
        render();
    }

    function handleChildSelect(childId) {
        state.currentChildId = childId;
        childSelectionModal.classList.add('hidden');
        render();
    }

    function openChildSelectionModal() {
        if (!state.isParentMode) return;

        childList.innerHTML = '';
        state.children.forEach(child => {
            const childButton = document.createElement('button');
            childButton.textContent = child.name;
            childButton.className = 'w-full text-left p-4 rounded-lg hover:bg-slate-100 font-bold';
            if (child.id === state.currentChildId) {
                childButton.classList.add('bg-amber-100', 'text-amber-700');
            }
            childButton.onclick = () => handleChildSelect(child.id);
            childList.appendChild(childButton);
        });
        childSelectionModal.classList.remove('hidden');
    }

    // --- Initial Setup ---
    modeToggle.addEventListener('change', handleModeToggle);
    childNameSelector.addEventListener('click', openChildSelectionModal);
    childSelectionModal.addEventListener('click', (e) => {
        if (e.target === childSelectionModal) {
            childSelectionModal.classList.add('hidden');
        }
    });

    render(); // Initial render
});
