/**
 * @file Manages the rendering and logic for the main dashboard view.
 * This component displays key performance indicators (KPIs) and summary charts.
 */

import { CONFIG } from '../config/constants.js';
import { ChartExporter } from '../utils/chartExporter.js';

export class Dashboard {
    /**
     * Initializes the Dashboard component.
     * @param {DataService} dataService - An instance of the DataService to fetch training data.
     */
    constructor(dataService) {
        this.dataService = dataService;
        this.charts = {}; // To hold instances of Chart.js charts
    }

    /**
     * Renders the entire dashboard, including KPIs and charts.
     * It first destroys any existing charts to prevent memory leaks before drawing new ones.
     */
    render() {
        this.destroyCharts();
        this.renderKPIs();
        this.renderCharts();
        ChartExporter.setupExportListeners(this.charts);
    }

    /**
     * Calculates and displays the key performance indicators (KPIs) at the top of the dashboard.
     */
    renderKPIs() {
        const records = this.dataService.getTrainingLog();
        const totalHours = records.reduce((sum, r) => sum + (parseFloat(r['Number of Training Hours']) || 0), 0);
        const uniqueTrainees = new Set(records.map(r => r["Trainee's ID Number"])).size;

        document.getElementById('kpi-total-hours').textContent = totalHours.toFixed(2);
        document.getElementById('kpi-total-sessions').textContent = records.length;
        document.getElementById('kpi-unique-trainees').textContent = uniqueTrainees;
        document.getElementById('kpi-avg-hours').textContent = uniqueTrainees > 0 ? (totalHours / uniqueTrainees).toFixed(2) : '0';
    }

    /**
     * Renders all the charts on the dashboard.
     */
    renderCharts() {
        const records = this.dataService.getTrainingLog();

        this.renderHoursByTypeChart(records);
        this.renderSessionsByMonthChart(records);
        this.renderHoursByProjectChart(records);
    }

    /**
     * Renders the 'Training Hours by Type' doughnut chart.
     * @param {Array} records - The training log data.
     */
    renderHoursByTypeChart(records) {
        const hoursByType = records.reduce((acc, r) => {
            const type = r['Training Type'] || 'Unknown';
            acc[type] = (acc[type] || 0) + (parseFloat(r['Number of Training Hours']) || 0);
            return acc;
        }, {});

        this.charts.hoursByTypeChart = new Chart(document.getElementById('hoursByTypeChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(hoursByType),
                datasets: [{
                    data: Object.values(hoursByType),
                    backgroundColor: ['#4f46e5', '#ec4899', '#f59e0b', '#10b981']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Training Hours by Type' }
                }
            }
        });
    }

    /**
     * Renders the 'Training Sessions per Month' line chart.
     * @param {Array} records - The training log data.
     */
    renderSessionsByMonthChart(records) {
        const sessionsByMonth = records.reduce((acc, r) => {
            const month = r.Month || 'Unknown';
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {});

        // Sort months according to the order defined in constants
        const sortedMonths = Object.keys(sessionsByMonth).sort((a, b) => CONFIG.MONTH_ORDER.indexOf(a) - CONFIG.MONTH_ORDER.indexOf(b));
        const sortedData = sortedMonths.map(m => sessionsByMonth[m]);

        this.charts.sessionsByMonthChart = new Chart(document.getElementById('sessionsByMonthChart'), {
            type: 'line',
            data: {
                labels: sortedMonths,
                datasets: [{
                    label: 'Sessions',
                    data: sortedData,
                    borderColor: '#10b981',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Training Sessions per Month' }
                }
            }
        });
    }

    /**
     * Renders the 'Training Hours by Project' bar chart.
     * @param {Array} records - The training log data.
     */
    renderHoursByProjectChart(records) {
        const hoursByProject = records.reduce((acc, r) => {
            const project = r.Project || 'Unknown';
            acc[project] = (acc[project] || 0) + (parseFloat(r['Number of Training Hours']) || 0);
            return acc;
        }, {});

        this.charts.hoursByProjectChart = new Chart(document.getElementById('hoursByProjectChart'), {
            type: 'bar',
            data: {
                labels: Object.keys(hoursByProject),
                datasets: [{
                    label: 'Hours',
                    data: Object.values(hoursByProject),
                    backgroundColor: '#8b5cf6'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Training Hours by Project' }
                }
            }
        });
    }

    /**
     * Destroys all Chart.js instances associated with this component to free up memory
     * and prevent rendering issues when the view is re-rendered.
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
