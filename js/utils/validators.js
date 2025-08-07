/**
 * @file Contains static methods for form and data validation.
 */
export class Validators {
    /**
     * Checks if a value is a non-empty string.
     * @param {string} value - The value to check.
     * @returns {boolean} True if the value is a non-empty string.
     */
    static isNotEmpty(value) {
        return typeof value === 'string' && value.trim() !== '';
    }

    /**
     * Checks if a value is a valid positive number.
     * @param {any} value - The value to check.
     * @returns {boolean} True if the value is a positive number.
     */
    static isPositiveNumber(value) {
        const num = parseFloat(value);
        return !isNaN(num) && isFinite(num) && num > 0;
    }

    /**
     * Validates a training record object.
     * @param {object} record - The record to validate.
     * @returns {Array<string>} An array of error messages. An empty array means the record is valid.
     */
    static validateTrainingRecord(record) {
        const errors = [];
        if (!record['Training Date']) {
            errors.push('Training Date is required.');
        }
        if (!record["Trainee's ID Number"]) {
            errors.push("Trainee's ID Number is required.");
        }
        if (!record['Training Type']) {
            errors.push('Training Type is required.');
        }
        if (!this.isPositiveNumber(record['Number of Training Hours'])) {
            errors.push('Number of Training Hours must be a positive number.');
        }
        if (record['Training Type'] === 'Refreshment' && !record['Refreshment Type']) {
            errors.push('Refreshment Type is required for Refreshment training.');
        }
        return errors;
    }
}
