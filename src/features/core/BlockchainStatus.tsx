import { HashValue } from "../../components/HashValue";
import { Card } from "../../components/Card";
import { JsonView } from "../../components/JsonView";
import { useBlockchainStatus } from "../../hooks/useBlockchainStatus";
import { formatNumber, formatPercent } from "../../lib/format";
import { Freshness } from "../../components/Freshness";
import { useNetworkStore } from "../../store/network";
import { coreVerdict } from "../../lib/request";

export function BlockchainStatus() {
  const { data, isLoading, error, refetch } = useBlockchainStatus();
  const status = data?.status;

  // Check if response has expected structure
  const hasExpectedStructure = status?.chain?.name !== undefined;

  return (
    <Card
      title="Core status" method="getBlockchainStatus"
      loading={isLoading}
      error={error}
      hasData={!!data}
      onRetry={() => void refetch()}
    >
      {status && !hasExpectedStructure && (
        <div>
          <p className="text-sm text-gray-500 mb-2">
            Raw response (unexpected format):
          </p>
          <JsonView data={status} />
        </div>
      )}
      {status && hasExpectedStructure && (
        <>
          <p
            className={`node-verdict ${status.status === "ERROR" ? "node-verdict--warn" : ""}`}
          >
            {coreVerdict(status.status, status.chain?.syncProgress)}
          </p>
          {data && (
            <div className="dh-sources mb-4" aria-label="Core response source">
              <p className="dh-meta">
                <span>Source: Core node</span>
                <HashValue
                  value={data.source}
                  label="Responding Core endpoint"
                  full
                />
              </p>
              <p className="dh-meta">
                <span className="read-age">Read <Freshness value={data.readAt} /></span><span>Refreshes every 10 seconds</span>{error && <span>Refresh failed</span>}
              </p>
            </div>
          )}
          <dl className="node-facts">
            <div>
              <dt>Chain</dt>
              <dd>{status.chain?.name ?? "Not reported"}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{status.status ?? "Not reported"}</dd>
            </div>
            <div>
              <dt>Sync progress</dt>
              <dd>
                {status.chain?.syncProgress !== undefined
                  ? formatPercent(status.chain.syncProgress)
                  : "Not reported"}
              </dd>
            </div>
            <div>
              <dt>Block height</dt>
              <dd>
                {status.chain?.blocksCount !== undefined
                  ? formatNumber(status.chain.blocksCount)
                  : "Not reported"}
              </dd>
            </div>
            <div>
              <dt>Headers</dt>
              <dd>
                {status.chain?.headersCount !== undefined
                  ? formatNumber(status.chain.headersCount)
                  : "Not reported"}
              </dd>
            </div>
            <div>
              <dt>Peers</dt>
              <dd>{status.network?.peersCount ?? "Not reported"}</dd>
            </div>
            <div>
              <dt>Protocol version</dt>
              <dd>{status.version?.protocol ?? "Not reported"}</dd>
            </div>
            <div>
              <dt>Difficulty</dt>
              <dd>
                {status.chain?.difficulty !== undefined
                  ? status.chain.difficulty.toLocaleString("en-US", {
                      maximumSignificantDigits: 5,
                    })
                  : "Not reported"}
              </dd>
            </div>
            <div>
              <dt>Agent</dt>
              <dd>{status.version?.agent ?? "Not reported"}</dd>
            </div>
            <div>
              <dt>Best block hash</dt>
              <dd>
                <HashValue
                  value={status.chain?.bestBlockHash}
                  label="Best block hash"
                />
              </dd>
            </div>
          </dl>
        </>
      )}
      {status && (
        <JsonView data={status} label="Raw node response · Details" />
      )}
    </Card>
  );
}

export function CoreSummary() {
  const { data, isLoading, error, refetch } = useBlockchainStatus();
  const network = useNetworkStore((s) => s.network);
  return (
    <p className="dh-meta core-summary" aria-label="Core status summary">
      <span>{isLoading ? 'Reading Core status…' : `Core: node reports ${data?.status?.status ?? 'no health status'}`}</span>
      <span>Height {data?.status?.chain?.blocksCount != null ? formatNumber(data.status.chain.blocksCount) : 'not reported'}</span>
      <span>Source: {data?.source ?? 'no response yet'}</span>
      {data && <span className="read-age">Read <Freshness value={data.readAt} /></span>}
      {error && <span>Read failed{data ? '; showing the last successful read' : ''}. <button className="dh-btn dh-btn--sm" onClick={() => void refetch()}>Retry Core status</button></span>}
      <a href={window.dashhq.href('dapi', '/?tab=dashboard', { network })}>Details on Dashboard →</a>
    </p>
  );
}
