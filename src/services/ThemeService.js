/**
 * Theme types
 * @enum {string}
 */
export const Theme = {
    DARK: 'dark',
    LIGHT: 'light'
};

/**
 * Service for managing application theme
 * Implements Singleton pattern
 */
export class ThemeService {
    /**
     * @type {ThemeService|null}
     * @private
     */
    static #instance = null;

    /**
     * @type {string}
     * @private
     */
    #storageKey;

    /**
     * @type {Theme}
     * @private
     */
    #currentTheme;

    /**
     * @type {Array<Function>}
     * @private
     */
    #listeners = [];

    /**
     * Private constructor for singleton
     * @param {string} storageKey - LocalStorage key
     */
    constructor(storageKey = 'theme') {
        if (ThemeService.#instance) {
            return ThemeService.#instance;
        }
        this.#storageKey = storageKey;
        this.#currentTheme = Theme.DARK;
        ThemeService.#instance = this;
    }

    /**
     * Get singleton instance
     * @returns {ThemeService} Theme service instance
     */
    static getInstance() {
        if (!ThemeService.#instance) {
            ThemeService.#instance = new ThemeService();
        }
        return ThemeService.#instance;
    }

    /**
     * Subscribe to theme changes
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
     * @param {Theme} theme - New theme
     */
    #notifyListeners(theme) {
        this.#listeners.forEach(callback => callback(theme));
    }

    /**
     * Initialize theme from storage
     * @returns {Theme} Current theme
     */
    init() {
        const savedTheme = localStorage.getItem(this.#storageKey);
        if (savedTheme) {
            this.#currentTheme = savedTheme.replace('-theme', '');
        }
        this.apply(this.#currentTheme);
        return this.#currentTheme;
    }

    /**
     * Apply theme to document
     * @param {Theme} theme - Theme to apply
     */
    apply(theme) {
        const themeClass = `${theme}-theme`;
        document.body.classList.remove(
            theme === Theme.DARK ? Theme.LIGHT : Theme.DARK,
            `${Theme.DARK}-theme`,
            `${Theme.LIGHT}-theme`
        );
        document.body.classList.add(themeClass);
        this.#currentTheme = theme;
        this.#notifyListeners(theme);
    }

    /**
     * Toggle between dark and light themes
     * @returns {Theme} New theme
     */
    toggle() {
        const newTheme = this.#currentTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
        this.apply(newTheme);
        localStorage.setItem(this.#storageKey, `${newTheme}-theme`);
        return newTheme;
    }

    /**
     * Get current theme
     * @returns {Theme} Current theme
     */
    getTheme() {
        return this.#currentTheme;
    }

    /**
     * Check if current theme is dark
     * @returns {boolean} True if dark theme
     */
    isDark() {
        return this.#currentTheme === Theme.DARK;
    }

    /**
     * Check if current theme is light
     * @returns {boolean} True if light theme
     */
    isLight() {
        return this.#currentTheme === Theme.LIGHT;
    }
}
