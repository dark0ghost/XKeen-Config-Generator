import { BaseParser } from './BaseParser.js';

/**
 * Parser for Shadowsocks protocol URLs
 * Supports SIP002 and Legacy formats as per v2rayNG specification
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
        // Shadowsocks URL может быть в двух форматах:
        // 1. SIP002: ss://base64(method:password)@host:port#label
        // 2. Legacy: ss://base64(method:password@host:port)#label

        const hashIndex = url.indexOf('#');
        let hash = '';
        let urlWithoutHash = url;

        if (hashIndex !== -1) {
            hash = url.substring(hashIndex);
            urlWithoutHash = url.substring(0, hashIndex);
        }

        // Пытаемся найти @ для SIP002 формата
        const at_index = urlWithoutHash.indexOf('@');
        
        if (at_index !== -1) {
            // SIP002 формат: ss://base64(method:password)@host:port
            return this.parseSip002(urlWithoutHash, hash);
        } else {
            // Legacy формат: ss://base64(method:password@host:port)
            return this.parseLegacy(urlWithoutHash, hash);
        }
    }

    /**
     * Parse SIP002 format: ss://base64(method:password)@host:port#label
     * @private
     * @param {string} urlWithoutHash - URL without hash fragment
     * @param {string} hash - Hash fragment
     * @returns {ParseResult}
     */
    parseSip002(urlWithoutHash, hash) {
        const at_index = urlWithoutHash.indexOf('@');
        const userInfoEncoded = urlWithoutHash.substring(5, at_index);
        const hostPart = urlWithoutHash.substring(at_index + 1);
        const [address, portStr] = hostPart.split(':');
        const port = parseInt(portStr, 10);

        let method = 'aes-256-gcm';
        let password = '';

        try {
            const decoded = atob(userInfoEncoded);
            const colonIndex = decoded.indexOf(':');
            if (colonIndex !== -1) {
                method = decoded.substring(0, colonIndex);
                password = decoded.substring(colonIndex + 1);
            } else {
                method = decoded;
            }
        } catch (e) {
            console.error('Error decoding base64:', e);
            return {
                config: null,
                warnings: [],
                success: false,
                error: 'Ошибка декодирования base64'
            };
        }

        const fullUrl = urlWithoutHash + hash;
        const parsedUrl = new URL(fullUrl);
        const params = new URLSearchParams(parsedUrl.search);
        const tag = this.extractTag(params, parsedUrl.hash);

        const outbound = this.createShadowsocksOutbound(address, port, method, password, tag);
        const config = this.createConfig([outbound]);

        return {
            config,
            warnings: [],
            success: true,
            error: null
        };
    }

    /**
     * Parse Legacy format: ss://base64(method:password@host:port)#label
     * @private
     * @param {string} urlWithoutHash - URL without hash fragment
     * @param {string} hash - Hash fragment
     * @returns {ParseResult}
     */
    parseLegacy(urlWithoutHash, hash) {
        // Декодируем всю строку после ss://
        let encoded = urlWithoutHash.substring(5);
        
        try {
            let decoded = atob(encoded);
            
            // Legacy формат: method:password@host:port
            const regex = /^(.+?):(.*)@(.+?):(\d+?)\/?$/;
            const match = decoded.match(regex);
            
            if (!match) {
                return {
                    config: null,
                    warnings: [],
                    success: false,
                    error: 'Неверный формат legacy ссылки'
                };
            }
            
            const [, method, password, address, portStr] = match;
            const port = parseInt(portStr, 10);
            
            const fullUrl = urlWithoutHash + hash;
            const parsedUrl = new URL(fullUrl);
            const params = new URLSearchParams(parsedUrl.search);
            const tag = this.extractTag(params, parsedUrl.hash);
            
            const outbound = this.createShadowsocksOutbound(address, port, method.toLowerCase(), password, tag);
            const config = this.createConfig([outbound]);
            
            return {
                config,
                warnings: [],
                success: true,
                error: null
            };
        } catch (e) {
            console.error('Error decoding legacy base64:', e);
            return {
                config: null,
                warnings: [],
                success: false,
                error: 'Ошибка декодирования base64 (legacy)'
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
        // Сначала пробуем использовать hash (заголовок ссылки) для читаемости
        if (hash && hash.length > 1) {
            try {
                return decodeURIComponent(hash.substring(1));
            } catch (e) {
                return hash.substring(1);
            }
        }

        // Если hash нет, пробуем sid
        const sid = params.get('sid');
        if (sid) {
            return sid;
        }

        // Если есть параметр remarks, используем его
        const remarks = params.get('remarks');
        if (remarks) {
            return remarks;
        }

        // По умолчанию используем стандартный tag
        return 'ss';
    }

    /**
     * Create Shadowsocks outbound
     * @private
     * @param {string} address - Server address
     * @param {number} port - Server port
     * @param {string} method - Encryption method
     * @param {string} password - Password
     * @param {string} tag - Outbound tag
     * @returns {Object} Shadowsocks outbound
     */
    createShadowsocksOutbound(address, port, method, password, tag) {
        return {
            tag,
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
