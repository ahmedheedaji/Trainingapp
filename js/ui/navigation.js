/**
 * @file Manages the main navigation and view switching for the application.
 * It handles clicks on the sidebar links to show the correct view and
 * updates the UI to reflect the currently active view.
 */
export class Navigation {
    /**
     * Initializes the Navigation service.
     * @param {string} initialView - The ID of the view to display on load.
     * @param {Function} onNavigate - A callback function that fires after a view is changed.
     * This allows other parts of the app to react to navigation events.
     */
    constructor(initialView = 'add', onNavigate) {
        this.views = ['dashboard', 'log', 'add', 'performance', 'yearly-report', 'analysis', 'planning'];
        this.currentView = initialView;
        this.onNavigate = onNavigate;
        this.init();
    }

    /**
     * Sets up the initial state of the navigation, attaching event listeners
     * to all the navigation links in the sidebar.
     */
    init() {
        this.views.forEach(viewId => {
            const navElement = document.getElementById(`nav-${viewId}`);
            if (navElement) {
                navElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.setView(viewId);
                });
            }
        });
        // Set the initial view
        this.showView(this.currentView);
        this.updateNav();
    }

    /**
     * Sets the current view and triggers the rendering process.
     * @param {string} viewId - The ID of the view to switch to.
     */
    setView(viewId) {
        if (this.views.includes(viewId)) {
            this.currentView = viewId;
            this.showView(viewId);
            this.updateNav();
            // Fire the navigation callback if it exists
            if (this.onNavigate) {
                this.onNavigate(this.currentView);
            }
        } else {
            console.error(`View "${viewId}" is not a valid view.`);
        }
    }

    /**
     * Shows the selected view and hides all others.
     * @param {string} viewId - The ID of the view element to display.
     */
    showView(viewId) {
        this.views.forEach(id => {
            const viewEl = document.getElementById(`view-${id}`);
            if (viewEl) {
                viewEl.classList.toggle('hidden', id !== viewId);
            }
        });
    }

    /**
     * Updates the visual state of the sidebar links, highlighting the active one.
     */
    updateNav() {
        this.views.forEach(id => {
            const navEl = document.getElementById(`nav-${id}`);
            if (navEl) {
                navEl.classList.toggle('active', id === this.currentView);
            }
        });
    }
}
