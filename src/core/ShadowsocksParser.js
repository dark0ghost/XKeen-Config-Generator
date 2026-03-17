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
        // Shadowsocks URL can be in two formats:
        // 1. SIP002: ss://base64(method:password)@host:port#label
        // 2. Legacy: ss://base64(method:password@host:port)#label

        const hashIndex = url.indexOf('#');
        let hash = '';
        let urlWithoutHash = url;

        if (hashIndex !== -1) {
            hash = url.substring(hashIndex);
            urlWithoutHash = url.substring(0, hashIndex);
        }

        // Try to find @ for SIP002 format
        const at_index = urlWithoutHash.indexOf('@');

        if (at_index !== -1) {
            // SIP002 format: ss://base64(method:password)@host:port
            return this.parseSip002(urlWithoutHash, hash);
        } else {
            // Legacy format: ss://base64(method:password@host:port)
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
                error: 'Base64 decoding error'
            };
        }

        const fullUrl = urlWithoutHash + hash;
        const parsedUrl = new URL(fullUrl);
        const params = new URLSearchParams(parsedUrl.search);
        const tag = this.extractTag(params, parsedUrl.hash);

        // Check for plugin
        const plugin = params.get('plugin');
        const pluginOptions = plugin ? this.parsePlugin(plugin) : null;

        const outbound = this.createShadowsocksOutbound(address, port, method, password, tag, pluginOptions);
        const config = this.createConfig([outbound]);

        return {
            config,
            warnings: pluginOptions ? ['⚠️ Plugin detected: ' + pluginOptions.name] : [],
            success: true,
            error: null
        };
    }

    /**
     * Parse plugin parameter
     * @private
     * @param {string} plugin - Plugin string (e.g., "obfs-local;obfs=http;obfs-host=example.com")
     * @returns {Object|null} Plugin configuration
     */
    parsePlugin(plugin) {
        try {
            // Decode URL-encoded string
            const decoded = decodeURIComponent(plugin);

            // Split by semicolon
            const parts = decoded.split(';');
            const name = parts[0];
            const options = {};

            for (let i = 1; i < parts.length; i++) {
                const [key, value] = parts[i].split('=');
                if (key && value) {
                    options[key] = value;
                }
            }

            return { name, options };
        } catch (e) {
            console.error('Error parsing plugin:', e);
            return null;
        }
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
        const encoded = urlWithoutHash.substring(5);
        
        try {
            const decoded = atob(encoded);
            
            // Legacy формат: method:password@host:port
            const regex = /^(.+?):(.*)@(.+?):(\d+?)\/?$/;
            const match = decoded.match(regex);
            
            if (!match) {
                return {
                    config: null,
                    warnings: [],
                    success: false,
                    error: 'Invalid legacy URL format'
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
                error: 'Base64 decoding error (legacy)'
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
        // First try to use hash (URL title) for readability
        if (hash && hash.length > 1) {
            const rawTag = hash.substring(1);
            try {
                // Use decodeURIComponent for proper emoji and Unicode handling
                return decodeURIComponent(rawTag.replace(/\+/g, '%20'));
            } catch {
                // If decoding fails, return raw string
                return rawTag;
            }
        }

        // If no hash, try sid
        const sid = params.get('sid');
        if (sid) {
            return sid;
        }

        // If remarks parameter exists, use it
        const remarks = params.get('remarks');
        if (remarks) {
            return remarks;
        }

        // Use default tag
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
     * @param {Object|null} pluginOptions - Plugin configuration
     * @returns {Object} Shadowsocks outbound
     */
    createShadowsocksOutbound(address, port, method, password, tag, pluginOptions = null) {
        const settings = {
            servers: [
                {
                    address,
                    port,
                    method,
                    password
                }
            ]
        };

        // Add plugin support
        if (pluginOptions) {
            settings.servers[0].plugin = pluginOptions.name;
            settings.servers[0].pluginOpts = pluginOptions.options;
        }

        return {
            tag,
            protocol: 'shadowsocks',
            settings
        };
    }
}
