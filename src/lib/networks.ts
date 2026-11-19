export type NetworkType = 'mainnet' | 'testnet';

export interface NetworkConfig {
  network: NetworkType;
  label: string;
  description: string;
  masternodeListUrl: string;
  fallbackAddresses: string[];
}

export const networks: Record<NetworkType, NetworkConfig> = {
  mainnet: {
    network: 'mainnet',
    label: 'Mainnet',
    description: 'Dash production network',
    masternodeListUrl: 'https://quorums.mainnet.networks.dash.org/masternodes',
    fallbackAddresses: [
      '89.125.209.120:443',
      '75.119.153.10:443',
      '155.138.159.73:443',
      '31.220.91.43:443',
      '132.243.197.18:443',
    ],
  },
  testnet: {
    network: 'testnet',
    label: 'Testnet',
    description: 'Dash test network',
    masternodeListUrl: 'https://quorums.testnet.networks.dash.org/masternodes',
    fallbackAddresses: [
      'seed-1.testnet.networks.dash.org:1443',
      'seed-2.testnet.networks.dash.org:1443',
      'seed-3.testnet.networks.dash.org:1443',
      'seed-4.testnet.networks.dash.org:1443',
      'seed-5.testnet.networks.dash.org:1443',
    ],
  },
};

export const defaultNetwork: NetworkType = 'testnet';
