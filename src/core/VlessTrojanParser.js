import { BaseParser } from './BaseParser.js';

/**
 * Parser for VLESS and Trojan protocol URLs
 */
export class VlessTrojanParser extends BaseParser {
    /**
     * @inheritDoc
     */
    canParse(url) {
        return url.startsWith('vless://') || url.startsWith('trojan://');
    }

    /**
     * @inheritDoc
     */
    parse(url) {
         
        const regex = /([a-z]+):\/\/([^@]+)@([^:]+):(\d+)/;
        const match = url.match(regex);

        if (!match) {
            return {
                config: null,
                warnings: [],
                success: false,
                error: 'Invalid URL format'
            };
        }

        const [, protocol, userInfo, address, portStr] = match;
        const port = parseInt(portStr, 10);
        const parsedUrl = new URL(url);
        const params = new URLSearchParams(parsedUrl.search);

        const warnings = this.generateWarnings(protocol, port);
        const tag = this.extractTag(params, parsedUrl.hash);
        const outbound = this.createOutbound(protocol, address, port, userInfo, params, tag);
        const config = this.createConfig([outbound]);

        return {
            config,
            warnings,
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
        // First try to use hash (URL title) for readability
        if (hash && hash.length > 1) {
            try {
                return decodeURIComponent(hash.substring(1));
            } catch {
                return hash.substring(1);
            }
        }

        // If no hash, use sid
        const sid = params.get('sid');
        if (sid) {
            return sid;
        }

        // Use default tag
        return 'vless-reality';
    }

    /**
     * Generate warnings for the configuration
     * @private
     * @param {string} protocol - Protocol name
     * @param {number} port - Server port
     * @returns {string[]} Array of warning messages
     */
    generateWarnings(protocol, port) {
        const warnings = [];
        if (port !== 443 && protocol !== 'ss') {
            warnings.push('⚠️ Port 443 is recommended.');
        }
        return warnings;
    }

    /**
     * Create VLESS or Trojan outbound
     * @private
     * @param {string} protocol - Protocol name
     * @param {string} address - Server address
     * @param {number} port - Server port
     * @param {string} userInfo - User information from URL
     * @param {URLSearchParams} params - URL parameters
     * @param {string} tag - Outbound tag
     * @returns {Object} Protocol outbound
     */
    createOutbound(protocol, address, port, userInfo, params, tag) {
        const baseOutbound = {
            tag,
            protocol,
            settings: {}
        };

        if (protocol === 'vless') {
            baseOutbound.settings.vnext = [
                {
                    address,
                    port,
                    users: [
                        {
                            id: userInfo,
                            flow: params.get('flow') || '',
                            encryption: 'none',
                            level: 0
                        }
                    ]
                }
            ];
        } else {
            baseOutbound.settings.servers = [
                {
                    address,
                    port,
                    password: userInfo,
                    flow: params.get('flow') || '',
                    method: 'chacha20-poly1305',
                    ota: false,
                    level: 0
                }
            ];
        }

        baseOutbound.streamSettings = this.createStreamSettings(protocol, params);

        return baseOutbound;
    }

    /**
     * Create stream settings based on parameters
     * @private
     * @param {string} protocol - Protocol name
     * @param {URLSearchParams} params - URL parameters
     * @returns {Object} Stream settings
     */
    createStreamSettings(protocol, params) {
        const security = params.get('security') || (protocol === 'trojan' ? 'tls' : '');
        const network = params.get('type') || params.get('net') || 'tcp';

        const settings = {
            network,
            security
        };

        // TLS settings
        if (security === 'tls' || protocol === 'trojan') {
            const alpn = params.get('alpn');
            const insecure = params.get('insecure') || params.get('allowInsecure');
            settings.tlsSettings = {
                alpn: alpn ? alpn.split(',') : [],
                fingerprint: params.get('fp') || '',
                serverName: params.get('sni') || '',
                allowInsecure: insecure === '1' || insecure === 'true',
                show: false
            };

            // ECH (Encrypted Client Hello) support
            const ech = params.get('ech');
            if (ech) {
                settings.tlsSettings.echConfig = ech;
            }

            // Pinned certificate SHA256
            const pcs = params.get('pcs');
            if (pcs) {
                settings.tlsSettings.pinnedPeerCertificateChainSha256 = pcs.split(',');
            }
        }

        // Reality settings
        if (security === 'reality') {
            settings.realitySettings = {
                publicKey: params.get('pbk') || '',
                fingerprint: params.get('fp') || '',
                serverName: params.get('sni') || '',
                shortId: params.get('sid') || '',
                spiderX: params.get('spx') || '/'
            };

            // Post-quantum verification
            const pqv = params.get('pqv') || params.get('mldsa65Verify');
            if (pqv) {
                settings.realitySettings.mldsa65Verify = pqv;
            }
        }

        // Transport settings
        switch (network) {
        case 'ws':
            settings.wsSettings = {
                path: params.get('path') || '',
                headers: {
                    Host: params.get('host') || ''
                }
            };
            break;
        case 'grpc':
            settings.grpcSettings = {
                serviceName: params.get('serviceName') || params.get('path') || 'grpc',
                multiMode: params.get('mode') === 'multi',
                authority: params.get('authority') || ''
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
                header: { type: params.get('headerType') || 'none' },
                seed: params.get('seed') || ''
            };
            break;
        case 'http':
        case 'h3':
            settings.httpSettings = {
                host: params.get('host') ? params.get('host').split(',') : [],
                path: params.get('path') || '/'
            };
            break;
        case 'httpupgrade':
            settings.httpupgradeSettings = {
                path: params.get('path') || '/',
                host: params.get('host') || ''
            };
            break;
        case 'xhttp':
            settings.xhttpSettings = {
                path: params.get('path') || '',
                host: params.get('host') || '',
                mode: params.get('mode') || 'auto',
                extra: params.get('xhttpExtra') || ''
            };
            break;
        case 'quic':
            settings.quicSettings = {
                security: params.get('quicSecurity') || 'none',
                key: params.get('quicKey') || '',
                header: { type: params.get('quicHeaderType') || 'none' }
            };
            break;
        }

        return settings;
    }
}
