import DAPIClient, { type DAPIClientInstance } from '@dashevo/dapi-client';
import { networks, type NetworkType } from './networks';

let clientInstance: DAPIClientInstance | null = null;
let currentNetwork: NetworkType | null = null;

export function getClient(network: NetworkType): DAPIClientInstance {
  if (clientInstance && currentNetwork === network) {
    return clientInstance;
  }

  if (clientInstance) {
    clientInstance.disconnect().catch(console.error);
  }

  clientInstance = new DAPIClient({
    network,
    dapiAddresses: networks[network].dapiAddresses,
    timeout: 5000,
    retries: 1,
  }) as DAPIClientInstance;
  currentNetwork = network;

  return clientInstance;
}

export function disconnectClient(): void {
  if (clientInstance) {
    clientInstance.disconnect().catch(console.error);
    clientInstance = null;
    currentNetwork = null;
  }
}

export { hexToBytes, bytesToHex, hexToBase58 } from './identifier';
