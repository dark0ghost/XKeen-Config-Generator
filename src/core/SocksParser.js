import { BaseParser } from './BaseParser.js';

/**
 * Parser for SOCKS protocol URLs
 * Based on v2rayNG SocksFmt.kt specification
 * Format: socks://base64(username:password)@host:port#remarks
 */
export class SocksParser extends BaseParser {
    /**
     * @inheritDoc
     */
    canParse(url) {
        return url.startsWith('socks://');
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

            let username = '';
            let password = '';

            // Extract username:password from userInfo (base64 encoded)
            if (parsedUrl.username) {
                try {
                    const decoded = atob(parsedUrl.username);
                    const colonIndex = decoded.indexOf(':');
                    if (colonIndex !== -1) {
                        username = decoded.substring(0, colonIndex);
                        password = decoded.substring(colonIndex + 1);
                    } else {
                        username = decoded;
                    }
                } catch {
                    // If not base64, use as is
                    username = parsedUrl.username;
                }
            }

            const tag = this.extractTag(params, parsedUrl.hash);
            const outbound = this.createSocksOutbound(address, port, username, password, tag);
            const config = this.createConfig([outbound]);

            return {
                config,
                warnings: [],
                success: true,
                error: null
            };
        } catch (error) {
            console.error('Error parsing SOCKS URL:', error);
            return {
                config: null,
                warnings: [],
                success: false,
                error: 'Failed to parse SOCKS URL'
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

        return 'socks';
    }

    /**
     * Create SOCKS outbound
     * @private
     * @param {string} address - Server address
     * @param {number} port - Server port
     * @param {string} username - Username (optional)
     * @param {string} password - Password
     * @param {string} tag - Outbound tag
     * @returns {Object} SOCKS outbound
     */
    createSocksOutbound(address, port, username, password, tag) {
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

        return {
            tag,
            protocol: 'socks',
            settings,
            streamSettings: {
                network: 'tcp',
                security: 'none'
            }
        };
    }
}
