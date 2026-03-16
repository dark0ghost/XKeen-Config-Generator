import { BaseParser } from './BaseParser.js';
import { VmessParser } from './VmessParser.js';
import { VlessTrojanParser } from './VlessTrojanParser.js';
import { ShadowsocksParser } from './ShadowsocksParser.js';
import { Hysteria2Parser } from './Hysteria2Parser.js';
import { SocksParser } from './SocksParser.js';
import { WireGuardParser } from './WireGuardParser.js';
import { HttpParser } from './HttpParser.js';

/**
 * Factory class for creating URL parsers (Factory pattern)
 */
export class ParserFactory {
    constructor() {
        this.parsers = [
            new VmessParser(),
            new VlessTrojanParser(),
            new ShadowsocksParser(),
            new Hysteria2Parser(),
            new SocksParser(),
            new WireGuardParser(),
            new HttpParser()
        ];
    }

    /**
     * Get appropriate parser for the URL
     * @param {string} url
     * @returns {BaseParser|null}
     */
    getParser(url) {
        for (const parser of this.parsers) {
            if (parser.canParse(url)) {
                return parser;
            }
        }
        return null;
    }

    /**
     * Parse URL using appropriate parser
     * @param {string} url
     * @returns {ParseResult}
     */
    parse(url) {
        const parser = this.getParser(url);
        if (!parser) {
            return {
                config: null,
                warnings: [],
                success: false,
                error: 'Protocol not supported'
            };
        }
        return parser.parse(url);
    }

    /**
     * Add custom parser
     * @param {BaseParser} parser
     */
    addParser(parser) {
        if (!(parser instanceof BaseParser)) {
            throw new Error('Parser must extend BaseParser');
        }
        this.parsers.push(parser);
    }

    /**
     * Get supported protocols
     * @returns {string[]}
     */
    getSupportedProtocols() {
        return this.parsers.map(parser => {
            return parser.constructor.name.replace('Parser', '').toLowerCase();
        });
    }
}
