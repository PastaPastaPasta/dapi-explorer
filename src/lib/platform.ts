import { EvoSDK } from '@dashevo/evo-sdk';
import type { NetworkType } from './networks';
import { withDeadline } from './request';

const sessions = new Map<NetworkType, Promise<EvoSDK>>();

export async function platformRead<T>(network: NetworkType, read: (sdk: EvoSDK) => Promise<T>): Promise<T> {
  let session = sessions.get(network);
  if (!session) {
    const sdk = new EvoSDK({
      network,
      trusted: true,
      settings: { connectTimeoutMs: 4000, timeoutMs: 5000, retries: 1 },
    });
    session = sdk.connect().then(() => sdk);
    sessions.set(network, session);
  }
  try {
    return await withDeadline(session.then(read));
  } catch (error) {
    if (sessions.get(network) === session) sessions.delete(network);
    throw error;
  }
}
