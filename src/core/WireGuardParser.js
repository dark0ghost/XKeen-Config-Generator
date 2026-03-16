import { BaseParser } from './BaseParser.js';

/**
 * Parser for WireGuard protocol URLs
 * Based on v2rayNG WireGuardFmt.kt specification
 * Format: wireguard://privatekey@server:port?address=172.16.0.2%2F32&publickey=serverpublickey&presharedkey=psk&mtu=1420&reserved=0,0,0#Remarks
 */
export class WireGuardParser extends BaseParser {
    /**
     * @inheritDoc
     */
    canParse(url) {
        return url.startsWith('wireguard://');
    }

    /**
     * @inheritDoc
     */
    parse(url) {
        try {
            const parsedUrl = new URL(url);
            const params = new URLSearchParams(parsedUrl.search);

            const address = parsedUrl.hostname;
            const port = parseInt(parsedUrl.port, 10) || 51820;
            const secretKey = parsedUrl.username;

            const tag = this.extractTag(params, parsedUrl.hash);
            const outbound = this.createWireGuardOutbound(address, port, secretKey, params, tag);
            const config = this.createConfig([outbound]);

            return {
                config,
                warnings: [],
                success: true,
                error: null
            };
        } catch (error) {
            console.error('Error parsing WireGuard URL:', error);
            return {
                config: null,
                warnings: [],
                success: false,
                error: 'Failed to parse WireGuard URL'
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
        if (hash && hash.length > 1) {
            try {
                return decodeURIComponent(hash.substring(1));
            } catch {
                return hash.substring(1);
            }
        }

        const remarks = params.get('remarks');
        if (remarks) {
            return remarks;
        }

        return 'wireguard';
    }

    /**
     * Create WireGuard outbound
     * @private
     * @param {string} address - Server address
     * @param {number} port - Server port
     * @param {string} secretKey - Private key (base64-encoded)
     * @param {URLSearchParams} params - URL parameters
     * @param {string} tag - Outbound tag
     * @returns {Object} WireGuard outbound
     */
    createWireGuardOutbound(address, port, secretKey, params, tag) {
        // Get parameters
        const localAddress = params.get('address') || '172.16.0.2/32';
        const publicKey = params.get('publickey') || '';
        const preSharedKey = params.get('presharedkey') || '';
        const mtu = parseInt(params.get('mtu') || '1420', 10);
        const reserved = params.get('reserved') || '';

        // Parse reserved as array of numbers
        let reservedArray = [];
        if (reserved) {
            reservedArray = reserved.split(',').map(r => parseInt(r.trim(), 10));
        }

        const streamSettings = {
            network: 'tcp',
            security: 'none'
        };

        const wireGuardSettings = {
            secretKey,
            address: [localAddress],
            peers: [
                {
                    publicKey,
                    endpoint: `${address}:${port}`,
                    keepAlive: 10
                }
            ],
            mtu,
            reserved: reservedArray.length > 0 ? reservedArray : undefined
        };

        // Add presharedKey if exists
        if (preSharedKey) {
            wireGuardSettings.peers[0].preSharedKey = preSharedKey;
        }

        return {
            tag,
            protocol: 'wireguard',
            settings: wireGuardSettings,
            streamSettings
        };
    }
}
