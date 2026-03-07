import { ParserFactory } from '../core/ParserFactory.js';
import { NotificationService, NotificationType } from './NotificationService.js';
import { FileService } from './FileService.js';
import { ClipboardService } from './ClipboardService.js';

/**
 * Main service for config generation and management
 * Implements Facade pattern
 */
export class ConfigService {
    /**
     * @type {ParserFactory}
     * @private
     */
    #parserFactory;

    /**
     * @type {NotificationService}
     * @private
     */
    #notificationService;

    /**
     * @type {FileService}
     * @private
     */
    #fileService;

    /**
     * @type {ClipboardService}
     * @private
     */
    #clipboardService;

    /**
     * @type {Object|null}
     * @private
     */
    #currentConfig = null;

    /**
     * @type {string}
     * @private
     */
    #currentOutput = '';

    /**
     * @type {Array}
     * @private
     */
    #currentWarnings = [];

    /**
     * Create config service with dependencies
     * @param {Object} options - Service options
     * @param {NotificationService} options.notificationService
     * @param {FileService} options.fileService
     * @param {ClipboardService} options.clipboardService
     */
    constructor({
        notificationService = new NotificationService(),
        fileService = new FileService(),
        clipboardService = new ClipboardService()
    } = {}) {
        this.#parserFactory = new ParserFactory();
        this.#notificationService = notificationService;
        this.#fileService = fileService;
        this.#clipboardService = clipboardService;
    }

    /**
     * Get current configuration
     * @returns {Object|null} Current config
     */
    get currentConfig() {
        return this.#currentConfig;
    }

    /**
     * Get current output string
     * @returns {string} Formatted config JSON
     */
    get currentOutput() {
        return this.#currentOutput;
    }

    /**
     * Get current warnings
     * @returns {Array} Warnings array
     */
    get currentWarnings() {
        return this.#currentWarnings;
    }

    /**
     * Check if there's a valid config
     * @returns {boolean} Has config
     */
    hasConfig() {
        return this.#currentConfig !== null;
    }

    /**
     * Generate configuration from URL
     * @param {string} url - Proxy URL to parse
     * @returns {ConfigService} This instance for chaining
     */
    generate(url) {
        const trimmedUrl = url.trim();

        if (!trimmedUrl) {
            this.#reset();
            return this;
        }

        const result = this.#parserFactory.parse(trimmedUrl);

        if (result.success) {
            this.#currentConfig = result.config;
            this.#currentOutput = JSON.stringify(result.config, null, 4);
            this.#currentWarnings = result.warnings;

            if (result.warnings.length > 0) {
                result.warnings.forEach(w =>
                    this.#notificationService.show(w, NotificationType.WARNING, 5000)
                );
            }
        } else {
            this.#reset();
            this.#notificationService.error(result.error || 'Ошибка генерации');
        }

        return this;
    }

    /**
     * Reset current state
     * @private
     */
    #reset() {
        this.#currentConfig = null;
        this.#currentOutput = '';
        this.#currentWarnings = [];
    }

    /**
     * Save current config to file
     * @param {string} filename - File name
     * @returns {boolean} Success status
     */
    saveToFile(filename = '04_outbounds.json') {
        if (!this.#currentConfig) {
            this.#notificationService.error('Сначала сгенерируйте конфигурацию');
            return false;
        }

        this.#fileService.downloadJson(this.#currentConfig, filename);
        this.#notificationService.success('Файл сохранён!');
        return true;
    }

    /**
     * Copy current config to clipboard
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard() {
        if (!this.#currentOutput) {
            this.#notificationService.error('Нечего копировать');
            return false;
        }

        const success = await this.#clipboardService.copy(this.#currentOutput);
        if (success) {
            this.#notificationService.success('Скопировано в буфер обмена!');
        } else {
            this.#notificationService.error('Не удалось скопировать');
        }
        return success;
    }

    /**
     * Get supported protocols
     * @returns {string[]} Array of protocol names
     */
    getSupportedProtocols() {
        return this.#parserFactory.getSupportedProtocols();
    }

    /**
     * Subscribe to notifications
     * @param {Function} callback - Notification callback
     * @returns {Function} Unsubscribe function
     */
    subscribeToNotifications(callback) {
        return this.#notificationService.subscribe(callback);
    }
}
