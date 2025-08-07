/**
 * @file Manages the Trainer Performance view.
 * This component calculates and displays performance metrics for each trainer,
 * including a summary table and charts for hours and sessions.
 */

import { createElement } from '../utils/helpers.js';
import { ChartExporter } from '../utils/chartExporter.js';

export class Performance {
    /**
     * Initializes the Performance component.
     * @param {DataService} dataService - An instance of the DataService to fetch training data.
     */
    constructor(dataService) {
        this.dataService = dataService;
        this.charts = {}; // To hold instances of Chart.js charts
    }

    /**
     * Renders the entire performance view, including the table and charts.
     */
    render() {
        this.destroyCharts();
        const performanceData = this.calculatePerformance();
        this.renderTable(performanceData);
        this.renderCharts(performanceData);
        ChartExporter.setupExportListeners(this.charts);
    }

    /**
     * Calculates performance data by aggregating training hours and session counts for each trainer.
     * @returns {object} An object where keys are trainer names and values are their performance stats.
     */
    calculatePerformance() {
        const records = this.dataService.getTrainingLog();
        return records.reduce((acc, r) => {
            const trainer = r.Trainer || 'Unknown';
            if (!acc[trainer]) {
                acc[trainer] = { hours: 0, sessions: 0 };
            }
            acc[trainer].hours += parseFloat(r['Number of Training Hours']) || 0;
            acc[trainer].sessions += 1;
            return acc;
        }, {});
    }

    /**
     * Renders the performance summary table.
     * @param {object} performanceData - The calculated performance data.
     */
    renderTable(performanceData) {
        const tableBody = document.getElementById('performance-table-body');
        tableBody.innerHTML = ''; // Clear previous content

        Object.entries(performanceData).forEach(([trainer, data]) => {
            const avgHours = data.sessions > 0 ? (data.hours / data.sessions).toFixed(2) : '0.00';
            const row = createElement('tr', { className: 'border-b hover:bg-gray-50 text-sm' },
                createElement('td', { className: 'p-3 font-medium', textContent: trainer }),
                createElement('td', { className: 'p-3', textContent: data.hours.toFixed(2) }),
                createElement('td', { className: 'p-3', textContent: data.sessions }),
                createElement('td', { className: 'p-3', textContent: avgHours })
            );
            tableBody.appendChild(row);
        });
    }

    /**
     * Renders the performance charts.
     * @param {object} performanceData - The calculated performance data.
     */
    renderCharts(performanceData) {
        const labels = Object.keys(performanceData);
        const hoursData = Object.values(performanceData).map(d => d.hours);
        const sessionsData = Object.values(performanceData).map(d => d.sessions);

        this.charts.hoursByTrainerChart = new Chart(document.getElementById('hoursByTrainerChart'), {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: hoursData,
                    backgroundColor: ['#10b981', '#f59e0b', '#6b7280', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Total Hours by Trainer' }
                }
            }
        });

        this.charts.sessionsByTrainerChart = new Chart(document.getElementById('sessionsByTrainerChart'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sessions',
                    data: sessionsData,
                    backgroundColor: '#06b6d4'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Number of Sessions by Trainer' }
                }
            }
        });
    }

    /**
     * Destroys all Chart.js instances associated with this component to free up memory.
     */
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}
