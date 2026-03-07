/**
 * Theme types
 * @enum {string}
 */
export const Theme = {
    DARK: 'dark',
    LIGHT: 'light'
};

/**
 * Service for managing application theme (Singleton pattern)
 */
export class ThemeService {
    static instance = null;

    constructor(storageKey = 'theme') {
        if (ThemeService.instance) {
            return ThemeService.instance;
        }
        this.storageKey = storageKey;
        this.currentTheme = Theme.DARK;
        this.listeners = [];
        ThemeService.instance = this;
    }

    static getInstance() {
        if (!ThemeService.instance) {
            ThemeService.instance = new ThemeService();
        }
        return ThemeService.instance;
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    notifyListeners(theme) {
        this.listeners.forEach(callback => callback(theme));
    }

    init() {
        const savedTheme = localStorage.getItem(this.storageKey);
        if (savedTheme) {
            this.currentTheme = savedTheme.replace('-theme', '');
        }
        this.apply(this.currentTheme);
        return this.currentTheme;
    }

    apply(theme) {
        const themeClass = `${theme}-theme`;
        document.body.classList.remove(
            theme === Theme.DARK ? Theme.LIGHT : Theme.DARK,
            `${Theme.DARK}-theme`,
            `${Theme.LIGHT}-theme`
        );
        document.body.classList.add(themeClass);
        this.currentTheme = theme;
        this.notifyListeners(theme);
    }

    toggle() {
        const newTheme = this.currentTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
        this.apply(newTheme);
        localStorage.setItem(this.storageKey, `${newTheme}-theme`);
        return newTheme;
    }

    getTheme() {
        return this.currentTheme;
    }

    isDark() {
        return this.currentTheme === Theme.DARK;
    }

    isLight() {
        return this.currentTheme === Theme.LIGHT;
    }
}
