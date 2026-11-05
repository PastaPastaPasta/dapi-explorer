export type NetworkType = 'mainnet' | 'testnet';

export interface NetworkConfig {
  network: NetworkType;
  label: string;
  description: string;
  dapiAddresses: string[];
}

export const networks: Record<NetworkType, NetworkConfig> = {
  mainnet: {
    network: 'mainnet',
    label: 'Mainnet',
    description: 'Dash production network',
    // Browser TLS validates DAPI certificates against node IPs, not seed aliases.
    // These healthy Evo nodes are sourced from quorums.mainnet.networks.dash.org.
    dapiAddresses: [
      '75.119.153.10',
      '155.138.159.73',
      '31.220.91.43',
      '89.125.209.120',
      '103.214.68.131',
      '132.243.197.18',
      '178.18.254.136',
      '172.236.244.81',
      '161.97.70.66',
      '109.199.109.39',
    ],
  },
  testnet: {
    network: 'testnet',
    label: 'Testnet',
    description: 'Dash test network',
    dapiAddresses: [
      'seed-1.testnet.networks.dash.org:1443',
      'seed-2.testnet.networks.dash.org:1443',
      'seed-3.testnet.networks.dash.org:1443',
      'seed-4.testnet.networks.dash.org:1443',
      'seed-5.testnet.networks.dash.org:1443',
    ],
  },
};

export const defaultNetwork: NetworkType = 'mainnet';
