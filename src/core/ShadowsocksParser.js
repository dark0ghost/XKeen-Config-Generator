import { BaseParser } from './BaseParser.js';

/**
 * Parser for Shadowsocks protocol URLs
 */
export class ShadowsocksParser extends BaseParser {
    /**
     * @inheritDoc
     */
    canParse(url) {
        return url.startsWith('ss://') || url.startsWith('shadowsocks://');
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

        const [, , address, portStr] = match;
        const port = parseInt(portStr, 10);
        const { method, password } = this.parseUserInfo(url);

        const outbound = this.createShadowsocksOutbound(address, port, method, password);
        const config = this.createConfig([outbound]);

        return {
            config,
            warnings: [],
            success: true,
            error: null
        };
    }

    /**
     * Parse user info from Shadowsocks URL
     * @private
     * @param {string} url - Shadowsocks URL
     * @returns {{method: string, password: string}} Method and password
     */
    parseUserInfo(url) {
        const parsedParams = new URLSearchParams(url.split('?')[1] || '');
        return {
            method: parsedParams.get('method') || 'aes-256-gcm',
            password: parsedParams.get('password') || ''
        };
    }

    /**
     * Create Shadowsocks outbound
     * @private
     * @param {string} address - Server address
     * @param {number} port - Server port
     * @param {string} method - Encryption method
     * @param {string} password - Password
     * @returns {Object} Shadowsocks outbound
     */
    createShadowsocksOutbound(address, port, method, password) {
        return {
            tag: 'ss',
            protocol: 'shadowsocks',
            settings: {
                servers: [
                    {
                        address,
                        port,
                        method,
                        password
                    }
                ]
            }
        };
    }
}
