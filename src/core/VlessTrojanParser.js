import { BaseParser } from './BaseParser.js';

/**
 * Parser for VLESS and Trojan protocol URLs
 */
export class VlessTrojanParser extends BaseParser {
    /**
     * @inheritDoc
     */
    canParse(url) {
        return url.startsWith('vless://') || url.startsWith('trojan://');
    }

    /**
     * @inheritDoc
     */
    parse(url) {
        // eslint-disable-next-line no-unused-vars
        const regex = /([a-z]+):\/\/([^@]+)@([^:]+):(\d+)/;
        const match = url.match(regex);

        if (!match) {
            return {
                config: null,
                warnings: [],
                success: false,
                error: 'Неверный формат ссылки'
            };
        }

        const [, protocol, userInfo, address, portStr] = match;
        const port = parseInt(portStr, 10);
        const parsedUrl = new URL(url);
        const params = new URLSearchParams(parsedUrl.search);

        const warnings = this.generateWarnings(protocol, port);
        const outbound = this.createOutbound(protocol, address, port, userInfo, params);
        const config = this.createConfig([outbound]);

        return {
            config,
            warnings,
            success: true,
            error: null
        };
    }

    /**
     * Generate warnings for the configuration
     * @private
     * @param {string} protocol - Protocol name
     * @param {number} port - Server port
     * @returns {string[]} Array of warning messages
     */
    generateWarnings(protocol, port) {
        const warnings = [];
        if (port !== 443 && protocol !== 'ss') {
            warnings.push('⚠️ Рекомендуется использовать порт 443.');
        }
        return warnings;
    }

    /**
     * Create VLESS or Trojan outbound
     * @private
     * @param {string} protocol - Protocol name
     * @param {string} address - Server address
     * @param {number} port - Server port
     * @param {string} userInfo - User information from URL
     * @param {URLSearchParams} params - URL parameters
     * @returns {Object} Protocol outbound
     */
    createOutbound(protocol, address, port, userInfo, params) {
        const baseOutbound = {
            tag: 'vless-reality',
            protocol,
            settings: {}
        };

        if (protocol === 'vless') {
            baseOutbound.settings.vnext = [
                {
                    address,
                    port,
                    users: [
                        {
                            id: userInfo,
                            flow: params.get('flow') || '',
                            encryption: 'none',
                            level: 0
                        }
                    ]
                }
            ];
        } else {
            baseOutbound.settings.servers = [
                {
                    address,
                    port,
                    password: userInfo,
                    flow: params.get('flow') || '',
                    method: 'chacha20-poly1305',
                    ota: false,
                    level: 0
                }
            ];
        }

        baseOutbound.streamSettings = this.createStreamSettings(protocol, params);

        return baseOutbound;
    }

    /**
     * Create stream settings based on parameters
     * @private
     * @param {string} protocol - Protocol name
     * @param {URLSearchParams} params - URL parameters
     * @returns {Object} Stream settings
     */
    createStreamSettings(protocol, params) {
        const security = params.get('security') || (protocol === 'trojan' ? 'tls' : '');
        const network = params.get('type') || 'tcp';

        const settings = {
            network,
            security
        };

        // TLS settings
        if (security === 'tls' || protocol === 'trojan') {
            const alpn = params.get('alpn');
            settings.tlsSettings = {
                alpn: alpn ? alpn.split(',') : [],
                fingerprint: params.get('fp') || '',
                serverName: params.get('sni') || '',
                allowInsecure: true,
                show: false
            };
        }

        // Reality settings
        if (security === 'reality') {
            settings.realitySettings = {
                publicKey: params.get('pbk') || '',
                fingerprint: params.get('fp') || '',
                serverName: params.get('sni') || '',
                shortId: params.get('sid') || '',
                spiderX: params.get('spx') || '/'
            };
        }

        // WS settings
        if (network === 'ws') {
            settings.wsSettings = {
                path: params.get('path') || '',
                headers: {
                    Host: params.get('host') || ''
                }
            };
        }

        return settings;
    }
}
