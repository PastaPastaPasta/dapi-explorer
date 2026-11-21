import { create } from 'zustand';
import type { NetworkType } from '../lib/networks';
import { disconnectClient } from '../lib/dapi';
import { updateUrl } from '../lib/location';

const fromUrl = (): NetworkType => new URLSearchParams(window.location.search).get('network') === 'testnet' ? 'testnet' : 'mainnet';

export const useNetworkStore = create<{ network: NetworkType; setNetwork: (network: NetworkType) => void }>(() => ({
  network: fromUrl(),
  setNetwork: (network) => updateUrl({ network }),
}));

window.addEventListener('popstate', () => {
  const network = fromUrl();
  if (useNetworkStore.getState().network !== network) {
    disconnectClient();
    useNetworkStore.setState({ network });
  }
});
