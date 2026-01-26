export type NetworkType = 'mainnet' | 'testnet';

export interface NetworkConfig {
  network: NetworkType;
  label: string;
  description: string;
}

export const networks: Record<NetworkType, NetworkConfig> = {
  mainnet: {
    network: 'mainnet',
    label: 'Mainnet',
    description: 'Dash production network',
  },
  testnet: {
    network: 'testnet',
    label: 'Testnet',
    description: 'Dash test network',
  },
};

export const defaultNetwork: NetworkType = 'testnet';
