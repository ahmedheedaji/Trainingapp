/**
 * @file A reusable Calendar UI component.
 * This class handles the rendering and user interaction for a monthly calendar view,
 * including displaying events and handling date selection.
 */

import { createElement } from '../utils/helpers.js';
import { CONFIG } from '../config/constants.js';

export class Calendar {
    /**
     * Initializes the Calendar component.
     * @param {object} options - Configuration options for the calendar.
     * @param {Function} options.onDateClick - Callback function executed when a date is clicked. It receives the date string (YYYY-MM-DD).
     * @param {Function} options.getEventsForMonth - A function that returns an array of event objects for a given month and year.
     */
    constructor(options) {
        this.onDateClick = options.onDateClick;
        this.getEventsForMonth = options.getEventsForMonth;

        this.currentDate = new Date();
        this.filteredDate = null;

        this.elements = {
            grid: document.getElementById('calendar-grid'),
            monthYearDisplay: document.getElementById('month-year-display'),
            prevBtn: document.getElementById('prev-month-btn'),
            nextBtn: document.getElementById('next-month-btn'),
        };

        this.init();
    }

    /**
     * Attaches event listeners for calendar navigation.
     */
    init() {
        this.elements.prevBtn.addEventListener('click', () => this.changeMonth(-1));
        this.elements.nextBtn.addEventListener('click', () => this.changeMonth(1));
    }

    /**
     * Renders the calendar for the current month.
     * @param {string|null} filteredDate - A date string (YYYY-MM-DD) to highlight as filtered.
     */
    render(filteredDate = null) {
        this.filteredDate = filteredDate;
        this.elements.grid.innerHTML = ''; // Clear previous state

        const month = this.currentDate.getMonth();
        const year = this.currentDate.getFullYear();
        this.elements.monthYearDisplay.textContent = `${CONFIG.MONTH_ORDER[month]} ${year}`;

        const events = this.getEventsForMonth(month, year);
        const eventDays = new Set(events.map(p => new Date(p.plannedDate.replace(/-/g, '/')).getDate()));

        // Add day names header
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            this.elements.grid.appendChild(createElement('div', { className: 'calendar-day-name' }, day));
        });

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Add empty cells for days before the 1st of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            this.elements.grid.appendChild(createElement('div', { className: 'calendar-day empty' }));
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = this.createDayCell(day, month, year, eventDays);
            this.elements.grid.appendChild(dayCell);
        }
    }

    /**
     * Creates a single day cell for the calendar grid.
     * @param {number} day - The day of the month.
     * @param {number} month - The month (0-indexed).
     * @param {number} year - The year.
     * @param {Set<number>} eventDays - A set of days that have events.
     * @returns {HTMLElement} The created day cell element.
     */
    createDayCell(day, month, year, eventDays) {
        const dayCell = createElement('div', { className: 'calendar-day' }, String(day));
        const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        if (eventDays.has(day)) {
            dayCell.classList.add('has-event');
            dayCell.addEventListener('mouseover', (e) => this.showTooltip(e, currentDateStr));
            dayCell.addEventListener('mouseout', () => this.hideTooltip());
        }

        if (day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
            dayCell.classList.add('today');
        }

        if (this.filteredDate === currentDateStr) {
            dayCell.classList.add('filtered');
        }

        dayCell.addEventListener('click', () => {
            if (this.onDateClick) {
                this.onDateClick(currentDateStr);
            }
        });

        return dayCell;
    }

    /**
     * Changes the displayed month.
     * @param {number} direction - -1 for previous month, 1 for next month.
     */
    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.render(this.filteredDate);
    }

    /**
     * Shows a tooltip with event details.
     * @param {MouseEvent} event - The mouseover event.
     * @param {string} dateStr - The date string for the hovered day.
     */
    showTooltip(event, dateStr) {
        this.hideTooltip();
        const eventsOnDate = this.getEventsForMonth(this.currentDate.getMonth(), this.currentDate.getFullYear())
            .filter(p => p.plannedDate === dateStr);
        
        if (eventsOnDate.length === 0) return;

        const tooltip = createElement('div', { id: 'calendar-tooltip' });
        tooltip.innerHTML = eventsOnDate.map(e => `&bull; ${e.trainingType} (${e.trainees.length} trainees)`).join('<br>');
        document.body.appendChild(tooltip);

        tooltip.style.left = `${event.pageX + 15}px`;
        tooltip.style.top = `${event.pageY}px`;
    }

    /**
     * Hides the calendar tooltip.
     */
    hideTooltip() {
        const tooltip = document.getElementById('calendar-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
}
