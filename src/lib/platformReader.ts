import DAPIClient, { type DAPIClientInstance, type EpochInfo, type PlatformStatus } from '@dashevo/dapi-client';
import loadDpp, { type DashPlatformProtocol } from '@dashevo/wasm-dpp';
import { v0 } from '@dashevo/dapi-grpc';
import { DiscoveringAddressProvider } from './addressProvider';
import type { NetworkType } from './networks';

export interface PlatformReader {
  status(): Promise<PlatformStatus>;
  currentEpoch(): Promise<number>;
  epochs(start: number, count: number): Promise<EpochInfo[]>;
  totalCredits(): Promise<bigint>;
  identity(id: Uint8Array): Promise<Record<string, unknown> | null>;
  identityBalance(id: Uint8Array): Promise<bigint>;
  contract(id: Uint8Array): Promise<Record<string, unknown> | null>;
}

const promiseClient = v0.PlatformPromiseClient.prototype;
for (const method of ['getIdentityBalance', 'getTotalCreditsInPlatform'] as const) {
  promiseClient[method] ??= function (this: typeof promiseClient, request: unknown, metadata = {}) {
    return new Promise((resolve, reject) => {
      this.client[method](request, metadata, (error: Error | null, response: unknown) => (error ? reject(error) : resolve(response)));
    });
  };
}

let protocol: Promise<DashPlatformProtocol> | undefined;

function decoder() {
  protocol ??= loadDpp()
    .then((dpp) => new dpp.DashPlatformProtocol(
      { generate: () => crypto.getRandomValues(new Uint8Array(32)) },
      dpp.getLatestProtocolVersion(),
    ))
    .catch((error) => {
      protocol = undefined;
      throw error;
    });
  return protocol;
}

async function unlessNotFound<T>(read: Promise<T>): Promise<T | null> {
  try {
    return await read;
  } catch (error) {
    if ((error as { code?: number })?.code === 5) return null;
    throw error;
  }
}

export async function createPlatformReader(network: NetworkType): Promise<PlatformReader> {
  const provider = new DiscoveringAddressProvider(network);
  await provider.ready;
  const client = new DAPIClient({ network, dapiAddressProvider: provider, timeout: 5000, retries: 2 }) as DAPIClientInstance;
  const { platform } = client;
  return {
    status: () => platform.getStatus(),
    async currentEpoch() {
      const epoch = (await platform.getStatus()).time.epoch;
      if (epoch === undefined) throw new Error('This node did not report its current epoch. Retry to discover another node.');
      return epoch;
    },
    async epochs(start, count) {
      const response = await platform.getEpochsInfo(start, count, { ascending: false });
      return [...response.getEpochsInfo()].sort((a, b) => b.number - a.number);
    },
    async totalCredits() {
      return (await platform.getTotalCreditsInPlatform()).getTotalCreditsInPlatform();
    },
    async identity(id) {
      const response = await unlessNotFound(platform.getIdentity(id));
      const bytes = response?.getIdentity();
      if (!bytes?.length) return null;
      return (await decoder()).identity.createFromBuffer(bytes).toJSON();
    },
    async identityBalance(id) {
      return (await platform.getIdentityBalance(id)).getBalance();
    },
    async contract(id) {
      const response = await unlessNotFound(platform.getDataContract(id));
      const bytes = response?.getDataContract();
      if (!bytes?.length) return null;
      return (await (await decoder()).dataContract.createFromBuffer(bytes, { skipValidation: true })).toJSON();
    },
  };
}
