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
    timeout: 30000,
    retries: 3,
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

export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (!/^[0-9a-fA-F]{64}$/.test(cleanHex)) throw new Error('Use a 32-byte ID: 64 hexadecimal characters.');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBase58(hex: string): string {
  const bytes = hexToBytes(hex);
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let value = BigInt('0x' + bytesToHex(bytes));
  let result = '';
  while (value > 0n) {
    result = alphabet[Number(value % 58n)] + result;
    value /= 58n;
  }
  for (const byte of bytes) {
    if (byte !== 0) break;
    result = '1' + result;
  }
  return result;
}
