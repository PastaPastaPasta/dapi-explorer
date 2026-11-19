declare module '@dashevo/dapi-client' {
  interface BlockchainStatus {
    version: {
      protocol: number;
      software: number;
      agent: string;
    };
    time: {
      now: number;
      offset: number;
      median: number;
    };
    status: string;
    syncProgress: number;
    chain: {
      name: string;
      headersCount: number;
      blocksCount: number;
      bestBlockHash: string;
      difficulty: number;
      chainWork: string;
      isSynced: boolean;
      syncProgress: number;
    };
    network: {
      peersCount: number;
      fee: {
        relay: number;
        incremental: number;
      };
    };
  }

  interface Transaction {
    transaction: Uint8Array;
    blockHash: Uint8Array;
    height: number;
    confirmations: number;
    isInstantLocked: boolean;
    isChainLocked: boolean;
  }

  interface MasternodeStatus {
    status: string;
    proTxHash: Uint8Array;
    posePenalty: number;
    isSynced: boolean;
    syncProgress: number;
  }

  interface PlatformStatus {
    version: {
      software: {
        dapi: string;
        drive: string;
        tenderdash: string;
      };
      protocol: {
        tenderdash: {
          p2p: number;
          block: number;
        };
        drive: {
          latest: number;
          current: number;
        };
      };
    };
    node: {
      id: string;
      proTxHash: string;
    };
    chain: {
      catchingUp: boolean;
      latestBlockHash: string;
      latestAppHash: string;
      latestBlockHeight: string;
      earliestBlockHash: string;
      earliestAppHash: string;
      earliestBlockHeight: string;
      maxPeerBlockHeight: string;
      coreChainLockedHeight: number;
    };
    network: {
      chainId: string;
      peersCount: number;
      listening: boolean;
    };
    time: {
      local: string;
      block: string;
      genesis: string;
      epoch: number;
    };
  }

  interface EpochInfo {
    number: number;
    firstBlockHeight: bigint;
    firstCoreBlockHeight: number;
    startTime: bigint;
    feeMultiplier: number;
  }

  interface ConsensusParams {
    block: {
      maxBytes: string;
      maxGas: string;
    };
    evidence: {
      maxAgeNumBlocks: string;
      maxAgeDuration: string;
      maxBytes: string;
    };
  }

  interface BlockHeadersResponse {
    getBlockHeaders(): { getHeadersList_asU8(): Uint8Array[] } | undefined;
    getChainLock_asU8(): Uint8Array;
  }

  interface BlockHeadersStream {
    on(event: 'data', listener: (response: BlockHeadersResponse) => void): void;
    on(event: 'error', listener: (error: Error) => void): void;
    on(event: 'end', listener: () => void): void;
    cancel(): void;
  }

  interface DAPIClientInstance {
    core: {
      getBlockchainStatus(): Promise<BlockchainStatus>;
      getBestBlockHeight(): Promise<number>;
      getBestBlockHash(): Promise<string>;
      getBlockByHeight(height: number): Promise<Uint8Array>;
      getBlockByHash(hash: string): Promise<Uint8Array>;
      getBlockHash(height: number): Promise<string>;
      getTransaction(txid: string): Promise<Transaction>;
      getMasternodeStatus(): Promise<MasternodeStatus>;
      subscribeToBlockHeadersWithChainLocks(opts?: {
        fromBlockHeight?: number;
        count?: number;
      }): Promise<BlockHeadersStream>;
    };
    platform: {
      getStatus(): Promise<PlatformStatus>;
      getIdentity(id: Uint8Array): Promise<unknown>;
      getIdentityBalance(id: Uint8Array): Promise<{ balance: bigint }>;
      getIdentityKeys(id: Uint8Array, opts?: unknown): Promise<unknown>;
      getDataContract(id: Uint8Array): Promise<unknown>;
      getDataContractHistory(id: Uint8Array, opts?: unknown): Promise<unknown>;
      getDocuments(contractId: Uint8Array, type: string, opts?: unknown): Promise<unknown>;
      getConsensusParams(height?: number): Promise<ConsensusParams>;
      getEpochsInfo(start: number, count: number): Promise<{ epochsInfo: EpochInfo[] }>;
      getTotalCreditsInPlatform(): Promise<{ totalCreditsInPlatform: bigint }>;
      getProtocolVersionUpgradeState(): Promise<unknown>;
    };
    disconnect(): Promise<void>;
  }

  interface DAPIClientOptions {
    network?: 'mainnet' | 'testnet';
    dapiAddresses?: string[];
    dapiAddressProvider?: unknown;
    timeout?: number;
    retries?: number;
  }

  class DAPIClient implements DAPIClientInstance {
    constructor(options?: DAPIClientOptions);
    core: DAPIClientInstance['core'];
    platform: DAPIClientInstance['platform'];
    disconnect(): Promise<void>;
  }

  export default DAPIClient;
  export {
    BlockchainStatus,
    Transaction,
    MasternodeStatus,
    PlatformStatus,
    EpochInfo,
    ConsensusParams,
    DAPIClientInstance,
    DAPIClientOptions,
    BlockHeadersStream,
  };
}

declare module '@dashevo/dapi-client/lib/dapiAddressProvider/DAPIAddress.js' {
  export default class DAPIAddress {
    constructor(address: string);
    toString(): string;
  }
}

declare module '@dashevo/dapi-client/lib/dapiAddressProvider/ListDAPIAddressProvider.js' {
  import type DAPIAddress from '@dashevo/dapi-client/lib/dapiAddressProvider/DAPIAddress.js';
  export default class ListDAPIAddressProvider {
    constructor(addresses: DAPIAddress[], options?: { network?: string; baseBanTime?: number });
    getLiveAddress(): Promise<DAPIAddress | undefined>;
    hasLiveAddresses(): Promise<boolean>;
    getAllAddresses(): DAPIAddress[];
    setAddresses(addresses: DAPIAddress[]): this;
  }
}
