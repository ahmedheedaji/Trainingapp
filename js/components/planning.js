/**
 * @file Manages the Training Planning view.
 * This component handles the planning form, a multi-select trainee search,
 * and the list of planned sessions. It uses the Calendar component for date picking.
 */

import { createElement } from '../utils/helpers.js';
import { CONFIG } from '../config/constants.js';
import { Modal } from '../ui/modal.js';
import { Calendar } from '../ui/calendar.js'; // Import the new Calendar class

export class Planning {
    /**
     * Initializes the Planning component.
     * @param {DataService} dataService - An instance of the DataService.
     */
    constructor(dataService) {
        this.dataService = dataService;
        this.selectedTrainees = new Set();
        this.calendarDateFilter = null;
        this.isEditing = false;

        // Initialize the Calendar component
        this.calendar = new Calendar({
            onDateClick: (dateStr) => this.setCalendarFilter(dateStr),
            getEventsForMonth: (month, year) => this.dataService.getPlannedSessions().filter(p => {
                const eventDate = new Date(p.plannedDate.replace(/-/g, '\/'));
                return eventDate.getMonth() === month && eventDate.getFullYear() === year;
            })
        });

        this.init();
    }

    /**
     * Attaches all necessary event listeners for the planning view.
     */
    init() {
        // Form submission
        document.getElementById('planning-form').addEventListener('submit', (e) => this.handlePlanFormSubmit(e));

        // Form input changes
        document.getElementById('planTrainingType').addEventListener('change', (e) => this.handlePlanTypeChange(e));
        document.getElementById('trainee-search').addEventListener('input', () => this.renderTraineeDropdown());
        document.getElementById('trainee-search').addEventListener('focus', () => this.renderTraineeDropdown());
        document.getElementById('cancel-plan-edit').addEventListener('click', () => this.resetPlanForm());
        
        // Hide trainee dropdown if clicking outside
        document.body.addEventListener('click', (e) => {
            const container = document.querySelector('.multi-select-container');
            if (container && !container.contains(e.target)) {
                document.getElementById('trainee-dropdown').classList.add('hidden');
            }
        });
    }

    /**
     * Renders the entire planning view.
     * @param {string|null} planId - The ID of a plan to edit. If null, the form is for adding a new plan.
     */
    render(planId = null) {
        this.populateTrainerDropdown();
        this.calendar.render(this.calendarDateFilter); // Use the calendar instance to render
        this.renderPlannedSessions();

        if (planId) {
            const plan = this.dataService.getPlanById(planId);
            if (plan) {
                this.isEditing = true;
                this.populateForm(plan);
            }
        } else {
            this.resetPlanForm();
        }
    }

    /**
     * Populates the trainer dropdown with authorized trainers.
     */
    populateTrainerDropdown() {
        const select = document.getElementById('planTrainer');
        if (!select) return;

        select.innerHTML = '';
        CONFIG.AUTHORIZED_TRAINERS.forEach(trainer => {
            select.add(new Option(trainer, trainer));
        });
        select.value = this.dataService.currentUser;
    }

    /**
     * Populates the form fields with data from an existing plan for editing.
     * @param {object} plan - The plan object to populate the form with.
     */
    populateForm(plan) {
        this.isEditing = true;
        document.getElementById('plan-id').value = plan.Id;
        document.getElementById('planDate').value = plan.plannedDate;
        document.getElementById('planTrainer').value = plan.trainer;
        document.getElementById('planTrainingType').value = plan.trainingType;
        document.getElementById('planProcess').value = plan.process;
        document.getElementById('planRefreshmentType').value = plan.refreshmentType || '';
        document.getElementById('planHours').value = plan.estimatedHours;
        document.getElementById('planSector').value = plan.sector;
        document.getElementById('planStatus').value = plan.status;

        this.selectedTrainees = new Set(plan.trainees.map(String));
        this.renderSelectedTrainees();

        document.getElementById('planTrainingType').dispatchEvent(new Event('change'));
        document.getElementById('cancel-plan-edit').classList.remove('hidden');
        window.scrollTo(0, 0);
    }

    /**
     * Resets the planning form to its default state.
     */
    resetPlanForm() {
        this.isEditing = false;
        document.getElementById('planning-form').reset();
        document.getElementById('plan-id').value = '';
        this.selectedTrainees.clear();
        this.renderSelectedTrainees();
        document.getElementById('plan-refreshment-group').classList.add('hidden');
        document.getElementById('cancel-plan-edit').classList.add('hidden');
        this.populateTrainerDropdown();
    }

    /**
     * Handles the submission of the planning form.
     * @param {Event} e - The form submission event.
     */
    handlePlanFormSubmit(e) {
        e.preventDefault();
        if (this.selectedTrainees.size === 0) {
            Modal.show('Validation Error', 'Please select at least one trainee.', () => {});
            return;
        }

        const planId = document.getElementById('plan-id').value;
        const plan = {
            Id: planId,
            plannedDate: document.getElementById('planDate').value,
            trainer: document.getElementById('planTrainer').value,
            trainees: Array.from(this.selectedTrainees),
            trainingType: document.getElementById('planTrainingType').value,
            process: document.getElementById('planProcess').value,
            refreshmentType: document.getElementById('planRefreshmentType').value,
            estimatedHours: document.getElementById('planHours').value,
            sector: document.getElementById('planSector').value,
            status: document.getElementById('planStatus').value,
        };

        if (this.isEditing) {
            this.dataService.updatePlan(plan);
        } else {
            this.dataService.addPlan(plan);
        }

        this.resetPlanForm();
        this.render();
    }

    /**
     * Toggles the visibility of the refreshment type dropdown.
     * @param {Event} e - The change event.
     */
    handlePlanTypeChange(e) {
        const type = e.target.value;
        document.getElementById('plan-refreshment-group').classList.toggle('hidden', type !== 'Refreshment');
    }

    /**
     * Renders the dropdown of searchable trainees.
     */
    renderTraineeDropdown() {
        const searchTerm = document.getElementById('trainee-search').value.toLowerCase();
        const dropdown = document.getElementById('trainee-dropdown');
        dropdown.innerHTML = '';

        if (searchTerm.length < 2) {
            dropdown.classList.add('hidden');
            return;
        }

        const filtered = this.dataService.orgaData.filter(emp => {
            const name = emp['Full Name'] ? emp['Full Name'].toLowerCase() : '';
            const id = emp.Matricule ? String(emp.Matricule) : '';
            return (name.includes(searchTerm) || id.includes(searchTerm)) && !this.selectedTrainees.has(id);
        }).slice(0, 10);

        if (filtered.length > 0) {
            filtered.forEach(emp => {
                const item = createElement('div', {
                    className: 'p-2 hover:bg-indigo-100 cursor-pointer',
                    textContent: `${emp['Full Name']} (${emp.Matricule})`,
                    onclick: () => this.selectTrainee(emp.Matricule)
                });
                dropdown.appendChild(item);
            });
        } else {
            dropdown.innerHTML = `<div class="p-2 text-sm text-gray-500">No matches found</div>`;
        }
        dropdown.classList.remove('hidden');
    }

    /**
     * Adds a trainee to the selected list.
     * @param {string} employeeId
     */
    selectTrainee(employeeId) {
        this.selectedTrainees.add(String(employeeId));
        document.getElementById('trainee-search').value = '';
        document.getElementById('trainee-dropdown').classList.add('hidden');
        this.renderSelectedTrainees();
    }

    /**
     * Removes a trainee from the selected list.
     * @param {string} employeeId
     */
    removeTrainee(employeeId) {
        this.selectedTrainees.delete(String(employeeId));
        this.renderSelectedTrainees();
    }

    /**
     * Renders the badges for currently selected trainees.
     */
    renderSelectedTrainees() {
        const container = document.getElementById('selected-trainees');
        container.innerHTML = '';
        this.selectedTrainees.forEach(id => {
            const employee = this.dataService.getEmployeeById(id);
            if (employee) {
                const removeBtn = createElement('button', { innerHTML: '&times;' });
                const badge = createElement('span', { className: 'selected-badge' }, `${employee['Full Name']}`, removeBtn);
                removeBtn.onclick = () => this.removeTrainee(id);
                container.appendChild(badge);
            }
        });
    }

    /**
     * Sets a filter to show only sessions for a specific date.
     * @param {string} dateStr - The date to filter by.
     */
    setCalendarFilter(dateStr) {
        this.calendarDateFilter = this.calendarDateFilter === dateStr ? null : dateStr;
        this.render();
    }

    /**
     * Renders the table of planned sessions.
     */
    renderPlannedSessions() {
        const tableBody = document.getElementById('planned-sessions-table-body');
        tableBody.innerHTML = '';
        const clearFilterBtn = document.getElementById('clear-calendar-filter');

        let sessions = this.dataService.getPlannedSessions();

        if (this.calendarDateFilter) {
            sessions = sessions.filter(s => s.plannedDate === this.calendarDateFilter);
            clearFilterBtn.classList.remove('hidden');
            clearFilterBtn.onclick = () => {
                this.calendarDateFilter = null;
                this.render();
            };
        } else {
            clearFilterBtn.classList.add('hidden');
        }

        if (sessions.length === 0) {
            const row = createElement('tr', {}, createElement('td', { colSpan: 7, className: 'p-4 text-center text-gray-500' }, 'No planned sessions found.'));
            tableBody.appendChild(row);
            return;
        }

        sessions.forEach(plan => {
            const traineeNames = plan.trainees.map(id => {
                const emp = this.dataService.getEmployeeById(id);
                return emp ? emp['Full Name'] : `ID: ${id}`;
            }).join(', ');

            const editButton = createElement('button', { textContent: 'Edit', className: 'text-indigo-600 hover:text-indigo-900', onclick: () => this.render(plan.Id) });
            const deleteButton = createElement('button', { textContent: 'Delete', className: 'text-red-600 hover:text-red-900 ml-4', onclick: () => this.confirmDeletePlan(plan.Id) });

            const statusClass = {
                'Completed': 'bg-green-100 text-green-800',
                'Canceled': 'bg-red-100 text-red-800',
                'In Progress': 'bg-yellow-100 text-yellow-800',
                'Planned': 'bg-blue-100 text-blue-800'
            }[plan.status] || 'bg-gray-100 text-gray-800';

            const row = createElement('tr', { className: 'border-b hover:bg-gray-50 text-sm' },
                createElement('td', { className: 'p-3', textContent: plan.plannedDate }),
                createElement('td', { className: 'p-3', textContent: plan.trainer }),
                createElement('td', { className: 'p-3', textContent: plan.trainingType }),
                createElement('td', { className: 'p-3', textContent: plan.process }),
                createElement('td', { className: 'p-3', textContent: traineeNames }),
                createElement('td', { className: 'p-3' }, createElement('span', { className: `px-2 py-1 text-xs font-medium rounded-full ${statusClass}`, textContent: plan.status })),
                createElement('td', { className: 'p-3' }, editButton, deleteButton)
            );
            tableBody.appendChild(row);
        });
    }

    /**
     * Shows a confirmation modal before deleting a planned session.
     * @param {string} planId - The ID of the plan to delete.
     */
    confirmDeletePlan(planId) {
        Modal.show('Confirm Deletion', 'Are you sure you want to delete this planned session?', () => {
            this.dataService.deletePlan(planId);
            this.render();
        });
    }
}
