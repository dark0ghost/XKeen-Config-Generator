/**
 * English translations
 */
export default {
    app: {
        title: 'XKeen Config Generator',
        subtitle: 'Proxy Configuration Generator'
    },
    nav: {
        documentation: 'Documentation',
        github: 'GitHub'
    },
    form: {
        urlLabel: 'Proxy URLs (one or multiple links)',
        urlPlaceholder: 'vless://, vmess://, trojan://, ss://\nYou can paste multiple links (one per line)',
        generateBtn: 'Generate Config',
        saveBtn: 'Save to File',
        loadBtn: 'Load from File',
        copyBtn: 'Copy'
    },
    output: {
        label: 'JSON Output',
        placeholder: 'Configuration will appear here...'
    },
    status: {
        enterUrl: 'Enter a link',
        generating: 'Generating...',
        success: 'Configuration generated',
        successMultiple: 'Generated {count} config(s)',
        loaded: 'Loaded {count} outbound(s)',
        error: 'Generation error',
        saving: 'Saving...',
        saved: 'File saved!',
        copying: 'Copying...',
        copied: 'Copied to clipboard!',
        copyFailed: 'Failed to copy',
        loadError: 'File load error'
    },
    warnings: {
        port443: '⚠️ Port 443 is recommended for better compatibility.'
    },
    notifications: {
        generateFirst: 'Generate a configuration first',
        nothingToCopy: 'Nothing to copy',
        invalidFile: 'Invalid file structure: missing outbounds array',
        jsonError: 'JSON error: file contains invalid data',
        fileReadError: 'File read error',
        protocolNotSupported: 'Protocol not supported',
        parseError: 'Parse error'
    },
    help: {
        title: 'Help',
        step1: 'Paste link(s) into the field above',
        step2: 'Click "Generate Config"',
        step3: 'Copy the result or save to file',
        supportedProtocols: 'Supported protocols:',
        exampleTitle: 'Example link:',
        tips: 'Tips:',
        tip1: 'Use port 443 for better compatibility',
        tip2: 'You can paste multiple links at once',
        tip3: 'Each link must be on a new line'
    }
};
