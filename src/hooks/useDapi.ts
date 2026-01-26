import { useMemo } from 'react';
import { getClient } from '../lib/dapi';
import { useNetworkStore } from '../store/network';

export function useDapi() {
  const network = useNetworkStore((s) => s.network);
  const client = useMemo(() => getClient(network), [network]);
  return client;
}
