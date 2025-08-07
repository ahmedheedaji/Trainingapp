/**
 * @file A wrapper for the PapaParse library to handle CSV import and export operations.
 */
export class CSVHandler {
    /**
     * Converts an array of objects into a CSV string and triggers a download.
     * @param {Array<object>} data - The data to be exported.
     * @param {string} filename - The desired filename for the downloaded CSV (without extension).
     */
    static exportCSV(data, filename) {
        if (!window.Papa) {
            console.error('PapaParse is not loaded. CSV export failed.');
            return;
        }
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Parses a local CSV file.
     * @param {File} file - The CSV file object from a file input.
     * @param {Function} callback - The function to call with the parsed data results.
     */
    static importCSV(file, callback) {
        if (!window.Papa) {
            console.error('PapaParse is not loaded. CSV import failed.');
            return;
        }
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (callback) {
                    callback(results.data);
                }
            },
            error: (err) => {
                console.error('Error parsing CSV file:', err);
            }
        });
    }
}
