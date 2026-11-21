import { useQuery } from '@tanstack/react-query';
import { useDapi } from './useDapi';
import { useNetworkStore } from '../store/network';
import { platformRead } from '../lib/platform';
import { withDeadline } from '../lib/request';

export function usePlatformStatus() {
  const network = useNetworkStore((s) => s.network);

  return useQuery({
    queryKey: ['platformStatus', network],
    queryFn: () => platformRead(network, (reader) => reader.status()),
    refetchInterval: 15000,
  });
}

export function useCurrentEpoch() {
  const network = useNetworkStore((s) => s.network);
  return useQuery({
    queryKey: ['currentEpoch', network],
    queryFn: () => platformRead(network, (reader) => reader.currentEpoch()),
    refetchInterval: (query) => query.state.status === 'error' ? false : 15000,
  });
}

export function useEpochsInfo(start: number | undefined, count = 10) {
  const network = useNetworkStore((s) => s.network);

  return useQuery({
    queryKey: ['epochsInfo', network, start, count],
    enabled: start !== undefined,
    queryFn: () => platformRead(network, async (reader) => ({ epochsInfo: await reader.epochs(start!, count) })),
  });
}

export function useTotalCredits() {
  const network = useNetworkStore((s) => s.network);

  return useQuery({
    queryKey: ['totalCredits', network],
    queryFn: () => platformRead(network, async (reader) => ({ totalCreditsInPlatform: await reader.totalCredits() })),
    refetchInterval: 30000,
  });
}

export function useConsensusParams(enabled = true) {
  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  return useQuery({
    queryKey: ['consensusParams', network],
    enabled,
    queryFn: () => withDeadline(client.platform.getConsensusParams()),
  });
}
