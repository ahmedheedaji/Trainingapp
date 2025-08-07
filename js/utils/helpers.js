/**
 * @file Contains reusable helper and utility functions for the application.
 */

/**
 * A highly reusable function to create and configure DOM elements.
 * This simplifies the process of building UI components programmatically.
 *
 * @param {string} tag - The HTML tag for the element to be created (e.g., 'div', 'button').
 * @param {object} [properties={}] - An object of properties to assign to the element (e.g., { className: 'card', textContent: 'Hello' }).
 * @param {...(Node|string)} children - Child elements or text nodes to append to the created element.
 * @returns {HTMLElement} The fully constructed HTML element.
 */
export function createElement(tag, properties = {}, ...children) {
    const element = document.createElement(tag);

    Object.assign(element, properties);

    for (const child of children) {
        if (child) {
            element.append(child);
        }
    }

    return element;
}

/**
 * Formats a date string or Date object into a more readable local date format (e.g., MM/DD/YYYY).
 *
 * @param {string|Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
export function formatDate(date) {
    if (!date) return '';
    // Ensures consistent date parsing across browsers before formatting.
    return new Date(date.replace(/-/g, '\/')).toLocaleDateString();
}

/**
 * Calculates the fiscal year for a given date. The fiscal year is assumed to start in July.
 * For example, a date in August 2024 would be in "FY 2024", while a date in
 * May 2024 would be in "FY 2023".
 *
 * @param {Date} date - The date object to determine the fiscal year for.
 * @returns {string} The fiscal year in "FY YYYY" format.
 */
export function getFiscalYear(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return '';
    }
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed (January is 0, July is 6)

    // If the month is July (6) or later, it's part of the current year's fiscal period.
    // Otherwise, it's part of the previous year's fiscal period.
    const fiscalYear = month >= 6 ? year : year - 1;
    return `FY ${fiscalYear}`;
}
