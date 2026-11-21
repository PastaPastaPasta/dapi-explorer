import type { DAPIClientInstance } from '@dashevo/dapi-client';
import { withDeadline } from './request';

export async function readCoreStatus(client: DAPIClientInstance) {
  const provider = client.dapiAddressProvider;
  let source: string | undefined;
  const status = await withDeadline(client.core.getBlockchainStatus({
    dapiAddressProvider: {
      async getLiveAddress() {
        const address = await provider.getLiveAddress();
        source = address?.toString();
        return address;
      },
      hasLiveAddresses: () => provider.hasLiveAddresses(),
    },
  }));
  return { status, source, readAt: Date.now() };
}
