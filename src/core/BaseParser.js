/**
 * @typedef {Object} ProxyConfig
 * @property {Array} outbounds - Array of proxy outbounds
 */

/**
 * @typedef {Object} ParseResult
 * @property {ProxyConfig|null} config - Parsed configuration
 * @property {string[]} warnings - Array of warning messages
 * @property {boolean} success - Whether parsing was successful
 * @property {string|null} error - Error message if failed
 */

/**
 * Abstract base class for URL parsers
 * @interface
 */
export class BaseParser {
    /**
     * Parse a proxy URL into configuration
     * @abstract
     * @param {string} url - The proxy URL to parse
     * @returns {ParseResult} Parse result with config and warnings
     */
    parse(url) {
        if (new.target === BaseParser) {
            throw new Error('BaseParser is abstract and cannot be instantiated directly');
        }
        throw new Error('Method "parse()" must be implemented');
    }

    /**
     * Check if this parser can handle the given URL
     * @abstract
     * @param {string} url - The proxy URL to check
     * @returns {boolean} True if this parser can handle the URL
     */
    canParse(url) {
        throw new Error('Method "canParse()" must be implemented');
    }

    /**
     * Generate standard outbound structure
     * @protected
     * @param {string} protocol - Protocol name
     * @param {string} address - Server address
     * @param {number} port - Server port
     * @param {Object} settings - Protocol-specific settings
     * @returns {Object} Outbound configuration
     */
    createOutbound(protocol, address, port, settings) {
        return {
            tag: `${protocol}-proxy`,
            protocol,
            settings
        };
    }

    /**
     * Create standard direct outbound
     * @protected
     * @returns {Object} Direct outbound configuration
     */
    createDirectOutbound() {
        return {
            tag: 'direct',
            protocol: 'freedom'
        };
    }

    /**
     * Create standard block outbound
     * @protected
     * @returns {Object} Block outbound configuration
     */
    createBlockOutbound() {
        return {
            tag: 'block',
            protocol: 'blackhole',
            settings: {
                response: { type: 'http' }
            }
        };
    }

    /**
     * Create complete configuration with all outbounds
     * @protected
     * @param {Array} proxyOutbounds - Proxy outbounds to include
     * @returns {ProxyConfig} Complete configuration
     */
    createConfig(proxyOutbounds) {
        return {
            outbounds: [
                ...proxyOutbounds,
                this.createDirectOutbound(),
                this.createBlockOutbound()
            ]
        };
    }
}
