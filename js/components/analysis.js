/**
 * @file Manages the Detailed Analysis view.
 * This component is responsible for rendering a variety of charts that provide
 * deep insights into the training data, such as breakdowns by gender,
 * training type, and sector on a weekly and monthly basis.
 */

import { ChartExporter } from '../utils/chartExporter.js';

export class Analysis {
    /**
     * Initializes the Analysis component.
     * @param {DataService} dataService - An instance of the DataService.
     */
    constructor(dataService) {
        this.dataService = dataService;
        this.charts = {};
    }

    /**
     * Renders all charts in the analysis view.
     */
    render() {
        this.destroyCharts();
        const records = this.dataService.getTrainingLog();

        // An array of chart-rendering functions to call
        const chartRenderers = [
            this.renderWeeklyHoursByGenderChart,
            this.renderWeeklyHoursByTypeChart,
            this.renderMonthlyHoursByGenderChart,
            this.renderMonthlyHoursByTypeChart,
            this.renderRefreshmentOverviewChart,
            this.renderAvgHoursByGenderChart,
            this.renderSessionsByGenderChart,
            this.renderSessionsByAreaChart,
        ];

        // Execute each renderer function
        chartRenderers.forEach(renderer => renderer.call(this, records));

        ChartExporter.setupExportListeners(this.charts);
    }

    // --- Chart Rendering Methods --- //

    renderWeeklyHoursByGenderChart(records) {
        const data = records.reduce((acc, r) => {
            const key = `${r.Week}-${r.Sector}`;
            if (!acc[key]) acc[key] = { Male: 0, Female: 0, label: key };
            if (r.Gender === 'Male' || r.Gender === 'Female') {
                acc[key][r.Gender] += parseFloat(r['Number of Training Hours']) || 0;
            }
            return acc;
        }, {});
        const chartData = Object.values(data).sort((a,b) => a.label.localeCompare(b.label));

        this.charts.weeklyHoursByGenderChart = new Chart(document.getElementById('weeklyHoursByGenderChart'), {
            type: 'bar',
            data: {
                labels: chartData.map(d => d.label),
                datasets: [
                    { label: 'Female', data: chartData.map(d => d.Female), backgroundColor: '#ec4899' },
                    { label: 'Male', data: chartData.map(d => d.Male), backgroundColor: '#3b82f6' }
                ]
            },
            options: { responsive: true, plugins: { title: { display: true, text: 'Weekly Training Hrs By Gender & Sector' } } }
        });
    }

    renderWeeklyHoursByTypeChart(records) {
        const data = records.reduce((acc, r) => {
            const key = `${r.Week}-${r.Sector}`;
            if (!acc[key]) acc[key] = { Qualification: 0, Refreshment: 0, label: key };
            if (r['Training Type'] === 'Qualification' || r['Training Type'] === 'Refreshment') {
                acc[key][r['Training Type']] += parseFloat(r['Number of Training Hours']) || 0;
            }
            return acc;
        }, {});
        const chartData = Object.values(data).sort((a,b) => a.label.localeCompare(b.label));

        this.charts.weeklyHoursByTypeChart = new Chart(document.getElementById('weeklyHoursByTypeChart'), {
            type: 'bar',
            data: {
                labels: chartData.map(d => d.label),
                datasets: [
                    { label: 'Qualification', data: chartData.map(d => d.Qualification), backgroundColor: '#10b981' },
                    { label: 'Refreshment', data: chartData.map(d => d.Refreshment), backgroundColor: '#06b6d4' }
                ]
            },
            options: { responsive: true, plugins: { title: { display: true, text: 'Weekly Training Hrs By Type & Sector' } } }
        });
    }

    renderMonthlyHoursByGenderChart(records) {
        const data = records.reduce((acc, r) => {
            const key = `${r.Month}-${r.Sector}`;
            if (!acc[key]) acc[key] = { Male: 0, Female: 0, label: key };
            if (r.Gender === 'Male' || r.Gender === 'Female') {
                acc[key][r.Gender] += parseFloat(r['Number of Training Hours']) || 0;
            }
            return acc;
        }, {});
        const chartData = Object.values(data).sort((a,b) => a.label.localeCompare(b.label));

        this.charts.monthlyHoursByGenderChart = new Chart(document.getElementById('monthlyHoursByGenderChart'), {
            type: 'bar',
            data: {
                labels: chartData.map(d => d.label),
                datasets: [
                    { label: 'Female', data: chartData.map(d => d.Female), backgroundColor: '#ec4899' },
                    { label: 'Male', data: chartData.map(d => d.Male), backgroundColor: '#3b82f6' }
                ]
            },
            options: { responsive: true, plugins: { title: { display: true, text: 'Monthly Training Hrs By Gender & Sector' } } }
        });
    }

    renderMonthlyHoursByTypeChart(records) {
        const data = records.reduce((acc, r) => {
            const key = `${r.Month}-${r.Sector}`;
            if (!acc[key]) acc[key] = { Qualification: 0, Refreshment: 0, label: key };
            if (r['Training Type'] === 'Qualification' || r['Training Type'] === 'Refreshment') {
                acc[key][r['Training Type']] += parseFloat(r['Number of Training Hours']) || 0;
            }
            return acc;
        }, {});
        const chartData = Object.values(data).sort((a,b) => a.label.localeCompare(b.label));

        this.charts.monthlyHoursByTypeChart = new Chart(document.getElementById('monthlyHoursByTypeChart'), {
            type: 'bar',
            data: {
                labels: chartData.map(d => d.label),
                datasets: [
                    { label: 'Qualification', data: chartData.map(d => d.Qualification), backgroundColor: '#10b981' },
                    { label: 'Refreshment', data: chartData.map(d => d.Refreshment), backgroundColor: '#06b6d4' }
                ]
            },
            options: { responsive: true, plugins: { title: { display: true, text: 'Monthly Training Hrs By Type & Sector' } } }
        });
    }

    renderRefreshmentOverviewChart(records) {
        const refreshOverview = records.filter(r => r['Training Type'] === 'Refreshment').reduce((acc, r) => {
            const type = r['Refreshment Type'] || 'Other';
            acc[type] = (acc[type] || 0) + (parseFloat(r['Number of Training Hours']) || 0);
            return acc;
        }, {});

        this.charts.refreshmentOverviewChart = new Chart(document.getElementById('refreshmentOverviewChart'), {
            type: 'bar',
            data: {
                labels: Object.keys(refreshOverview),
                datasets: [{ label: 'Hours', data: Object.values(refreshOverview), backgroundColor: ['#f59e0b', '#ef4444', '#84cc16'] }]
            },
            options: { responsive: true, plugins: { title: { display: true, text: 'Refreshment Overview (Hours)' } } }
        });
    }

    renderAvgHoursByGenderChart(records) {
        const avgHours = { Qualification: { Male: { h: 0, c: 0 }, Female: { h: 0, c: 0 } }, Refreshment: { Male: { h: 0, c: 0 }, Female: { h: 0, c: 0 } } };
        records.forEach(r => {
            if (avgHours[r['Training Type']] && avgHours[r['Training Type']][r.Gender]) {
                avgHours[r['Training Type']][r.Gender].h += parseFloat(r['Number of Training Hours']) || 0;
                avgHours[r['Training Type']][r.Gender].c++;
            }
        });

        const femaleAvg = [
            avgHours.Qualification.Female.c > 0 ? avgHours.Qualification.Female.h / avgHours.Qualification.Female.c : 0,
            avgHours.Refreshment.Female.c > 0 ? avgHours.Refreshment.Female.h / avgHours.Refreshment.Female.c : 0
        ];
        const maleAvg = [
            avgHours.Qualification.Male.c > 0 ? avgHours.Qualification.Male.h / avgHours.Qualification.Male.c : 0,
            avgHours.Refreshment.Male.c > 0 ? avgHours.Refreshment.Male.h / avgHours.Refreshment.Male.c : 0
        ];

        this.charts.avgHoursByGenderChart = new Chart(document.getElementById('avgHoursByGenderChart'), {
            type: 'bar',
            data: {
                labels: ['Qualification', 'Refreshment'],
                datasets: [
                    { label: 'Female', data: femaleAvg, backgroundColor: '#ec4899' },
                    { label: 'Male', data: maleAvg, backgroundColor: '#3b82f6' }
                ]
            },
            options: { responsive: true, plugins: { title: { display: true, text: 'Average Training Hours By Gender & Type' } } }
        });
    }

    renderSessionsByGenderChart(records) {
        const sessionsByGender = records.reduce((acc, r) => {
            if (r.Gender === 'Male' || r.Gender === 'Female') {
                acc[r.Gender] = (acc[r.Gender] || 0) + 1;
            }
            return acc;
        }, {});

        this.charts.sessionsByGenderChart = new Chart(document.getElementById('sessionsByGenderChart'), {
            type: 'pie',
            data: {
                labels: Object.keys(sessionsByGender),
                datasets: [{ label: 'Number of Sessions', data: Object.values(sessionsByGender), backgroundColor: ['#ec4899', '#3b82f6'] }]
            },
            options: { responsive: true, plugins: { title: { display: true, text: 'Total Training Sessions By Gender' } } }
        });
    }

    renderSessionsByAreaChart(records) {
        const sessionsByArea = records.reduce((acc, r) => {
            const sector = r.Sector || 'Unknown';
            acc[sector] = (acc[sector] || 0) + 1;
            return acc;
        }, {});

        this.charts.sessionsByAreaChart = new Chart(document.getElementById('sessionsByAreaChart'), {
            type: 'pie',
            data: {
                labels: Object.keys(sessionsByArea),
                datasets: [{ label: 'Number of Sessions', data: Object.values(sessionsByArea), backgroundColor: ['#a78bfa', '#f87171', '#fbbf24'] }]
            },
            options: { responsive: true, plugins: { title: { display: true, text: 'Total Training Sessions By Area' } } }
        });
    }

    /**
     * Destroys all Chart.js instances to free up memory.
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
