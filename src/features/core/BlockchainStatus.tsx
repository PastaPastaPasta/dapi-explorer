import { HashValue } from "../../components/HashValue";
import { Card, Stat } from "../../components/Card";
import { JsonView } from "../../components/JsonView";
import { useBlockchainStatus } from "../../hooks/useBlockchainStatus";
import { formatNumber, formatPercent } from "../../lib/format";
import { Freshness } from "../../components/Freshness";
import { coreVerdict } from "../../lib/request";

export function BlockchainStatus() {
  const { data, isLoading, error, refetch } = useBlockchainStatus();
  const status = data?.status;

  // Check if response has expected structure
  const hasExpectedStructure = status?.chain?.name !== undefined;

  return (
    <Card
      title="Core status"
      loading={isLoading}
      error={data ? null : error}
      onRetry={() => void refetch()}
    >
      {data && error && (
        <p className="dh-notice dh-notice--warn mb-4">
          Refresh failed. Showing the last successful read.{" "}
          <button
            type="button"
            className="dh-btn"
            onClick={() => void refetch()}
          >
            Retry Core status
          </button>
        </p>
      )}
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
              <p>
                Source: Core node ·{" "}
                <HashValue
                  value={data.source}
                  label="Responding Core endpoint"
                  full
                />
              </p>
              <p>
                Read · <Freshness value={data.readAt} /> · refreshed every 10
                seconds{error ? " · refresh failed" : ""}
              </p>
            </div>
          )}
          <dl className="dh-stats node-key-stats">
            <Stat
              label="Block height"
              value={
                status.chain?.blocksCount !== undefined
                  ? formatNumber(status.chain.blocksCount)
                  : "N/A"
              }
            />
            <Stat
              label="Headers"
              value={
                status.chain?.headersCount !== undefined
                  ? formatNumber(status.chain.headersCount)
                  : "N/A"
              }
            />
            <Stat label="Peers" value={status.network?.peersCount ?? "N/A"} />
          </dl>
          <dl className="node-facts mt-4">
            <div>
              <dt>Chain</dt>
              <dd>{status.chain?.name ?? "Not reported"}</dd>
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
              <dt>Protocol</dt>
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
              <dt>Best block</dt>
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
        <details className="dh-disclosure mt-4 text-sm">
          <summary>Raw node response</summary>
          <JsonView data={status} />
        </details>
      )}
    </Card>
  );
}
