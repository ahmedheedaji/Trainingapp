/**
 * @file Manages the Training Log view.
 * This component handles rendering the main table of training records,
 * populating filter dropdowns, and applying search and filter logic.
 */

import { createElement } from '../utils/helpers.js';
import { CONFIG } from '../config/constants.js';
import { Modal } from '../ui/modal.js';

export class TrainingLog {
    /**
     * Initializes the TrainingLog component.
     * @param {DataService} dataService - An instance of the DataService.
     * @param {Function} onEditRecord - A callback function to trigger when a user clicks 'Edit'.
     */
    constructor(dataService, onEditRecord) {
        this.dataService = dataService;
        this.onEditRecord = onEditRecord; // Callback to tell the main app to switch to the form view
        this.init();
    }

    /**
     * Sets up the event listeners for the filter controls.
     */
    init() {
        // Attach event listeners to all filter inputs.
        ['log-search', 'filter-type', 'filter-month', 'filter-week'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                // 'input' event works for text fields, 'change' for selects
                const eventType = el.tagName === 'SELECT' ? 'change' : 'input';
                el.addEventListener(eventType, () => this.render());
            }
        });

        // Setup the clear filters button
        document.getElementById('clear-filters').addEventListener('click', () => {
            document.getElementById('log-search').value = '';
            document.getElementById('filter-type').value = '';
            document.getElementById('filter-month').value = '';
            document.getElementById('filter-week').value = '';
            this.render();
        });
    }

    /**
     * Renders the entire training log view, including populating
     * filters and drawing the table.
     */
    render() {
        this.populateFilters();
        this.renderLogTable();
    }

    /**
     * Populates the filter dropdowns with unique values from the training data.
     */
    populateFilters() {
        const records = this.dataService.getTrainingLog();
        const types = [...new Set(records.map(r => r['Training Type']))].sort();
        const months = [...new Set(records.map(r => r.Month))].sort((a, b) => CONFIG.MONTH_ORDER.indexOf(a) - CONFIG.MONTH_ORDER.indexOf(b));
        const weeks = [...new Set(records.map(r => r.Week))].sort();

        const populate = (id, options, label) => {
            const select = document.getElementById(id);
            if (!select) return;
            const currentValue = select.value;
            select.innerHTML = `<option value="">All ${label}s</option>`;
            options.forEach(o => select.add(new Option(o, o)));
            select.value = currentValue;
        };

        populate('filter-type', types, 'Type');
        populate('filter-month', months, 'Month');
        populate('filter-week', weeks, 'Week');
    }

    /**
     * Filters the training records and renders the log table body.
     */
    renderLogTable() {
        const tableBody = document.getElementById('log-table-body');
        tableBody.innerHTML = ''; // Clear previous content

        let records = this.dataService.getTrainingLog();

        // Get filter values from the DOM
        const searchTerm = document.getElementById('log-search').value.toLowerCase();
        const typeFilter = document.getElementById('filter-type').value;
        const monthFilter = document.getElementById('filter-month').value;
        const weekFilter = document.getElementById('filter-week').value;

        // Apply filters
        if (searchTerm) {
            records = records.filter(r => Object.values(r).some(val => String(val).toLowerCase().includes(searchTerm)));
        }
        if (typeFilter) records = records.filter(r => r['Training Type'] === typeFilter);
        if (monthFilter) records = records.filter(r => r.Month === monthFilter);
        if (weekFilter) records = records.filter(r => r.Week === weekFilter);

        // Create and append a row for each record
        records.forEach(record => {
            const row = this.createRow(record);
            tableBody.appendChild(row);
        });
    }

    /**
     * Creates a table row (<tr>) for a single training record.
     * @param {object} record - The training record object.
     * @returns {HTMLTableRowElement} The created table row element.
     */
    createRow(record) {
        const editButton = createElement('button', {
            textContent: 'Edit',
            className: 'text-indigo-600 hover:text-indigo-900',
            onclick: () => this.onEditRecord(record.Id) // Use the callback
        });

        const deleteButton = createElement('button', {
            textContent: 'Delete',
            className: 'text-red-600 hover:text-red-900 ml-4',
            onclick: () => this.confirmDelete(record.Id)
        });

        return createElement('tr', { className: 'border-b hover:bg-gray-50 text-sm' },
            createElement('td', { className: 'p-3', textContent: record['Training Date'] || '' }),
            createElement('td', { className: 'p-3', textContent: record["Trainee's ID Number"] || '' }),
            createElement('td', { className: 'p-3 font-medium', textContent: record['Full Name'] || 'Unknown' }),
            createElement('td', { className: 'p-3', textContent: record.Project || '' }),
            createElement('td', { className: 'p-3', textContent: record['Training Type'] || '' }),
            createElement('td', { className: 'p-3', textContent: record['Process'] || '' }),
            createElement('td', { className: 'p-3', textContent: record['Refreshment Type'] || '' }),
            createElement('td', { className: 'p-3', textContent: record['Number of Training Hours'] || '' }),
            createElement('td', { className: 'p-3', textContent: record['Sector'] || '' }),
            createElement('td', { className: 'p-3', textContent: record.Trainer || '' }),
            createElement('td', { className: 'p-3' }, editButton, deleteButton)
        );
    }

    /**
     * Shows a confirmation modal before deleting a record.
     * @param {string} id - The ID of the record to delete.
     */
    confirmDelete(id) {
        Modal.show('Confirm Deletion', 'Are you sure you want to delete this record? This action cannot be undone.', () => {
            this.dataService.deleteRecord(id);
            this.render(); // Re-render the table after deletion
        });
    }
}
