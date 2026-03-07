/**
 * Abstract base class for URL parsers
 */
export class BaseParser {
    /**
     * Parse a proxy URL into configuration
     * @param {string} url
     * @returns {ParseResult}
     */
    parse(url) {
        if (new.target === BaseParser) {
            throw new Error('BaseParser is abstract and cannot be instantiated directly');
        }
        throw new Error('Method "parse()" must be implemented');
    }

    /**
     * Check if this parser can handle the given URL
     * @param {string} url
     * @returns {boolean}
     */
    canParse(url) {
        throw new Error('Method "canParse()" must be implemented');
    }

    /**
     * Generate standard outbound structure
     * @protected
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
