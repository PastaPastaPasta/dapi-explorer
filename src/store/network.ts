import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NetworkType } from '../lib/networks';
import { defaultNetwork } from '../lib/networks';
import { disconnectClient } from '../lib/dapi';

interface NetworkState {
  network: NetworkType;
  setNetwork: (network: NetworkType) => void;
}

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set) => ({
      network: defaultNetwork,
      setNetwork: (network) => {
        disconnectClient();
        set({ network });
      },
    }),
    {
      name: 'dapi-explorer-network',
    }
  )
);
