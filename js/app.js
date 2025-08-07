/**
 * @file Main application entry point.
 * This file initializes the entire application, manages state, and orchestrates
 * the different services and components.
 */

// --- IMPORT MODULES --- //
// Services
import { DataService } from './services/dataService.js';

// UI Components
import { Navigation } from './ui/navigation.js';
import { Modal } from './ui/modal.js';

// View Components
import { Dashboard } from './components/dashboard.js';
import { TrainingLog } from './components/trainingLog.js';
import { TrainingForm } from './components/trainingForm.js';
import { Planning } from './components/planning.js';
import { Performance } from './components/performance.js';
import { YearlyReport } from './components/yearlyReport.js';
import { Analysis } from './components/analysis.js';

// Utils
import { CONFIG } from './config/constants.js';
import { CSVHandler } from './utils/csvHandler.js';


/**
 * The main application class that encapsulates all functionality.
 */
class App {
    constructor() {
        this.dataService = new DataService();
        this.navigation = null;
        this.components = {};
    }

    /**
     * Initializes the application by setting up the login form listener.
     */
    init() {
        // Listen for a click on the button, not a submit on the form
        document.getElementById('login-btn').addEventListener('click', (e) => this.handleLogin(e));
    }

    /**
     * Handles the login form submission.
     * @param {Event} e - The form submission event.
     */
    handleLogin(e) {
        e.preventDefault(); 
        const userName = document.getElementById('trainerName').value;
        const orgaFile = document.getElementById('orgaFile').files[0];
        const loginError = document.getElementById('login-error');

        // FIX: Use the prominent modal for validation feedback
        if (!CONFIG.AUTHORIZED_TRAINERS.includes(userName)) {
            Modal.show('Login Error', 'The entered trainer name is not authorized. Please check the name and try again.');
            return;
        }
        if (!orgaFile) {
            Modal.show('Login Error', 'Please select the employee data file (orga.csv) to continue.');
            return;
        }

        loginError.textContent = 'Loading...';

        // Use PapaParse to read the CSV file
        Papa.parse(orgaFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                loginError.textContent = ''; // Clear loading message
                this.start(userName, results.data);
            },
            error: (err) => {
                loginError.textContent = ''; // Clear loading message
                Modal.show('File Error', 'There was an error parsing the CSV file. Please ensure it is a valid CSV.');
                console.error('CSV Parsing Error:', err);
            }
        });
    }

    /**
     * Starts the main application after a successful login.
     * @param {string} userName - The name of the logged-in user.
     * @param {Array} orgaData - The parsed employee data.
     */
    start(userName, orgaData) {
        // Initialize the data service with user and organizational data
        this.dataService.init(userName, orgaData);

        // --- INITIALIZE COMPONENTS --- //
        this.components.dashboard = new Dashboard(this.dataService);
        this.components.trainingLog = new TrainingLog(this.dataService, (recordId) => this.editRecord(recordId));
        this.components.trainingForm = new TrainingForm(this.dataService, () => this.navigation.setView('log'));
        this.components.planning = new Planning(this.dataService);
        this.components.performance = new Performance(this.dataService);
        this.components.yearlyReport = new YearlyReport(this.dataService);
        this.components.analysis = new Analysis(this.dataService);

        // Initialize navigation, with a callback to render the view on change
        this.navigation = new Navigation('dashboard', (view) => this.renderView(view));

        // Setup global event listeners like CSV import/export
        this.setupGlobalEventListeners();

        // --- RENDER INITIAL UI --- //
        document.getElementById('user-display').textContent = this.dataService.currentUser;
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');

        // Render the initial view
        this.renderView(this.navigation.currentView);
    }

    /**
     * Sets up event listeners for elements that are part of the main app shell.
     */
    setupGlobalEventListeners() {
        document.getElementById('export-csv').addEventListener('click', () => {
            const data = this.dataService.getTrainingLog();
            CSVHandler.exportCSV(data, 'training_data_export');
        });

        document.getElementById('import-csv').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                CSVHandler.importCSV(file, (data) => {
                    const msg = `This will replace all ${this.dataService.trainingData.length} existing records with ${data.length} new records. Are you sure?`;
                    Modal.show('Confirm Import', msg, () => {
                        this.dataService.importData(data);
                        this.renderView(this.navigation.currentView); // Re-render current view with new data
                    });
                });
                e.target.value = ''; // Reset file input
            }
        });
    }

    /**
     * Renders the component corresponding to the current view.
     * @param {string} view - The ID of the view to render.
     * @param {any} [param=null] - An optional parameter to pass to the component's render method (e.g., a record ID).
     */
    renderView(view, param = null) {
        const component = this.components[view];
        if (component && typeof component.render === 'function') {
            // By wrapping the render call in a setTimeout with a 0ms delay, we push it
            // to the end of the browser's event queue. This gives the browser a moment
            // to finish painting the layout and calculating the dimensions of the view's
            // container *before* we try to draw a chart inside it. This resolves the race condition.
            setTimeout(() => {
                component.render(param);
            }, 0);
        } else if (view === 'add') {
            // The 'add' form has no charts, so it can be rendered immediately.
            this.components.trainingForm.render(param);
        } else {
            console.warn(`No component found for view: ${view}`);
        }
    }

    /**
     * A helper function to handle the "edit record" action.
     * It switches to the form view and tells the form component to render in edit mode.
     * @param {string} recordId - The ID of the record to be edited.
     */
    editRecord(recordId) {
        this.navigation.setView('add');
        this.renderView('add', recordId);
    }
}

// --- START THE APP --- //
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
