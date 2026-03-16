import { BaseParser } from './BaseParser.js';

/**
 * Parser for VMess protocol URLs
 * Supports both Classic (Base64 JSON) and Standard URI formats
 */
export class VmessParser extends BaseParser {
    /**
     * @inheritDoc
     */
    canParse(url) {
        return url.startsWith('vmess://');
    }

    /**
     * @inheritDoc
     */
    parse(url) {
        const queryIndex = url.indexOf('?');
        const hashIndex = url.indexOf('#');

        const hasQueryOrHash = (queryIndex !== -1 && queryIndex > 8) || 
                               (hashIndex !== -1 && hashIndex > 8);
        
        if (hasQueryOrHash) {
            return this.parseStandardUri(url);
        }

        // Otherwise use Classic Base64 Format
        return this.parseClassic(url);
    }

    /**
     * Parse Classic Base64 format: vmess://base64_encoded_json
     * @private
     * @param {string} url - VMess URL
     * @returns {ParseResult}
     */
    parseClassic(url) {
        try {
            const base64Payload = url.substring(8);
            const decodedPayload = atob(base64Payload);
            const vmessConfig = JSON.parse(decodedPayload);

            const tag = this.extractTagFromConfig(vmessConfig);
            const outbound = this.createVmessOutbound(vmessConfig, tag);
            const config = this.createConfig([outbound]);

            return {
                config,
                warnings: [],
                success: true,
                error: null
            };
        } catch (error) {
            console.error('Error parsing VMess URL:', error);
            return {
                config: null,
                warnings: [],
                success: false,
                error: 'Failed to parse VMess URL'
            };
        }
    }

    /**
     * Parse Standard URI format: vmess://uuid@server:port?security=tls&type=ws&host=...&path=...#Remarks
     * @private
     * @param {string} url - VMess URL
     * @returns {ParseResult}
     */
    parseStandardUri(url) {
        try {
            const parsedUrl = new URL(url);
            const params = new URLSearchParams(parsedUrl.search);

            const address = parsedUrl.hostname;
            const port = parseInt(parsedUrl.port, 10);
            const uuid = parsedUrl.username;

            // Create vmessConfig from URL parameters
            const vmessConfig = {
                add: address,
                port: port.toString(),
                id: uuid,
                aid: params.get('aid') || '0',
                scy: params.get('scy') || params.get('security') || 'auto',
                net: params.get('type') || params.get('net') || 'tcp',
                type: params.get('headerType') || 'none',
                host: params.get('host') || '',
                path: params.get('path') || '',
                tls: params.get('security') === 'tls' ? 'tls' : '',
                sni: params.get('sni') || params.get('host') || '',
                alpn: params.get('alpn') || '',
                fp: params.get('fp') || '',
                insecure: params.get('insecure') || '0',
                ps: params.get('remarks') || params.get('ps') || ''
            };

            const tag = this.extractTagFromUrl(params, parsedUrl.hash);
            const outbound = this.createVmessOutbound(vmessConfig, tag);
            const config = this.createConfig([outbound]);

            return {
                config,
                warnings: [],
                success: true,
                error: null
            };
        } catch (error) {
            console.error('Error parsing VMess Standard URI:', error);
            return {
                config: null,
                warnings: [],
                success: false,
                error: 'Failed to parse VMess URL (Standard URI)'
            };
        }
    }

    /**
     * Extract tag from VMess config (Classic format)
     * @private
     * @param {Object} vmessConfig - Parsed VMess configuration
     * @returns {string} Tag for outbound
     */
    extractTagFromConfig(vmessConfig) {
        // Try to get tag from sid parameter (if present in extended data)
        if (vmessConfig.sid) {
            return vmessConfig.sid;
        }

        // If ps (server description) exists, use it
        if (vmessConfig.ps) {
            return vmessConfig.ps;
        }

        // Use default tag
        return 'vmess';
    }

    /**
     * Extract tag from URL parameters and hash (Standard URI format)
     * @private
     * @param {URLSearchParams} params - URL parameters
     * @param {string} hash - URL hash fragment
     * @returns {string} Tag for outbound
     */
    extractTagFromUrl(params, hash) {
        // First try to use hash (URL title) for readability
        if (hash && hash.length > 1) {
            try {
                return decodeURIComponent(hash.substring(1));
            } catch {
                return hash.substring(1);
            }
        }

        // If no hash, try sid
        const sid = params.get('sid');
        if (sid) {
            return sid;
        }

        // If remarks or ps parameter exists, use it
        const remarks = params.get('remarks') || params.get('ps');
        if (remarks) {
            return remarks;
        }

        // Use default tag
        return 'vmess';
    }

    /**
     * Create VMess outbound from parsed config
     * @private
     * @param {Object} vmessConfig - Parsed VMess configuration
     * @param {string} tag - Outbound tag
     * @returns {Object} VMess outbound
     */
    createVmessOutbound(vmessConfig, tag) {
        return {
            tag,
            protocol: 'vmess',
            settings: {
                vnext: [
                    {
                        address: vmessConfig.add,
                        port: parseInt(vmessConfig.port, 10),
                        users: [
                            {
                                id: vmessConfig.id,
                                alterId: parseInt(vmessConfig.aid, 10) || 0,
                                security: vmessConfig.scy || 'auto',
                                level: 0
                            }
                        ]
                    }
                ]
            },
            streamSettings: this.createStreamSettings(vmessConfig)
        };
    }

    /**
     * Create stream settings based on network type
     * @private
     * @param {Object} vmessConfig - VMess configuration
     * @returns {Object} Stream settings
     */
    createStreamSettings(vmessConfig) {
        const settings = {
            network: vmessConfig.net,
            security: vmessConfig.tls === 'tls' ? 'tls' : 'none'
        };

        if (vmessConfig.tls === 'tls') {
            const alpn = vmessConfig.alpn;
            const insecure = vmessConfig.insecure;
            settings.tlsSettings = {
                allowInsecure: insecure === '1' || insecure === 'true' ? true : false,
                serverName: vmessConfig.sni || vmessConfig.host || '',
                fingerprint: vmessConfig.fp || 'chrome',
                alpn: alpn ? alpn.split(',') : []
            };

            // ECH (Encrypted Client Hello) поддержка
            if (vmessConfig.ech) {
                settings.tlsSettings.echConfig = vmessConfig.ech;
            }
        }

        // Reality поддержка (для vmess-over-reality)
        if (vmessConfig.security === 'reality') {
            settings.realitySettings = {
                publicKey: vmessConfig.pbk || '',
                fingerprint: vmessConfig.fp || '',
                serverName: vmessConfig.sni || '',
                shortId: vmessConfig.sid || '',
                spiderX: vmessConfig.spx || '/'
            };
        }

        switch (vmessConfig.net) {
        case 'ws':
            settings.wsSettings = {
                path: vmessConfig.path || '/',
                headers: {
                    Host: vmessConfig.host || ''
                }
            };
            break;
        case 'h2':
            settings.httpSettings = {
                host: vmessConfig.host ? vmessConfig.host.split(',') : [],
                path: vmessConfig.path || '/'
            };
            break;
        case 'kcp':
            settings.kcpSettings = {
                mtu: 1350,
                tti: 50,
                uplinkCapacity: 12,
                downlinkCapacity: 100,
                congestion: false,
                readBufferSize: 2,
                writeBufferSize: 2,
                header: { type: vmessConfig.type || 'none' },
                seed: vmessConfig.seed || ''
            };
            break;
        case 'grpc':
            settings.grpcSettings = {
                serviceName: vmessConfig.path || vmessConfig.serviceName || 'grpc',
                multiMode: vmessConfig.type === 'multi' || vmessConfig.mode === 'multi',
                authority: vmessConfig.authority || ''
            };
            break;
        case 'http':
        case 'h3':
            settings.httpSettings = {
                host: vmessConfig.host ? vmessConfig.host.split(',') : [],
                path: vmessConfig.path || '/'
            };
            break;
        case 'httpupgrade':
            settings.httpupgradeSettings = {
                path: vmessConfig.path || '/',
                host: vmessConfig.host || ''
            };
            break;
        case 'xhttp':
            settings.xhttpSettings = {
                path: vmessConfig.path || '/',
                host: vmessConfig.host || '',
                mode: vmessConfig.mode || 'auto',
                extra: vmessConfig.xhttpExtra || ''
            };
            break;
        case 'quic':
            settings.quicSettings = {
                security: vmessConfig.quicSecurity || 'none',
                key: vmessConfig.quicKey || '',
                header: { type: vmessConfig.quicHeaderType || 'none' }
            };
            break;
        }

        return settings;
    }
}
