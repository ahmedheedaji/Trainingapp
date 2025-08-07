/**
 * @file Manages all application data and business logic.
 * This service acts as a single source of truth for all data, including
 * training records, planned sessions, and organizational data. It handles
 * creating, reading, updating, and deleting data, and it uses the StorageService
 * to persist data to localStorage.
 */

import { CONFIG } from '../config/constants.js';
import { StorageService } from './storageService.js';

export class DataService {
    /**
     * Initializes the DataService with empty data stores.
     */
    constructor() {
        this.orgaData = [];
        this.trainingData = [];
        this.plannedSessions = [];
        this.currentUser = '';
    }

    /**
     * Initializes the service with the current user's name and organizational data.
     * It then loads any persisted training and planning data from localStorage.
     * @param {string} userName - The name of the logged-in user.
     * @param {Array} orgaData - The array of employee data from the CSV file.
     */
    init(userName, orgaData) {
        this.currentUser = userName;
        this.orgaData = orgaData;
        this.loadFromLocalStorage();
    }

    /**
     * Persists the current state of trainingData and plannedSessions to localStorage.
     * This is a private helper method called after any data modification.
     */
    _saveToLocalStorage() {
        StorageService.save(CONFIG.STORAGE_KEYS.TRAINING_DATA, this.trainingData);
        StorageService.save(CONFIG.STORAGE_KEYS.PLANNED_SESSIONS, this.plannedSessions);
    }

    /**
     * Loads training and planning data from localStorage. If no data is found,
     * it initializes them as empty arrays.
     */
    loadFromLocalStorage() {
        this.trainingData = StorageService.load(CONFIG.STORAGE_KEYS.TRAINING_DATA) || [];
        this.plannedSessions = StorageService.load(CONFIG.STORAGE_KEYS.PLANNED_SESSIONS) || [];
    }

    /**
     * Retrieves an employee's data from the organizational data by their ID.
     * @param {string|number} id - The employee's Matricule number.
     * @returns {object|null} The employee object or null if not found.
     */
    getEmployeeById(id) {
        if (!id) return null;
        const normalizedId = String(id).trim();
        return this.orgaData.find(emp => emp.Matricule && String(emp.Matricule).trim() === normalizedId);
    }

    /**
     * Returns a sorted copy of the training log.
     * @returns {Array} The training records, sorted by date descending.
     */
    getTrainingLog() {
        return [...this.trainingData].sort((a, b) => new Date(b['Training Date']) - new Date(a['Training Date']));
    }

    /**
     * Retrieves a single training record by its unique ID.
     * @param {string} id - The ID of the record.
     * @returns {object|undefined} The record object or undefined if not found.
     */
    getRecordById(id) {
        return this.trainingData.find(record => record.Id === id);
    }

    /**
     * Enriches a training record with additional data derived from the organizational data,
     * such as the trainee's full name, project, and calculated date information.
     * @param {object} record - The training record to enrich.
     * @returns {object} The enriched record.
     */
    _enrichRecord(record) {
        const employee = this.getEmployeeById(record["Trainee's ID Number"]);
        record['Full Name'] = employee ? employee['Full Name'] : 'Unknown';
        record.Gender = employee ? employee['Gender'] : 'Unknown';
        record.Project = employee ? employee['PROJET'] : 'Unknown';
        record['Cost Center'] = employee ? employee['Cost center'] : 'Unknown';

        const date = new Date(record['Training Date'].replace(/-/g, '\/'));
        record.Month = date.toLocaleString('default', { month: 'long' });
        const dayOfMonth = date.getDate();
        record.Week = `Week ${Math.ceil(dayOfMonth / 7)}`;
        
        return record;
    }

    /**
     * Adds a new training record to the log.
     * @param {object} record - The new record to add.
     */
    addRecord(record) {
        record.Id = String(Date.now()) + Math.random();
        record.Trainer = record.Trainer || this.currentUser;
        const enrichedRecord = this._enrichRecord(record);
        this.trainingData.unshift(enrichedRecord);
        this._saveToLocalStorage();
    }

    /**
     * Updates an existing training record.
     * @param {object} updatedRecord - The record with updated information.
     */
    updateRecord(updatedRecord) {
        const index = this.trainingData.findIndex(record => record.Id === updatedRecord.Id);
        if (index !== -1) {
            updatedRecord.Trainer = this.trainingData[index].Trainer; // Preserve original trainer
            const enrichedRecord = this._enrichRecord(updatedRecord);
            this.trainingData[index] = enrichedRecord;
            this._saveToLocalStorage();
        }
    }

    /**
     * Deletes a training record by its ID.
     * @param {string} id - The ID of the record to delete.
     */
    deleteRecord(id) {
        this.trainingData = this.trainingData.filter(record => record.Id !== id);
        this._saveToLocalStorage();
    }

    /**
     * Replaces the entire training log with a new set of data from an import.
     * @param {Array} newData - The array of new records to import.
     */
    importData(newData) {
        this.trainingData = newData.map(record => {
            record.Trainer = this.currentUser;
            if (!record.Id) record.Id = String(Date.now()) + Math.random();
            return this._enrichRecord(record);
        });
        this._saveToLocalStorage();
    }

    /**
     * Returns a sorted copy of the planned sessions.
     * @returns {Array} The planned sessions, sorted by date ascending.
     */
    getPlannedSessions() {
        return [...this.plannedSessions].sort((a, b) => new Date(a.plannedDate) - new Date(b.plannedDate));
    }

    /**
     * Adds a new planned session.
     * @param {object} plan - The new plan to add.
     */
    addPlan(plan) {
        plan.Id = String(Date.now());
        const date = new Date(plan.plannedDate.replace(/-/g, '\/'));
        plan.Month = date.toLocaleString('default', { month: 'long' });
        this.plannedSessions.push(plan);
        this._saveToLocalStorage();
    }

    /**
     * Updates an existing planned session.
     * @param {object} updatedPlan - The plan with updated information.
     */
    updatePlan(updatedPlan) {
        const index = this.plannedSessions.findIndex(p => p.Id === updatedPlan.Id);
        if (index !== -1) {
            const date = new Date(updatedPlan.plannedDate.replace(/-/g, '\/'));
            updatedPlan.Month = date.toLocaleString('default', { month: 'long' });
            this.plannedSessions[index] = updatedPlan;
            this._saveToLocalStorage();
        }
    }

    /**
     * Deletes a planned session by its ID.
     * @param {string} id - The ID of the plan to delete.
     */
    deletePlan(id) {
        this.plannedSessions = this.plannedSessions.filter(p => p.Id !== id);
        this._saveToLocalStorage();
    }

    /**
     * Retrieves a single planned session by its ID.
     * @param {string} id - The ID of the plan.
     * @returns {object|undefined} The plan object or undefined if not found.
     */
    getPlanById(id) {
        return this.plannedSessions.find(p => p.Id === id);
    }
}
