import { BalanceStat } from "../../components/BalanceStat";
import { JsonView } from "../../components/JsonView";
import { useNetworkStore } from "../../store/network";
import { Freshness } from "../../components/Freshness";
import { HashValue } from "../../components/HashValue";
import { Card, Stat } from "../../components/Card";
import { ReadBoundary } from "../../components/ReadState";
import {
  usePlatformStatus,
  useTotalCredits,
} from "../../hooks/usePlatformStatus";
import { formatNumber, hashText } from "../../lib/format";

export function PlatformStatus() {
  const selectedNetwork = useNetworkStore((s) => s.network);
  const unit = selectedNetwork === "testnet" ? "tDASH" : "DASH";
  const {
    data: status,
    isLoading,
    error,
    refetch,
    dataUpdatedAt,
  } = usePlatformStatus();
  const {
    data: credits,
    isLoading: creditsLoading,
    error: creditsError,
    refetch: retryCredits,
  } = useTotalCredits();

  const s = status;
  const version = s?.version;
  const proTxHash = hashText(s?.node?.proTxHash);
  const chain = s?.chain;
  const network = s?.network;
  const time = s?.time;
  const node = s?.node;

  return (
    <Card title="Platform status" method="getStatus">
      <div className="space-y-6">
        <ReadBoundary subject="platform status" loading={isLoading} error={error} hasData={!!s} onRetry={() => void refetch()}>
          {s && <>
          <p
            className={`node-verdict ${chain?.catchingUp ? "node-verdict--warn" : ""}`}
          >
            {chain?.catchingUp === true
              ? "Node reports it is catching up. Reads may lag behind the network."
              : chain?.catchingUp === false
                ? "Node reports it is synced. Responses have not been proof-checked."
                : "This node did not report its sync state. See the raw response."}
          </p>
          <div
            className="dh-sources mb-4"
            aria-label="Platform response source"
          >
            <p className="dh-meta"><span>Source: Platform node</span><span>Not proof-checked</span></p>
            <p>
              Responding node:{" "}
              <HashValue
                value={proTxHash}
                label="Responding ProTx hash"
                href={
                  proTxHash
                    ? window.dashhq.href("nodes", `/mn/${proTxHash}`, {
                        network: selectedNetwork,
                      })
                    : undefined
                }
              />
            </p>
            <p>
              <a
                href={window.dashhq.href("nodes", "/", {
                  network: selectedNetwork,
                })}
              >
                See network-wide health in Radar →
              </a>
            </p>
            <p className="dh-meta mt-2">
              <span className="read-age">Read <Freshness value={dataUpdatedAt} /></span>
            </p>
          </div>
          <dl className="dh-stats node-key-stats">
            <Stat
              label="Block height"
              value={
                chain?.latestBlockHeight != null
                  ? formatNumber(chain.latestBlockHeight)
                  : "N/A"
              }
            />
            <Stat
              label="Core ChainLock"
              value={
                chain?.coreChainLockedHeight != null
                  ? formatNumber(chain.coreChainLockedHeight)
                  : "N/A"
              }
            />
            <Stat
              label="Peers"
              value={
                network?.peersCount != null
                  ? String(network.peersCount)
                  : "N/A"
              }
            />
          </dl>
          <details className="dh-disclosure">
            <summary><span>Platform node details</span></summary>
            <dl className="node-facts mt-3">
              <div>
                <dt>Client</dt>
                <dd>dapi-client 5.0.3</dd>
              </div>
              <div>
                <dt>DAPI</dt>
                <dd>{String(version?.dapiVersion ?? "Not reported")}</dd>
              </div>
              <div>
                <dt>Drive</dt>
                <dd>{String(version?.driveVersion ?? "Not reported")}</dd>
              </div>
              <div>
                <dt>Tenderdash</dt>
                <dd>
                  <HashValue
                    value={
                      version?.tenderdashVersion
                        ? String(version.tenderdashVersion)
                        : undefined
                    }
                    label="Tenderdash build"
                    full
                  />
                </dd>
              </div>
              <div>
                <dt>Protocol</dt>
                <dd>
                  {version?.driveCurrentProtocol != null
                    ? `v${version.driveCurrentProtocol}`
                    : "Not reported"}
                </dd>
              </div>
              <div>
                <dt>Chain ID</dt>
                <dd>{String(network?.chainId ?? "Not reported")}</dd>
              </div>
              <div>
                <dt>Listening</dt>
                <dd>
                  {network?.listening === undefined
                    ? "Not reported"
                    : network.listening
                      ? "Yes"
                      : "No"}
                </dd>
              </div>
              <div>
                <dt>Latest block</dt>
                <dd>
                  <HashValue
                    value={chain?.latestBlockHash}
                    label="Latest Platform block hash"
                  />
                </dd>
              </div>
              <div>
                <dt>Max peer height</dt>
                <dd>
                  {chain?.maxPeerBlockHeight != null
                    ? formatNumber(chain.maxPeerBlockHeight)
                    : "Not reported"}
                </dd>
              </div>
              <div>
                <dt>Node ID</dt>
                <dd>
                  <HashValue value={node?.nodeId} label="Platform node ID" />
                </dd>
              </div>
              <div>
                <dt>ProTx hash</dt>
                <dd>
                  <HashValue value={proTxHash} label="Node ProTx hash" />
                </dd>
              </div>
              <div>
                <dt>Current epoch</dt>
                <dd>{String(time?.epoch ?? "Not reported")}</dd>
              </div>
            </dl>
          </details>
          </>}
        </ReadBoundary>
        <ReadBoundary subject="total credits" loading={creditsLoading} error={creditsError} hasData={!!credits} onRetry={() => void retryCredits()}>
          {credits && (
            <dl className="dh-stats">
              <BalanceStat
                credits={credits.totalCreditsInPlatform}
                unit={unit}
                label={`Platform balance · ${unit} equivalent`}
              />
            </dl>
          )}
        </ReadBoundary>
        {s && <JsonView data={s} label="Raw node response · Details" />}
      </div>
    </Card>
  );
}
