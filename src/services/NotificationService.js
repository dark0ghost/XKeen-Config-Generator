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
 */
export class NotificationService {
    constructor(defaultDuration = 3000) {
        this.defaultDuration = defaultDuration;
        this.currentToast = null;
        this.listeners = [];
    }

    /**
     * Subscribe to notification events
     * @param {Function} callback
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    /**
     * Notify all listeners
     * @private
     */
    notifyListeners(type, message) {
        this.listeners.forEach(callback => callback({ type, message }));
    }

    /**
     * Show toast notification
     * @param {string} message
     * @param {NotificationType} type
     * @param {number|null} duration
     */
    show(message, type = NotificationType.INFO, duration = this.defaultDuration) {
        if (this.currentToast) {
            this.currentToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        this.currentToast = toast;
        this.notifyListeners(type, message);

        if (duration !== null) {
            setTimeout(() => {
                if (toast === this.currentToast) {
                    this.hide();
                }
            }, duration);
        }
    }

    success(message) {
        this.show(message, NotificationType.SUCCESS);
    }

    error(message) {
        this.show(message, NotificationType.ERROR);
    }

    warning(message) {
        this.show(message, NotificationType.WARNING);
    }

    info(message) {
        this.show(message, NotificationType.INFO);
    }

    hide() {
        if (this.currentToast) {
            this.currentToast.remove();
            this.currentToast = null;
        }
    }

    hideAll() {
        document.querySelectorAll('.toast').forEach(toast => toast.remove());
        this.currentToast = null;
    }
}
