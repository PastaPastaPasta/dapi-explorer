import DAPIAddress from '@dashevo/dapi-client/lib/dapiAddressProvider/DAPIAddress.js';
import ListDAPIAddressProvider from '@dashevo/dapi-client/lib/dapiAddressProvider/ListDAPIAddressProvider.js';
import { discoverEvonodes } from './discovery.ts';
import { networks, type NetworkType } from './networks.ts';

export class DiscoveringAddressProvider extends ListDAPIAddressProvider {
  readonly ready: Promise<void>;

  constructor(network: NetworkType) {
    super(networks[network].fallbackAddresses.map((a) => new DAPIAddress(a)), { network });
    this.ready = discoverEvonodes(network)
      .then((found) => {
        if (found.length > 0) this.setAddresses(found.map((a) => new DAPIAddress(a)));
      })
      .catch((error) => console.warn(`Evonode discovery failed for ${network}, using fallback nodes`, error));
  }

  async getLiveAddress() {
    await this.ready;
    return super.getLiveAddress();
  }

  async hasLiveAddresses() {
    await this.ready;
    return super.hasLiveAddresses();
  }
}
