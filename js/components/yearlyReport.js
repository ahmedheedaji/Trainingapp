/**
 * @file Manages the Yearly Report view.
 * This component displays a detailed report for a selected fiscal year,
 * including KPIs, data tables, and summary charts.
 */

import { createElement, getFiscalYear } from '../utils/helpers.js';
import { CONFIG } from '../config/constants.js';
import { ChartExporter } from '../utils/chartExporter.js';

export class YearlyReport {
    /**
     * Initializes the YearlyReport component.
     * @param {DataService} dataService - An instance of the DataService.
     */
    constructor(dataService) {
        this.dataService = dataService;
        this.charts = {};
        this.init();
    }

    /**
     * Sets up the event listener for the fiscal year filter.
     */
    init() {
        document.getElementById('yearly-report-filter').addEventListener('change', () => this.render());
    }

    /**
     * Renders the entire yearly report view.
     */
    render() {
        this.destroyCharts();
        this.populateYearlyReportFilter();
        this.renderReportContent();
        ChartExporter.setupExportListeners(this.charts);
    }

    /**
     * Populates the fiscal year dropdown filter with available years from the data.
     */
    populateYearlyReportFilter() {
        const records = this.dataService.getTrainingLog();
        const fiscalYears = [...new Set(records.map(r => getFiscalYear(new Date(r['Training Date'].replace(/-/g, '/')))))].sort().reverse();
        
        const select = document.getElementById('yearly-report-filter');
        const currentValue = select.value;
        select.innerHTML = '';
        
        if (fiscalYears.length === 0) {
            select.add(new Option("No data available", ""));
            return;
        }
        
        fiscalYears.forEach(fy => {
            if(fy) select.add(new Option(fy, fy));
        });

        // Preserve the currently selected value if it exists, otherwise default to the first year
        select.value = currentValue && fiscalYears.includes(currentValue) ? currentValue : fiscalYears[0] || '';
    }

    /**
     * Renders the main content of the report (KPIs, tables, charts) based on the selected fiscal year.
     */
    renderReportContent() {
        const selectedFiscalYear = document.getElementById('yearly-report-filter').value;

        // Clear the report if no year is selected
        if (!selectedFiscalYear) {
            this.clearReport();
            return;
        }

        const yearlyRecords = this.dataService.getTrainingLog().filter(r => getFiscalYear(new Date(r['Training Date'].replace(/-/g, '/'))) === selectedFiscalYear);
        const yearlyPlannedSessions = this.dataService.getPlannedSessions().filter(p => getFiscalYear(new Date(p.plannedDate.replace(/-/g, '/'))) === selectedFiscalYear);

        const monthlyData = this.calculateMonthlyData(yearlyRecords, yearlyPlannedSessions);
        
        this.renderKPIs(yearlyRecords);
        this.renderTables(monthlyData, yearlyRecords, yearlyPlannedSessions);
        this.renderCharts(monthlyData);
    }

    /**
     * Calculates and aggregates data on a monthly basis for the selected fiscal year.
     * @param {Array} yearlyRecords - The training records for the fiscal year.
     * @param {Array} yearlyPlannedSessions - The planned sessions for the fiscal year.
     * @returns {object} An object with aggregated data for each month.
     */
    calculateMonthlyData(yearlyRecords, yearlyPlannedSessions) {
        const monthlyData = CONFIG.FISCAL_MONTHS.reduce((acc, month) => {
            acc[month] = {
                operatorsQual: new Set(), operatorsRefresh: new Set(),
                hoursQual: 0, hoursRefresh: 0,
                qualifRealised: 0, refreshRealised: 0,
                qualifPlanned: 0, refreshPlanned: 0
            };
            return acc;
        }, {});

        yearlyPlannedSessions.forEach(p => {
            const month = new Date(p.plannedDate.replace(/-/g, '/')).toLocaleString('default', { month: 'long' });
            if (monthlyData[month]) {
                if (p.trainingType === 'Qualification') monthlyData[month].qualifPlanned += p.trainees.length;
                else if (p.trainingType === 'Refreshment') monthlyData[month].refreshPlanned += p.trainees.length;
            }
        });

        yearlyRecords.forEach(r => {
            const month = r.Month;
            if (monthlyData[month]) {
                const hours = parseFloat(r['Number of Training Hours']) || 0;
                const traineeId = r["Trainee's ID Number"];
                if (r['Training Type'] === 'Qualification') {
                    monthlyData[month].operatorsQual.add(traineeId);
                    monthlyData[month].hoursQual += hours;
                    monthlyData[month].qualifRealised++;
                } else if (r['Training Type'] === 'Refreshment') {
                    monthlyData[month].operatorsRefresh.add(traineeId);
                    monthlyData[month].hoursRefresh += hours;
                    monthlyData[month].refreshRealised++;
                }
            }
        });

        return monthlyData;
    }

    /**
     * Renders the KPI cards for the yearly report.
     * @param {Array} yearlyRecords - The training records for the fiscal year.
     */
    renderKPIs(yearlyRecords) {
        const totalUniqueOps = new Set(yearlyRecords.map(r => r["Trainee's ID Number"])).size;
        const totalHours = yearlyRecords.reduce((sum, r) => sum + (parseFloat(r['Number of Training Hours']) || 0), 0);
        const totalQualif = new Set(yearlyRecords.filter(r => r['Training Type'] === 'Qualification').map(r => r["Trainee's ID Number"])).size;
        const totalRefresh = new Set(yearlyRecords.filter(r => r['Training Type'] === 'Refreshment').map(r => r["Trainee's ID Number"])).size;

        document.getElementById('kpi-yr-total-operators').textContent = totalUniqueOps;
        document.getElementById('kpi-yr-total-hours').textContent = totalHours.toFixed(2);
        document.getElementById('kpi-yr-qualifications').textContent = totalQualif;
        document.getElementById('kpi-yr-refreshments').textContent = totalRefresh;
    }

    /**
     * Renders all data tables for the report.
     * @param {object} monthlyData - The aggregated monthly data.
     * @param {Array} yearlyRecords - The training records for the fiscal year.
     * @param {Array} yearlyPlannedSessions - The planned sessions for the fiscal year.
     */
    renderTables(monthlyData, yearlyRecords, yearlyPlannedSessions) {
        const opsData = CONFIG.FISCAL_MONTHS.map(m => [m, monthlyData[m].operatorsQual.size, monthlyData[m].operatorsRefresh.size]);
        const opsTotals = ['Total', new Set(yearlyRecords.filter(r=>r['Training Type']==='Qualification').map(r=>r["Trainee's ID Number"])).size, new Set(yearlyRecords.filter(r=>r['Training Type']==='Refreshment').map(r=>r["Trainee's ID Number"])).size];
        this.buildTable('yr-operators-table-container', 'Nbr of Trained Operators', ['Months', 'Qualification', 'Refreshment'], opsData, opsTotals);

        const hoursData = CONFIG.FISCAL_MONTHS.map(m => [m, monthlyData[m].hoursQual.toFixed(2), monthlyData[m].hoursRefresh.toFixed(2)]);
        const hoursTotals = ['Total', yearlyRecords.filter(r=>r['Training Type']==='Qualification').reduce((s,r)=>s+(parseFloat(r['Number of Training Hours'])||0),0).toFixed(2), yearlyRecords.filter(r=>r['Training Type']==='Refreshment').reduce((s,r)=>s+(parseFloat(r['Number of Training Hours'])||0),0).toFixed(2)];
        this.buildTable('yr-hours-table-container', 'Total Training Hours', ['Months', 'Qualification', 'Refreshment'], hoursData, hoursTotals);

        const qualifData = CONFIG.FISCAL_MONTHS.map(m => [m, monthlyData[m].qualifRealised, monthlyData[m].qualifPlanned]);
        const qualifTotals = ['Total', yearlyRecords.filter(r=>r['Training Type']==='Qualification').length, yearlyPlannedSessions.filter(p=>p.trainingType==='Qualification').reduce((s,p)=>s+p.trainees.length,0)];
        this.buildTable('yr-qualification-table-container', 'Qualification Realised', ['Months', 'Realised', 'Planned'], qualifData, qualifTotals);

        const refreshData = CONFIG.FISCAL_MONTHS.map(m => [m, monthlyData[m].refreshRealised, monthlyData[m].refreshPlanned]);
        const refreshTotals = ['Total', yearlyRecords.filter(r=>r['Training Type']==='Refreshment').length, yearlyPlannedSessions.filter(p=>p.trainingType==='Refreshment').reduce((s,p)=>s+p.trainees.length,0)];
        this.buildTable('yr-refreshment-table-container', 'Refreshment Realised', ['Months', 'Realised', 'Planned'], refreshData, refreshTotals);
    }

    /**
     * A helper function to dynamically build and render a table.
     * @param {string} containerId - The ID of the container element for the table.
     * @param {string} title - The title of the table.
     * @param {Array<string>} headers - An array of header strings.
     * @param {Array<Array<any>>} dataRows - A 2D array of row data.
     * @param {Array<any>} totalRowData - An array of data for the total row.
     */
    buildTable(containerId, title, headers, dataRows, totalRowData) {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // Clear previous content

        const headerRow = createElement('tr', {}, ...headers.map(h => createElement('th', { textContent: h })));
        const bodyRows = dataRows.map(rowData => createElement('tr', {}, ...rowData.map(d => createElement('td', { textContent: d }))));
        const totalRow = createElement('tr', { className: 'font-bold bg-gray-50' }, ...totalRowData.map(t => createElement('td', { textContent: t })));
        
        const table = createElement('table', { className: 'w-full text-sm' }, 
            createElement('thead', {}, headerRow), 
            createElement('tbody', {}, ...bodyRows, totalRow)
        );
        
        container.appendChild(createElement('h3', { className: 'text-lg font-semibold mb-2 text-center', textContent: title }));
        container.appendChild(table);
    }

    /**
     * Renders the charts for the yearly report.
     * @param {object} monthlyData - The aggregated monthly data.
     */
    renderCharts(monthlyData) {
        this.charts.yrOperatorsChart = new Chart(document.getElementById('yrOperatorsChart'), {
            type: 'bar',
            data: {
                labels: CONFIG.FISCAL_MONTHS,
                datasets: [
                    { label: 'Qualification', data: CONFIG.FISCAL_MONTHS.map(m => monthlyData[m].operatorsQual.size), backgroundColor: '#4f46e5' },
                    { label: 'Refreshment', data: CONFIG.FISCAL_MONTHS.map(m => monthlyData[m].operatorsRefresh.size), backgroundColor: '#ec4899' }
                ]
            },
            options: { responsive: true, scales: { x: { stacked: true }, y: { stacked: true } }, plugins: { title: { display: true, text: 'Trained Operators per Month' } } }
        });

        this.charts.yrHoursChart = new Chart(document.getElementById('yrHoursChart'), {
            type: 'bar',
            data: {
                labels: CONFIG.FISCAL_MONTHS,
                datasets: [
                    { label: 'Qualification', data: CONFIG.FISCAL_MONTHS.map(m => monthlyData[m].hoursQual), backgroundColor: '#10b981' },
                    { label: 'Refreshment', data: CONFIG.FISCAL_MONTHS.map(m => monthlyData[m].hoursRefresh), backgroundColor: '#f59e0b' }
                ]
            },
            options: { responsive: true, scales: { x: { stacked: true }, y: { stacked: true } }, plugins: { title: { display: true, text: 'Training Hours per Month' } } }
        });
    }

    /**
     * Clears all report content when no data is available.
     */
    clearReport() {
        document.getElementById('kpi-yr-total-operators').textContent = '0';
        document.getElementById('kpi-yr-total-hours').textContent = '0.00';
        document.getElementById('kpi-yr-qualifications').textContent = '0';
        document.getElementById('kpi-yr-refreshments').textContent = '0';
        document.getElementById('yr-operators-table-container').innerHTML = '';
        document.getElementById('yr-hours-table-container').innerHTML = '';
        document.getElementById('yr-qualification-table-container').innerHTML = '';
        document.getElementById('yr-refreshment-table-container').innerHTML = '';
        this.destroyCharts();
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
