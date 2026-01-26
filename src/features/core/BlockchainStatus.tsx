import { Card, Stat } from '../../components/Card';
import { JsonView } from '../../components/JsonView';
import { useBlockchainStatus, useBestBlockHeight, useBestBlockHash } from '../../hooks/useBlockchainStatus';
import { formatNumber, formatPercent, truncateHash } from '../../lib/format';

export function BlockchainStatus() {
  const { data: status, isLoading, error } = useBlockchainStatus();
  const { data: height } = useBestBlockHeight();
  const { data: hash } = useBestBlockHash();

  // Check if response has expected structure
  const hasExpectedStructure = status?.chain?.name !== undefined;

  return (
    <Card title="Blockchain Status" loading={isLoading} error={error}>
      {status && !hasExpectedStructure && (
        <div>
          <p className="text-sm text-gray-500 mb-2">Raw response (unexpected format):</p>
          <JsonView data={status} />
        </div>
      )}
      {status && hasExpectedStructure && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Stat label="Chain" value={status.chain?.name ?? 'N/A'} />
          <Stat label="Status" value={status.status ?? 'N/A'} />
          <Stat
            label="Sync Progress"
            value={
              status.chain?.syncProgress !== undefined ? (
                <span className={status.chain?.isSynced ? 'text-green-600' : 'text-yellow-600'}>
                  {formatPercent(status.chain.syncProgress)}
                </span>
              ) : 'N/A'
            }
          />
          <Stat label="Block Height" value={formatNumber(height ?? status.chain?.blocksCount ?? 0)} />
          <Stat label="Headers" value={formatNumber(status.chain?.headersCount ?? 0)} />
          <Stat label="Peers" value={status.network?.peersCount ?? 'N/A'} />
          <Stat
            label="Best Block Hash"
            value={truncateHash(hash ?? status.chain?.bestBlockHash ?? 'N/A')}
            mono
          />
          <Stat label="Protocol Version" value={status.version?.protocol ?? 'N/A'} />
          <Stat label="Agent" value={status.version?.agent ?? 'N/A'} />
          <Stat label="Difficulty" value={status.chain?.difficulty ? formatNumber(Math.round(status.chain.difficulty)) : 'N/A'} />
        </div>
      )}
    </Card>
  );
}
