import { BaseParser } from './BaseParser.js';

/**
 * Parser for Hysteria2 and Hy2 protocol URLs
 * Based on v2rayNG Hysteria2Fmt.kt specification
 */
export class Hysteria2Parser extends BaseParser {
    /**
     * @inheritDoc
     */
    canParse(url) {
        return url.startsWith('hysteria2://') || url.startsWith('hy2://');
    }

    /**
     * @inheritDoc
     */
    parse(url) {
        try {
            const parsedUrl = new URL(url);
            const params = new URLSearchParams(parsedUrl.search);

            const address = parsedUrl.hostname;
            const port = parseInt(parsedUrl.port, 10);
            const password = parsedUrl.username;

            const tag = this.extractTag(params, parsedUrl.hash);
            const outbound = this.createHysteria2Outbound(address, port, password, params, tag);
            const config = this.createConfig([outbound]);

            return {
                config,
                warnings: [],
                success: true,
                error: null
            };
        } catch (error) {
            console.error('Error parsing Hysteria2 URL:', error);
            return {
                config: null,
                warnings: [],
                success: false,
                error: 'Failed to parse Hysteria2 URL'
            };
        }
    }

    /**
     * Extract tag from URL parameters and hash
     * @private
     * @param {URLSearchParams} params - URL parameters
     * @param {string} hash - URL hash fragment
     * @returns {string} Tag for outbound
     */
    extractTag(params, hash) {
        if (hash && hash.length > 1) {
            try {
                return decodeURIComponent(hash.substring(1));
            } catch {
                return hash.substring(1);
            }
        }

        const remarks = params.get('remarks');
        if (remarks) {
            return remarks;
        }

        return 'hysteria2';
    }

    /**
     * Create Hysteria2 outbound
     * @private
     * @param {string} address - Server address
     * @param {number} port - Server port
     * @param {string} password - Authentication password
     * @param {URLSearchParams} params - URL parameters
     * @param {string} tag - Outbound tag
     * @returns {Object} Hysteria2 outbound
     */
    createHysteria2Outbound(address, port, password, params, tag) {
        const security = params.get('security') || 'tls';
        const sni = params.get('sni') || address;
        const alpn = params.get('alpn');
        const insecure = params.get('insecure') || params.get('allowInsecure');

        const streamSettings = {
            network: 'hysteria2',
            security,
            tlsSettings: {
                serverName: sni,
                alpn: alpn ? alpn.split(',') : ['h3'],
                allowInsecure: insecure === '1' || insecure === 'true' || false
            }
        };

        const hysteria2Settings = {
            password,
            obfs: params.get('obfs') || 'plain',
            obfsPassword: params.get('obfs-password') || '',
            ports: params.get('mport') || '',
            portHoppingInterval: params.get('mportHopInt') || '',
            pinnedCA256: params.get('pinSHA256') || '',
            bandwidthDown: params.get('down') || '',
            bandwidthUp: params.get('up') || ''
        };

        return {
            tag,
            protocol: 'hysteria2',
            settings: {
                servers: [
                    {
                        address,
                        port
                    }
                ]
            },
            streamSettings,
            hysteria2Settings
        };
    }
}
