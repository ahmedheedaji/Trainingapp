/**
 * Application-wide constants and configuration settings.
 * This object is exported to be used by other modules, ensuring a single source of truth
 * for configuration data.
 */
export const CONFIG = {
    /**
     * A list of names for trainers who are authorized to use the application.
     * This is used during the login process to validate the user.
     */
    AUTHORIZED_TRAINERS: [
        "Mariyam Bounouar", "Ahmed El Heddaji", "Ahmed Lahlou",
        "Nora Sadki", "Soukaina El Bouziani", "Fatima Lyazidi",
        "Kamal Hbahem", "Saida Karbal"
    ],

    /**
     * Defines the standard order of months for sorting and display purposes
     * throughout the application, particularly in charts and reports.
     */
    MONTH_ORDER: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ],

    /**
     * Defines the order of months for a fiscal year, which starts in July.
     * This is used specifically for the Yearly Report view.
     */
    FISCAL_MONTHS: [
        "July", "August", "September", "October", "November", "December",
        "January", "February", "March", "April", "May", "June"
    ],

    /**
     * Centralizes the keys used for storing data in the browser's localStorage.
     * Using this object prevents typos and makes it easy to update keys in one place.
     */
    STORAGE_KEYS: {
        TRAINING_DATA: 'trainingData',
        PLANNED_SESSIONS: 'plannedSessions'
    }
};
