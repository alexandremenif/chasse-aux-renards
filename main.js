// main.js
import './services/reward-board.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Global State ---
    let state = {
        currentChildId: 1,
        isParentMode: false,
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
    const childSelector = document.getElementById('child-selector');

    // --- Render Function ---
    function render() {
        const currentChild = state.children.find(c => c.id === state.currentChildId);

        // Update global UI elements that are not components
        controlsSection.classList.toggle('hidden', !state.isParentMode);
        modeLabel.textContent = state.isParentMode ? 'Mode Parent' : 'Mode Enfant';
        
        // Pass data and state to our components
        rewardBoard.setAttribute('board-id', currentChild.boardId);
        rewardBoard.setAttribute('parent-mode', state.isParentMode);
        addRenardBtn.setAttribute('board-id', currentChild.boardId);
        
        childSelector.componentData = {
            children: state.children,
            currentChildId: state.currentChildId
        };
        childSelector.parentMode = state.isParentMode;
    }

    // --- Event Handlers ---
    function handleModeToggle() {
        state.isParentMode = modeToggle.checked;
        render();
    }

    function handleChildSelect(e) {
        state.currentChildId = e.detail.childId;
        render();
    }

    // --- Initial Setup ---
    modeToggle.addEventListener('change', handleModeToggle);
    childSelector.addEventListener('child-selected', handleChildSelect);

    render(); // Initial render
});
