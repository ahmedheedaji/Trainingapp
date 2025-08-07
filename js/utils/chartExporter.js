/**
 * @file Provides functionality to export Chart.js instances as PNG images.
 */
export class ChartExporter {
    /**
     * Exports a single Chart.js instance to a PNG file.
     * @param {Chart} chartInstance - The instance of the chart to export.
     * @param {string} filename - The desired filename for the downloaded image (without extension).
     */
    static exportChart(chartInstance, filename) {
        if (chartInstance && typeof chartInstance.toBase64Image === 'function') {
            const a = document.createElement('a');
            a.href = chartInstance.toBase64Image();
            a.download = `${filename}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            console.error('Invalid chart instance provided for export.');
        }
    }

    /**
     * Attaches click event listeners to all elements with the 'chart-export-btn' class.
     * When clicked, it exports the chart specified by the button's 'data-chart' attribute.
     * @param {object} charts - An object containing all the chart instances, keyed by their ID.
     */
    static setupExportListeners(charts) {
        document.querySelectorAll('.chart-export-btn').forEach(button => {
            // Clone and replace the button to remove any old event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            newButton.addEventListener('click', (e) => {
                const chartId = e.target.dataset.chart;
                const chart = charts[chartId];
                if (chart) {
                    this.exportChart(chart, chartId);
                } else {
                    console.error(`Chart with ID "${chartId}" not found for export.`);
                }
            });
        });
    }
}
