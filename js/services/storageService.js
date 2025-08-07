/**
 * @file Manages all interactions with the browser's localStorage.
 * This service provides a simple, consistent API for saving, loading, and removing data,
 * while also handling potential errors that can occur during storage operations.
 */
export class StorageService {
    /**
     * Saves data to localStorage under a specific key.
     * The data is automatically converted to a JSON string.
     *
     * @param {string} key - The key under which to store the data.
     * @param {any} data - The data to store (e.g., an array or object).
     */
    static save(key, data) {
        try {
            // Use JSON.stringify to convert the data into a string for storage.
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            // Log an error if saving fails (e.g., if storage is full).
            console.error(`Failed to save data for key "${key}" to localStorage:`, error);
        }
    }

    /**
     * Loads data from localStorage by its key.
     * The loaded JSON string is automatically parsed back into a JavaScript object or array.
     *
     * @param {string} key - The key of the data to retrieve.
     * @returns {any|null} The parsed data, or null if the key doesn't exist or an error occurs.
     */
    static load(key) {
        try {
            const data = localStorage.getItem(key);
            // If data exists, parse it from JSON; otherwise, return null.
            return data ? JSON.parse(data) : null;
        } catch (error) {
            // Log an error if parsing fails (e.g., if the data is corrupted).
            console.error(`Failed to load or parse data for key "${key}" from localStorage:`, error);
            return null;
        }
    }

    /**
     * Removes an item from localStorage by its key.
     *
     * @param {string} key - The key of the item to remove.
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Failed to remove item for key "${key}" from localStorage:`, error);
        }
    }
}
