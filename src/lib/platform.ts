import type { NetworkType } from './networks';
import { createPlatformReader, type PlatformReader } from './platformReader';
import { withDeadline } from './request';

const sessions = new Map<NetworkType, Promise<PlatformReader>>();

export async function platformRead<T>(network: NetworkType, read: (reader: PlatformReader) => Promise<T>, timeoutMs = 18000): Promise<T> {
  let session = sessions.get(network);
  if (!session) {
    session = createPlatformReader(network);
    sessions.set(network, session);
  }
  try {
    return await withDeadline(session.then(read), timeoutMs);
  } catch (error) {
    if (sessions.get(network) === session) sessions.delete(network);
    throw error;
  }
}
