/**
 * @file Manages the application's confirmation modal dialog.
 * This class provides a static interface to show and hide the modal,
 * decoupling the modal's logic from the components that use it.
 */
export class Modal {
    /**
     * Displays the confirmation modal with a custom title and message.
     * It dynamically attaches event listeners for the confirm and cancel actions.
     *
     * @param {string} title - The title to display in the modal header.
     * @param {string} message - The message or question to display in the modal body.
     * @param {Function} onConfirm - The callback function to execute when the user clicks the "Confirm" button.
     */
    static show(title, message, onConfirm) {
        const modal = document.getElementById('confirmation-modal');
        if (!modal) {
            console.error('Confirmation modal element not found in the DOM.');
            return;
        }

        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;

        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');

        // To prevent multiple event listeners from being attached if the modal is shown
        // multiple times, we clone the buttons to remove any old listeners before adding new ones.
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        // Define the handlers for the new buttons
        const confirmHandler = () => {
            if (onConfirm) {
                onConfirm();
            }
            this.hide();
        };

        const cancelHandler = () => {
            this.hide();
        };

        // Attach the new event listeners
        newConfirmBtn.addEventListener('click', confirmHandler, { once: true });
        newCancelBtn.addEventListener('click', cancelHandler, { once: true });

        modal.classList.remove('hidden');
    }

    /**
     * Hides the confirmation modal from view.
     */
    static hide() {
        const modal = document.getElementById('confirmation-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
}
