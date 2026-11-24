import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBlockchainStatus } from '../../hooks/useBlockchainStatus';
import { usePlatformStatus } from '../../hooks/usePlatformStatus';
import { useDapi } from '../../hooks/useDapi';
import { useNetworkStore } from '../../store/network';
import { blockTimestamp, blockFreshness, headerTimestamp } from '../../lib/block-freshness';
import { withDeadline } from '../../lib/request';
import { formatNumber, formatRelativeTime } from '../../lib/format';

export function StatusTiles() {
  const core = useBlockchainStatus();
  const platform = usePlatformStatus();
  const client = useDapi();
  const network = useNetworkStore(s => s.network);
  const height = core.data?.status.chain?.blocksCount;
  const block = useQuery({
    queryKey: ['coreTipTime', network, height],
    enabled: height !== undefined,
    placeholderData: (previous, previousQuery) => previousQuery?.queryKey[1] === network ? previous : undefined,
    queryFn: async () => headerTimestamp(await withDeadline(client.core.getBlockByHeight(height!))) * 1000,
  });
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const tiles = [
    { label: 'Core', height, timestamp: block.data ?? null, target: 150, loading: core.isLoading || block.isLoading, failed: (!!core.error && !core.data) || (!!block.error && !block.data) },
    { label: 'Platform', height: platform.data?.chain?.latestBlockHeight, timestamp: blockTimestamp(platform.data?.time?.block), target: 180, loading: platform.isLoading, failed: !!platform.error && !platform.data },
  ];
  return (
    <dl className="console-status-tiles">
      {tiles.map(tile => {
        const state = blockFreshness(tile.timestamp, tile.target, now, tile.failed);
        return (
          <div key={tile.label} className={`dh-stat block-status block-status--${state}`}>
            <dt className="dh-stat__label">{tile.label}</dt>
            <dd className="dh-stat__value">{tile.height != null ? formatNumber(String(tile.height)) : '—'}</dd>
            <dd className="block-status__age">{tile.loading ? 'Reading last block…' : tile.failed ? 'Read failed' : tile.timestamp === null ? 'Block time not reported' : tile.timestamp > now ? 'Block time is ahead' : `Last block ${formatRelativeTime(tile.timestamp / 1000)}`}</dd>
            <dd className="block-status__target dh-meta"><span className="block-status__state">{state === 'good' ? 'On time' : state === 'warn' ? 'Late' : 'Unknown'}</span><span>{state === 'good' ? `within 2× target (${tile.target * 2}s)` : state === 'warn' ? `over 2× target (${tile.target * 2}s)` : `2× target is ${tile.target * 2}s`}</span></dd>
          </div>
        );
      })}
    </dl>
  );
}
