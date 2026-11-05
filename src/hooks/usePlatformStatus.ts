import { useQuery } from '@tanstack/react-query';
import { useDapi } from './useDapi';
import { useNetworkStore } from '../store/network';
import { platformRead } from '../lib/platform';
import { withDeadline } from '../lib/request';

export function usePlatformStatus() {
  const network = useNetworkStore((s) => s.network);

  return useQuery({
    queryKey: ['platformStatus', network],
    queryFn: () => platformRead(network, (sdk) => sdk.system.status()),
    refetchInterval: 15000,
  });
}

export function useEpochsInfo(start = 0, count = 5) {
  const network = useNetworkStore((s) => s.network);

  return useQuery({
    queryKey: ['epochsInfo', network, start, count],
    queryFn: () => platformRead(network, async (sdk) => {
      const epochs = await sdk.epoch.epochsInfo({ startEpoch: start, count, ascending: true });
      return { epochsInfo: [...epochs.values()].filter((epoch) => epoch !== undefined) };
    }),
  });
}

export function useTotalCredits() {
  const network = useNetworkStore((s) => s.network);

  return useQuery({
    queryKey: ['totalCredits', network],
    queryFn: () => platformRead(network, async (sdk) => ({ totalCreditsInPlatform: await sdk.system.totalCreditsInPlatform() })),
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
