/**
 * @file Manages the "Add/Edit Training Record" form view.
 * This component handles form input, validation, submission, and populating
 * the form for editing existing records.
 */
export class TrainingForm {
    /**
     * Initializes the TrainingForm component.
     * @param {DataService} dataService - An instance of the DataService.
     * @param {Function} onFormSubmit - A callback function to execute after the form is successfully submitted.
     */
    constructor(dataService, onFormSubmit) {
        this.dataService = dataService;
        this.onFormSubmit = onFormSubmit;
        this.isEditing = false;
        this.init();
    }

    /**
     * Attaches all necessary event listeners to the form elements.
     */
    init() {
        // Main form submission
        document.getElementById('training-form').addEventListener('submit', (e) => this.handleSubmit(e));

        // Dynamic behavior for the 'Training Type' dropdown
        document.getElementById('trainingType').addEventListener('change', (e) => this.handleTypeChange(e));

        // Live validation/feedback for the Trainee ID input
        document.getElementById('traineeId').addEventListener('input', (e) => this.handleTraineeIdInput(e));

        // Cancel button functionality
        document.getElementById('cancel-edit').addEventListener('click', () => this.resetForm());
    }

    /**
     * Renders the form in either 'add' or 'edit' mode.
     * @param {string|null} recordId - The ID of the record to edit. If null, the form is for adding a new record.
     */
    render(recordId = null) {
        if (recordId) {
            const record = this.dataService.getRecordById(recordId);
            if (record) {
                this.isEditing = true;
                this.populateForm(record);
            } else {
                console.error(`Record with ID "${recordId}" not found. Resetting form.`);
                this.resetForm();
            }
        } else {
            this.resetForm();
        }
    }

    /**
     * Populates the form fields with data from an existing record for editing.
     * @param {object} record - The record object to populate the form with.
     */
    populateForm(record) {
        document.getElementById('form-title').textContent = 'Edit Training Record';
        document.getElementById('record-id').value = record.Id;
        document.getElementById('trainingDate').value = record['Training Date'];
        document.getElementById('traineeId').value = record["Trainee's ID Number"];
        document.getElementById('trainingType').value = record['Training Type'];
        document.getElementById('process').value = record['Process'] || '';
        document.getElementById('refreshmentType').value = record['Refreshment Type'] || '';
        document.getElementById('trainingHours').value = record['Number of Training Hours'];
        document.getElementById('sector').value = record['Sector'];
        document.getElementById('cancel-edit').classList.remove('hidden');

        // Trigger change events to ensure UI consistency
        document.getElementById('trainingType').dispatchEvent(new Event('change'));
        document.getElementById('traineeId').dispatchEvent(new Event('input'));
    }

    /**
     * Resets the form to its default state for adding a new record.
     */
    resetForm() {
        this.isEditing = false;
        document.getElementById('form-title').textContent = 'Add New Training Record';
        document.getElementById('training-form').reset();
        document.getElementById('record-id').value = '';
        document.getElementById('refreshment-group').classList.add('hidden');
        document.getElementById('cancel-edit').classList.add('hidden');
        document.getElementById('traineeNameDisplay').textContent = '';
        document.getElementById('traineeNameDisplay').className = 'text-sm text-gray-500 mt-1 h-5';
    }

    /**
     * Handles the form submission event.
     * @param {Event} e - The form submission event.
     */
    handleSubmit(e) {
        e.preventDefault();
        const recordId = document.getElementById('record-id').value;
        const record = {
            Id: recordId,
            'Training Date': document.getElementById('trainingDate').value,
            "Trainee's ID Number": document.getElementById('traineeId').value,
            'Training Type': document.getElementById('trainingType').value,
            'Process': document.getElementById('process').value,
            'Refreshment Type': document.getElementById('refreshmentType').value,
            'Number of Training Hours': document.getElementById('trainingHours').value,
            'Sector': document.getElementById('sector').value,
        };

        if (this.isEditing) {
            this.dataService.updateRecord(record);
        } else {
            this.dataService.addRecord(record);
        }

        // Use the callback to notify the main app to switch views
        if (this.onFormSubmit) {
            this.onFormSubmit();
        }
    }

    /**
     * Handles changes to the 'Training Type' select element, showing or hiding the 'Refreshment Type' field.
     * @param {Event} e - The change event.
     */
    handleTypeChange(e) {
        const type = e.target.value;
        const refreshmentGroup = document.getElementById('refreshment-group');
        const refreshmentTypeInput = document.getElementById('refreshmentType');

        const isRefreshment = type === 'Refreshment';
        refreshmentGroup.classList.toggle('hidden', !isRefreshment);
        refreshmentTypeInput.required = isRefreshment;
        if (!isRefreshment) {
            refreshmentTypeInput.value = ''; // Clear value if not a refreshment
        }
    }

    /**
     * Provides real-time feedback by displaying the trainee's name as their ID is entered.
     * @param {Event} e - The input event.
     */
    handleTraineeIdInput(e) {
        const id = e.target.value;
        const employee = this.dataService.getEmployeeById(id);
        const nameDisplay = document.getElementById('traineeNameDisplay');

        if (employee) {
            nameDisplay.textContent = employee['Full Name'];
            nameDisplay.className = 'text-sm text-green-600 mt-1 h-5';
        } else {
            nameDisplay.textContent = 'Trainee not found';
            nameDisplay.className = 'text-sm text-red-500 mt-1 h-5';
        }
    }
}
