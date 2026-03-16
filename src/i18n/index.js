import ru from './ru.js';
import en from './en.js';

/**
 * i18n service for internationalization (Singleton pattern)
 */
export class I18nService {
    static instance = null;

    constructor() {
        if (I18nService.instance) {
            return I18nService.instance;
        }

        this.translations = { ru, en };
        this.currentLang = this.detectLanguage();
        this.fallbackLang = 'en';
        this.listeners = [];

        I18nService.instance = this;
    }

    static getInstance() {
        if (!I18nService.instance) {
            I18nService.instance = new I18nService();
        }
        return I18nService.instance;
    }

    /**
   * Detect user language from browser or localStorage
   * @returns {string} Language code
   */
    detectLanguage() {
        const saved = localStorage.getItem('lang');
        if (saved && this.translations[saved]) {
            return saved;
        }

        const browserLang = navigator.language.slice(0, 2);
        if (this.translations[browserLang]) {
            return browserLang;
        }

        return this.fallbackLang;
    }

    /**
   * Get current language
   * @returns {string}
   */
    getLanguage() {
        return this.currentLang;
    }

    /**
   * Set current language
   * @param {string} lang - Language code
   */
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('lang', lang);
            this.notifyListeners();
        }
    }

    /**
   * Get language from URL parameter
   * @returns {string|null}
   */
    getLanguageFromURL() {
        const params = new URLSearchParams(window.location.search);
        const lang = params.get('lang');
        if (lang && this.translations[lang]) {
            return lang;
        }
        return null;
    }

    /**
   * Subscribe to language changes
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
   * Notify all listeners about language change
   * @private
   */
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.currentLang));
    }

    /**
   * Get translation by key path
   * @param {string} key - Dot-separated key path (e.g., 'form.urlLabel')
   * @param {Object} params - Parameters for interpolation
   * @returns {string} Translated string
   */
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];

        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) {
                // Fallback to English
                value = this.translations[this.fallbackLang];
                for (const fk of keys) {
                    value = value?.[fk];
                }
                break;
            }
        }

        if (typeof value !== 'string') {
            return key;
        }

        // Interpolate parameters
        return value.replace(/\{(\w+)\}/g, (_, param) => {
            return params[param] !== undefined ? params[param] : `{${param}}`;
        });
    }

    /**
   * Get all translations for current language
   * @returns {Object}
   */
    getTranslations() {
        return this.translations[this.currentLang];
    }

    /**
   * Check if language is available
   * @param {string} lang
   * @returns {boolean}
   */
    isAvailable(lang) {
        return !!this.translations[lang];
    }

    /**
   * Get available languages
   * @returns {string[]}
   */
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }
}
