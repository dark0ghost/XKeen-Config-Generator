import { BaseParser } from './BaseParser.js';

/**
 * Parser for VMess protocol URLs
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
        try {
            const base64Payload = url.substring(8);
            const decodedPayload = atob(base64Payload);
            const vmessConfig = JSON.parse(decodedPayload);

            const outbound = this.createVmessOutbound(vmessConfig);
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
                error: 'Ошибка разбора VMess ссылки'
            };
        }
    }

    /**
     * Create VMess outbound from parsed config
     * @private
     * @param {Object} vmessConfig - Parsed VMess configuration
     * @returns {Object} VMess outbound
     */
    createVmessOutbound(vmessConfig) {
        return {
            tag: 'vless-reality',
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
            settings.tlsSettings = {
                allowInsecure: true,
                serverName: vmessConfig.sni || '',
                fingerprint: vmessConfig.fp || ''
            };
        }

        switch (vmessConfig.net) {
            case 'ws':
                settings.wsSettings = {
                    path: vmessConfig.path || '',
                    host: vmessConfig.host || ''
                };
                break;
            case 'h2':
                settings.httpSettings = {
                    host: vmessConfig.host ? vmessConfig.host.split(',') : [],
                    path: vmessConfig.path || ''
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
                    header: { type: vmessConfig.type || 'none' }
                };
                break;
        }

        return settings;
    }
}
