class ConfirmationService {
    constructor() {
        this.confirmationModal = null;
        this.resolve = null;
    }

    registerModal(modal) {
        this.confirmationModal = modal;
        this.confirmationModal.addEventListener('confirmed', () => {
            if (this.resolve) {
                this.resolve(true);
                this.resolve = null;
            }
        });
        this.confirmationModal.addEventListener('cancelled', () => {
            if (this.resolve) {
                this.resolve(false);
                this.resolve = null;
            }
        });
    }

    async getConfirmation({ title, message }) {
        if (title) {
            this.confirmationModal.setAttribute('title', title);
        }
        this.confirmationModal.setAttribute('message', message);
        this.confirmationModal.setAttribute('visible', 'true');

        return new Promise(resolve => {
            this.resolve = resolve;
        });
    }
}

export const confirmationService = new ConfirmationService();