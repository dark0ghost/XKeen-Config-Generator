/**
 * Russian translations
 */
export default {
    app: {
        title: 'XKeen Config Generator',
        subtitle: 'Генератор конфигурации прокси'
    },
    nav: {
        documentation: 'Документация',
        github: 'GitHub'
    },
    form: {
        urlLabel: 'Proxy URLs (одна или несколько ссылок)',
        urlPlaceholder: 'vless://, vmess://, trojan://, ss://\nМожно вставить несколько ссылок (каждая с новой строки)',
        generateBtn: 'Сгенерировать конфиг',
        saveBtn: 'Сохранить в файл',
        loadBtn: 'Загрузить из файла',
        copyBtn: 'Копировать'
    },
    output: {
        label: 'JSON Output',
        placeholder: 'Здесь появится конфигурация...'
    },
    status: {
        enterUrl: 'Введите ссылку',
        generating: 'Генерация...',
        success: 'Конфигурация сгенерирована',
        successMultiple: 'Сгенерировано {count} конфиг(ов)',
        loaded: 'Загружено {count} outbound(ов)',
        error: 'Ошибка генерации',
        saving: 'Сохранение...',
        saved: 'Файл сохранён!',
        copying: 'Копирование...',
        copied: 'Скопировано в буфер обмена!',
        copyFailed: 'Не удалось скопировать',
        loadError: 'Ошибка загрузки файла'
    },
    warnings: {
        port443: '⚠️ Рекомендуется использовать порт 443.'
    },
    notifications: {
        generateFirst: 'Сначала сгенерируйте конфигурацию',
        nothingToCopy: 'Нечего копировать',
        invalidFile: 'Неверная структура файла: отсутствует массив outbounds',
        jsonError: 'Ошибка JSON: файл содержит некорректные данные',
        fileReadError: 'Ошибка чтения файла',
        protocolNotSupported: 'Протокол не поддерживается',
        parseError: 'Ошибка разбора ссылки'
    },
    help: {
        title: 'Помощь',
        step1: 'Вставьте ссылку (или несколько) в поле выше',
        step2: 'Нажмите "Сгенерировать конфиг"',
        step3: 'Скопируйте результат или сохраните в файл',
        supportedProtocols: 'Поддерживаемые протоколы:',
        exampleTitle: 'Пример ссылки:',
        tips: 'Советы:',
        tip1: 'Используйте порт 443 для лучшей совместимости',
        tip2: 'Можно вставить несколько ссылок одновременно',
        tip3: 'Каждая ссылка должна быть с новой строки'
    }
};
