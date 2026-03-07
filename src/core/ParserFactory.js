import { VmessParser } from './VmessParser.js';
import { VlessTrojanParser } from './VlessTrojanParser.js';
import { ShadowsocksParser } from './ShadowsocksParser.js';

/**
 * Factory class for creating URL parsers
 * Implements Factory pattern
 */
export class ParserFactory {
    /**
     * @type {BaseParser[]}
     * @private
     */
    #parsers;

    /**
     * Create parser factory with default parsers
     */
    constructor() {
        this.#parsers = [
            new VmessParser(),
            new VlessTrojanParser(),
            new ShadowsocksParser()
        ];
    }

    /**
     * Get appropriate parser for the URL
     * @param {string} url - URL to parse
     * @returns {BaseParser|null} Parser instance or null
     */
    getParser(url) {
        for (const parser of this.#parsers) {
            if (parser.canParse(url)) {
                return parser;
            }
        }
        return null;
    }

    /**
     * Parse URL using appropriate parser
     * @param {string} url - URL to parse
     * @returns {ParseResult} Parse result
     */
    parse(url) {
        const parser = this.getParser(url);
        if (!parser) {
            return {
                config: null,
                warnings: [],
                success: false,
                error: 'Протокол не поддерживается'
            };
        }
        return parser.parse(url);
    }

    /**
     * Add custom parser to the factory
     * @param {BaseParser} parser - Parser instance to add
     */
    addParser(parser) {
        if (!(parser instanceof BaseParser)) {
            throw new Error('Parser must extend BaseParser');
        }
        this.#parsers.push(parser);
    }

    /**
     * Get list of supported protocols
     * @returns {string[]} Array of protocol names
     */
    getSupportedProtocols() {
        return this.#parsers.map(parser => {
            const name = parser.constructor.name;
            return name.replace('Parser', '').toLowerCase();
        });
    }
}
