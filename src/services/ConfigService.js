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
}
