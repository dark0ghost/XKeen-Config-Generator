/**
 * Notification types
 * @enum {string}
 */
export const NotificationType = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

/**
 * Service for handling user notifications
 * Implements Observer pattern for toast notifications
 */
export class NotificationService {
    /**
     * @type {number}
     * @private
     */
    #defaultDuration;

    /**
     * @type {HTMLElement|null}
     * @private
     */
    #currentToast = null;

    /**
     * @type {Array<Function>}
     * @private
     */
    #listeners = [];

    /**
     * Create notification service
     * @param {number} defaultDuration - Default toast duration in ms
     */
    constructor(defaultDuration = 3000) {
        this.#defaultDuration = defaultDuration;
    }

    /**
     * Subscribe to notification events
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.#listeners.push(callback);
        return () => {
            this.#listeners = this.#listeners.filter(l => l !== callback);
        };
    }

    /**
     * Notify all listeners
     * @private
     * @param {NotificationType} type - Notification type
     * @param {string} message - Message text
     */
    #notifyListeners(type, message) {
        this.#listeners.forEach(callback => callback({ type, message }));
    }

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {NotificationType} type - Notification type
     * @param {number|null} duration - Display duration (null for persistent)
     */
    show(message, type = NotificationType.INFO, duration = this.#defaultDuration) {
        // Clear existing toast
        if (this.#currentToast) {
            this.#currentToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        this.#currentToast = toast;
        this.#notifyListeners(type, message);

        // Auto-remove after duration
        if (duration !== null) {
            setTimeout(() => {
                if (toast === this.#currentToast) {
                    this.hide();
                }
            }, duration);
        }
    }

    /**
     * Show success notification
     * @param {string} message - Message to display
     */
    success(message) {
        this.show(message, NotificationType.SUCCESS);
    }

    /**
     * Show error notification
     * @param {string} message - Message to display
     */
    error(message) {
        this.show(message, NotificationType.ERROR);
    }

    /**
     * Show warning notification
     * @param {string} message - Message to display
     */
    warning(message) {
        this.show(message, NotificationType.WARNING);
    }

    /**
     * Show info notification
     * @param {string} message - Message to display
     */
    info(message) {
        this.show(message, NotificationType.INFO);
    }

    /**
     * Hide current toast
     */
    hide() {
        if (this.#currentToast) {
            this.#currentToast.remove();
            this.#currentToast = null;
        }
    }

    /**
     * Hide all toasts
     */
    hideAll() {
        document.querySelectorAll('.toast').forEach(toast => toast.remove());
        this.#currentToast = null;
    }
}
