import { useQuery } from '@tanstack/react-query';
import { useDapi } from './useDapi';
import { useNetworkStore } from '../store/network';

export function usePlatformStatus() {
  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  return useQuery({
    queryKey: ['platformStatus', network],
    queryFn: () => client.platform.getStatus(),
    refetchInterval: 15000,
  });
}

export function useEpochsInfo(start = 0, count = 5) {
  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  return useQuery({
    queryKey: ['epochsInfo', network, start, count],
    queryFn: () => client.platform.getEpochsInfo(start, count),
  });
}

export function useTotalCredits() {
  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  return useQuery({
    queryKey: ['totalCredits', network],
    queryFn: () => client.platform.getTotalCreditsInPlatform(),
    refetchInterval: 30000,
  });
}

export function useConsensusParams() {
  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  return useQuery({
    queryKey: ['consensusParams', network],
    queryFn: () => client.platform.getConsensusParams(),
  });
}
