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
        // Shadowsocks URL может быть в двух форматах:
        // 1. ss://base64(method:password)@host:port#label
        // 2. ss://method:password@host:port#label (редко)
        
        const hashIndex = url.indexOf('#');
        let hash = '';
        let urlWithoutHash = url;
        
        if (hashIndex !== -1) {
            hash = url.substring(hashIndex);
            urlWithoutHash = url.substring(0, hashIndex);
        }
        
        // Извлекаем base64 часть до @
        const at_index = urlWithoutHash.indexOf('@');
        if (at_index === -1) {
            return {
                config: null,
                warnings: [],
                success: false,
                error: 'Неверный формат ссылки'
            };
        }
        
        const userInfoEncoded = urlWithoutHash.substring(5, at_index); // после "ss://"
        const hostPart = urlWithoutHash.substring(at_index + 1);
        const [address, portStr] = hostPart.split(':');
        const port = parseInt(portStr, 10);
        
        // Декодируем method:password из base64
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
        }
        
        const parsedUrl = new URL(urlWithoutHash + hash);
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
