import { useQuery } from '@tanstack/react-query';
import { withDeadline } from '../lib/request';
import { useDapi } from './useDapi';
import { useNetworkStore } from '../store/network';
import { readCoreStatus } from '../lib/core-status';

export function useBlockchainStatus() {
  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  return useQuery({
    queryKey: ['blockchainStatus', network],
    queryFn: () => readCoreStatus(client),
    refetchInterval: 10000,
  });
}

export function useBestBlockHeight() {
  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  return useQuery({
    queryKey: ['bestBlockHeight', network],
    queryFn: () => withDeadline(client.core.getBestBlockHeight()),
    refetchInterval: 10000,
  });
}

export function useBestBlockHash() {
  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  return useQuery({
    queryKey: ['bestBlockHash', network],
    queryFn: () => withDeadline(client.core.getBestBlockHash()),
    refetchInterval: 10000,
  });
}
