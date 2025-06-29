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
    const modeToggle = document.getElementById('mode-toggle'); // This is now our <toggle-switch>
    const childSelector = document.getElementById('child-selector');

    // --- Render Function ---
    function render() {
        const currentChild = state.children.find(c => c.id === state.currentChildId);

        // Update global UI elements that are not components
        controlsSection.classList.toggle('hidden', !state.isParentMode);
        
        // Update our new component's attributes/properties
        modeToggle.setAttribute('label', state.isParentMode ? 'Mode Parent' : 'Mode Enfant');
        if (state.isParentMode) {
            modeToggle.setAttribute('checked', '');
        } else {
            modeToggle.removeAttribute('checked');
        }

        // Pass data and state to other components
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
    function handleModeToggle(e) {
        // The checked status is now in the event's detail
        state.isParentMode = e.detail.checked;
        render();
    }

    function handleChildSelect(e) {
        state.currentChildId = e.detail.childId;
        render();
    }

    // --- Initial Setup ---
    // Listen to the custom 'change' event from our toggle-switch component
    modeToggle.addEventListener('change', handleModeToggle);
    childSelector.addEventListener('child-selected', handleChildSelect);

    render(); // Initial render
});
