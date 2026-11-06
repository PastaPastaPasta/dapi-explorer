import { HashValue } from '../../components/HashValue';
import { Card, Stat } from '../../components/Card';
import { JsonView } from '../../components/JsonView';
import { useBlockchainStatus } from '../../hooks/useBlockchainStatus';
import { formatNumber, formatPercent } from '../../lib/format';
import { coreHealth } from '../../lib/request';

export function BlockchainStatus() {
  const { data, isLoading, error, refetch } = useBlockchainStatus();
  const status = data?.status;

  // Check if response has expected structure
  const hasExpectedStructure = status?.chain?.name !== undefined;
  const health = coreHealth(status?.status);

  return (
    <Card title="Core status" loading={isLoading} error={data ? null : error} onRetry={() => void refetch()}>
      {data && error && <p className="dh-notice dh-notice--warn mb-4">Refresh failed. Showing the last successful read. <button type="button" className="dh-btn" onClick={() => void refetch()}>Retry Core status</button></p>}
      {status && !hasExpectedStructure && (
        <div>
          <p className="text-sm text-gray-500 mb-2">Raw response (unexpected format):</p>
          <JsonView data={status} />
        </div>
      )}
      {data && <div className="dh-sources mb-4" aria-label="Core response source">
        <p>Source: Core node · <HashValue value={data.source} label="Responding Core endpoint" full /></p>
        <p>Read at {new Date(data.readAt).toISOString().replace('T', ' ').slice(0, 19)} UTC · refreshed every 10 seconds{error ? ' · refresh failed' : ''}</p>
      </div>}
      {status?.status === 'ERROR' && <p className="dh-notice dh-notice--warn mb-4">The node answered but reports a local health problem. This is one node’s response, not a network-wide outage. Try refreshing its status; other lookups remain available.</p>}
      {status && hasExpectedStructure && (
        <dl className="dh-stats grid grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          <Stat label="Chain" value={status.chain?.name ?? 'N/A'} mono />
          <Stat label="Node health" value={<span className={`dh-status dh-status--${health.tone}`}>{health.label}</span>} />
          <Stat
            label="Synced"
            value={
              status.chain?.syncProgress !== undefined ? (
                <span className="text-gray-700">
                  {formatPercent(status.chain.syncProgress)}
                </span>
              ) : 'N/A'
            }
          />
          <Stat label="Block height" value={status.chain?.blocksCount !== undefined ? formatNumber(status.chain.blocksCount) : 'N/A'} />
          <Stat label="Headers" value={status.chain?.headersCount !== undefined ? formatNumber(status.chain.headersCount) : 'N/A'} />
          <Stat label="Peers" value={status.network?.peersCount ?? 'N/A'} />
          <Stat
            label="Best block hash"
            value={<HashValue value={status.chain?.bestBlockHash} label="Best block hash" />}
            mono
          />
          <Stat label="Protocol version" value={status.version?.protocol ?? 'N/A'} />
          <Stat label="Agent" value={status.version?.agent ?? 'N/A'} mono />
          <Stat label="Difficulty" value={status.chain?.difficulty !== undefined ? status.chain.difficulty.toLocaleString('en-US', { maximumSignificantDigits: 5 }) : 'N/A'} />
        </dl>
      )}
      {status && <details className="mt-4 text-sm"><summary>Raw node response</summary><JsonView data={status} /></details>}
    </Card>
  );
}
