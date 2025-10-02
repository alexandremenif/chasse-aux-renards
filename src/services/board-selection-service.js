class BoardSelectionService {
    constructor() {
        this.modal = null;
    }

    registerModal(modal) {
        this.modal = modal;
    }

    openModal(boardId) {
        if (this.modal) {
            this.modal.open(boardId);
        }
    }
}

export const boardSelectionService = new BoardSelectionService();