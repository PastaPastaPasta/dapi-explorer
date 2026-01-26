import { useQuery } from '@tanstack/react-query';
import { useDapi } from './useDapi';
import { useNetworkStore } from '../store/network';

export function useBlockchainStatus() {
  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  return useQuery({
    queryKey: ['blockchainStatus', network],
    queryFn: () => client.core.getBlockchainStatus(),
    refetchInterval: 10000,
  });
}

export function useBestBlockHeight() {
  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  return useQuery({
    queryKey: ['bestBlockHeight', network],
    queryFn: () => client.core.getBestBlockHeight(),
    refetchInterval: 10000,
  });
}

export function useBestBlockHash() {
  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  return useQuery({
    queryKey: ['bestBlockHash', network],
    queryFn: () => client.core.getBestBlockHash(),
    refetchInterval: 10000,
  });
}
