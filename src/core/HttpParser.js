import { BaseParser } from './BaseParser.js';

/**
 * Parser for HTTP and HTTPS protocol URLs
 * Based on v2rayNG HttpFmt.kt specification
 * Format: http://username:password@server:port#Remarks
 *         https://username:password@server:port#Remarks
 */
export class HttpParser extends BaseParser {
    /**
     * @inheritDoc
     */
    canParse(url) {
        return url.startsWith('http://') || url.startsWith('https://');
    }

    /**
     * @inheritDoc
     */
    parse(url) {
        try {
            const parsedUrl = new URL(url);
            const params = new URLSearchParams(parsedUrl.search);

            const address = parsedUrl.hostname;
            const port = parseInt(parsedUrl.port, 10) || (parsedUrl.protocol === 'https:' ? 443 : 80);

            let username = '';
            let password = '';

            // Extract username:password from userInfo
            if (parsedUrl.username) {
                username = decodeURIComponent(parsedUrl.username);
                if (parsedUrl.password) {
                    password = decodeURIComponent(parsedUrl.password);
                }
            }

            const tag = this.extractTag(params, parsedUrl.hash);
            const outbound = this.createHttpOutbound(address, port, username, password, parsedUrl.protocol === 'https:', tag);
            const config = this.createConfig([outbound]);

            return {
                config,
                warnings: [],
                success: true,
                error: null
            };
        } catch (error) {
            console.error('Error parsing HTTP URL:', error);
            return {
                config: null,
                warnings: [],
                success: false,
                error: 'Failed to parse HTTP URL'
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

        return 'http';
    }

    /**
     * Create HTTP outbound
     * @private
     * @param {string} address - Server address
     * @param {number} port - Server port
     * @param {string} username - Username (optional)
     * @param {string} password - Password
     * @param {boolean} isHttps - Is HTTPS protocol
     * @param {string} tag - Outbound tag
     * @returns {Object} HTTP outbound
     */
    createHttpOutbound(address, port, username, password, isHttps, tag) {
        const settings = {
            servers: [
                {
                    address,
                    port,
                    method: 'none',
                    ota: false
                }
            ]
        };

        // Add users if credentials exist
        if (username) {
            settings.servers[0].users = [
                {
                    user: username,
                    pass: password || '',
                    level: 0
                }
            ];
        }

        const streamSettings = {
            network: 'tcp',
            security: isHttps ? 'tls' : 'none'
        };

        if (isHttps) {
            streamSettings.tlsSettings = {
                allowInsecure: false,
                serverName: address,
                fingerprint: 'chrome'
            };
        }

        return {
            tag,
            protocol: 'http',
            settings,
            streamSettings
        };
    }
}
