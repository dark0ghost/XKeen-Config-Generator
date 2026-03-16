import { ParserFactory } from '../core/ParserFactory.js';
import { NotificationService, NotificationType } from './NotificationService.js';
import { FileService } from './FileService.js';
import { ClipboardService } from './ClipboardService.js';

/**
 * Main service for config generation and management (Facade pattern)
 */
export class ConfigService {
    constructor({
        notificationService = new NotificationService(),
        fileService = new FileService(),
        clipboardService = new ClipboardService()
    } = {}) {
        this.parserFactory = new ParserFactory();
        this.notificationService = notificationService;
        this.fileService = fileService;
        this.clipboardService = clipboardService;
        this._currentConfig = null;
        this._currentOutput = '';
        this._currentWarnings = [];
    }

    get currentConfig() {
        return this._currentConfig;
    }

    get currentOutput() {
        return this._currentOutput;
    }

    get currentWarnings() {
        return this._currentWarnings;
    }

    hasConfig() {
        return this._currentConfig !== null;
    }

    generate(url) {
        const trimmedUrl = url.trim();

        if (!trimmedUrl) {
            this.reset();
            return this;
        }

        const result = this.parserFactory.parse(trimmedUrl);

        if (result.success) {
            this._currentConfig = result.config;
            this._currentOutput = JSON.stringify(result.config, null, 4);
            this._currentWarnings = result.warnings;

            if (result.warnings.length > 0) {
                result.warnings.forEach(w =>
                    this.notificationService.show(w, NotificationType.WARNING, 5000)
                );
            }
        } else {
            this.reset();
            this.notificationService.error(result.error || 'Ошибка генерации');
        }

        return this;
    }

    /**
     * Generate config from multiple URLs
     * @param {string[]} urls - Array of proxy URLs
     */
    generateMultiple(urls) {
        if (!urls || urls.length === 0) {
            this.reset();
            return this;
        }

        const allOutbounds = [];
        const allWarnings = [];
        let hasSuccess = false;

        for (const url of urls) {
            const result = this.parserFactory.parse(url.trim());

            if (result.success) {
                hasSuccess = true;
                // Извлекаем outbounds без direct/block (они добавятся один раз в конце)
                const proxyOutbounds = result.config.outbounds.filter(
                    ob => ob.protocol !== 'freedom' && ob.protocol !== 'blackhole'
                );
                allOutbounds.push(...proxyOutbounds);
                allWarnings.push(...result.warnings);
            } else {
                this.notificationService.error(`Ошибка: ${result.error}`, 5000);
            }
        }

        if (hasSuccess) {
            // Создаем финальную конфигурацию с уникальными outbounds
            const config = this.createConfigWithUniqueOutbounds(allOutbounds);
            this._currentConfig = config;
            this._currentOutput = JSON.stringify(config, null, 4);
            this._currentWarnings = [...new Set(allWarnings)]; // Убираем дубликаты предупреждений

            if (this._currentWarnings.length > 0) {
                this._currentWarnings.forEach(w =>
                    this.notificationService.show(w, NotificationType.WARNING, 5000)
                );
            }
        } else {
            this.reset();
            this.notificationService.error('Не удалось сгенерировать конфигурацию');
        }

        return this;
    }

    /**
     * Create config with unique outbound tags
     * @private
     * @param {Object[]} outbounds - Array of proxy outbounds
     * @returns {Object} Complete configuration
     */
    createConfigWithUniqueOutbounds(outbounds) {
        const seenTags = new Set();
        const uniqueOutbounds = [];

        for (const outbound of outbounds) {
            let tag = outbound.tag || 'proxy';
            const originalTag = tag;
            let counter = 1;

            // Делаем tag уникальным если он уже есть
            while (seenTags.has(tag)) {
                tag = `${originalTag}_${++counter}`;
            }

            seenTags.add(tag);
            uniqueOutbounds.push({
                ...outbound,
                tag
            });
        }

        return {
            outbounds: [
                ...uniqueOutbounds,
                this.createDirectOutbound(),
                this.createBlockOutbound()
            ]
        };
    }

    /**
     * Create standard direct outbound
     * @private
     */
    createDirectOutbound() {
        return {
            tag: 'direct',
            protocol: 'freedom'
        };
    }

    /**
     * Create standard block outbound
     * @private
     */
    createBlockOutbound() {
        return {
            tag: 'block',
            protocol: 'blackhole',
            settings: {
                response: { type: 'http' }
            }
        };
    }

    reset() {
        this._currentConfig = null;
        this._currentOutput = '';
        this._currentWarnings = [];
    }

    saveToFile(filename = '04_outbounds.json') {
        if (!this._currentConfig) {
            this.notificationService.error('Сначала сгенерируйте конфигурацию');
            return false;
        }

        this.fileService.downloadJson(this._currentConfig, filename);
        this.notificationService.success('Файл сохранён!');
        return true;
    }

    async copyToClipboard() {
        if (!this._currentOutput) {
            this.notificationService.error('Нечего копировать');
            return false;
        }

        const success = await this.clipboardService.copy(this._currentOutput);
        if (success) {
            this.notificationService.success('Скопировано в буфер обмена!');
        } else {
            this.notificationService.error('Не удалось скопировать');
        }
        return success;
    }

    getSupportedProtocols() {
        return this.parserFactory.getSupportedProtocols();
    }

    subscribeToNotifications(callback) {
        return this.notificationService.subscribe(callback);
    }

    /**
     * Load config from JSON file
     * @param {File} file - File to load
     * @returns {Promise<{success: boolean, error?: string, outboundCount?: number}>}
     */
    async loadFromFile(file) {
        try {
            const text = await file.text();
            const config = JSON.parse(text);

            // Валидация структуры
            if (!config || !Array.isArray(config.outbounds)) {
                return {
                    success: false,
                    error: 'Неверная структура файла: отсутствует массив outbounds'
                };
            }

            this._currentConfig = config;
            this._currentOutput = JSON.stringify(config, null, 4);

            // Подсчитываем proxy outbounds (исключая direct и block)
            const proxyOutbounds = config.outbounds.filter(
                ob => ob.protocol !== 'freedom' && ob.protocol !== 'blackhole'
            );

            return {
                success: true,
                outboundCount: proxyOutbounds.length
            };
        } catch (error) {
            console.error('Error loading file:', error);
            return {
                success: false,
                error: error instanceof SyntaxError
                    ? 'Ошибка JSON: файл содержит некорректные данные'
                    : 'Ошибка чтения файла'
            };
        }
    }
}
