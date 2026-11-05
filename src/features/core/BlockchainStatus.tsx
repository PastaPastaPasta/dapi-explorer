import { Card, Stat } from '../../components/Card';
import { JsonView } from '../../components/JsonView';
import { useBlockchainStatus, useBestBlockHeight, useBestBlockHash } from '../../hooks/useBlockchainStatus';
import { formatNumber, formatPercent } from '../../lib/format';

export function BlockchainStatus() {
  const { data: status, isLoading, error } = useBlockchainStatus();
  const { data: height } = useBestBlockHeight();
  const { data: hash } = useBestBlockHash();

  // Check if response has expected structure
  const hasExpectedStructure = status?.chain?.name !== undefined;

  return (
    <Card title="Core status" loading={isLoading} error={error}>
      {status && !hasExpectedStructure && (
        <div>
          <p className="text-sm text-gray-500 mb-2">Raw response (unexpected format):</p>
          <JsonView data={status} />
        </div>
      )}
      {status && <p className="text-xs text-gray-500 mb-4">Reported by a Core node; refreshed every 10 seconds.</p>}
      {status?.status === 'ERROR' && <p className="text-sm text-yellow-600 mb-4">The node answered, but reports a health error. Sync progress alone does not indicate node health.</p>}
      {status && hasExpectedStructure && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Stat label="Chain" value={status.chain?.name ?? 'N/A'} />
          <Stat label="Node response" value={<span className="text-green-600">Reachable</span>} />
          <Stat
            label="Synced"
            value={
              status.chain?.syncProgress !== undefined ? (
                <span className={status.chain.syncProgress >= 1 ? 'text-green-600' : 'text-yellow-600'}>
                  {formatPercent(status.chain.syncProgress)}
                </span>
              ) : 'N/A'
            }
          />
          <Stat label="Block height" value={formatNumber(height ?? status.chain?.blocksCount ?? 0)} />
          <Stat label="Headers" value={formatNumber(status.chain?.headersCount ?? 0)} />
          <Stat label="Peers" value={status.network?.peersCount ?? 'N/A'} />
          <Stat
            label="Best block hash"
            value={<dashhq-hash value={hash ?? status.chain?.bestBlockHash ?? ''} label="Best block hash" />}
            mono
          />
          <Stat label="Protocol version" value={status.version?.protocol ?? 'N/A'} />
          <Stat label="Agent" value={status.version?.agent ?? 'N/A'} />
          <Stat label="Difficulty" value={status.chain?.difficulty ? formatNumber(Math.round(status.chain.difficulty)) : 'N/A'} />
        </div>
      )}
      {status && <details className="mt-4 text-sm"><summary>Raw node response</summary><JsonView data={status} /></details>}
    </Card>
  );
}
