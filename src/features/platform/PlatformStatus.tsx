import { BalanceStat } from "../../components/BalanceStat";
import { JsonView } from "../../components/JsonView";
import { useNetworkStore } from "../../store/network";
import { Freshness } from "../../components/Freshness";
import { HashValue } from "../../components/HashValue";
import { Card, Stat } from "../../components/Card";
import { Reading, ReadError } from "../../components/ReadState";
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
  const software = s?.version?.software;
  const proTxHash = hashText(s?.toJSON()?.node?.proTxHash);
  const chain = s?.chain;
  const network = s?.network;
  const time = s?.time;
  const node = s?.node;

  return (
    <Card
      title="Platform status"
      loading={isLoading}
      error={error}
      onRetry={() => void refetch()}
    >
      {s && (
        <div className="space-y-6">
          <p
            className={`node-verdict ${chain?.isCatchingUp ? "node-verdict--warn" : ""}`}
          >
            {chain?.isCatchingUp === true
              ? "Node reports it is catching up. Reads may lag behind the network."
              : chain?.isCatchingUp === false
                ? "Node reports it is synced. Responses have not been proof-checked."
                : "This node did not report its sync state. See the raw response."}
          </p>
          {s && (
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
                <span className="read-age">Read <Freshness value={dataUpdatedAt} /></span><span>SDK 5.0.0-rc.8</span>
              </p>
            </div>
          )}
          <dl className="dh-stats node-key-stats">
            <Stat
              label="Block height"
              value={
                chain?.latest_block_height != null
                  ? formatNumber(String(chain.latest_block_height))
                  : "N/A"
              }
            />
            <Stat
              label="Core ChainLock"
              value={
                chain?.core_chain_locked_height != null
                  ? formatNumber(String(chain.core_chain_locked_height))
                  : "N/A"
              }
            />
            <Stat
              label="Peers"
              value={
                network?.peers_count != null
                  ? String(network.peers_count)
                  : "N/A"
              }
            />
          </dl>
          <details className="dh-disclosure">
            <summary><span>Platform node details</span></summary>
            <dl className="node-facts mt-3">
              <div>
                <dt>DAPI</dt>
                <dd>{String(software?.dapi ?? "Not reported")}</dd>
              </div>
              <div>
                <dt>Drive</dt>
                <dd>{String(software?.drive ?? "Not reported")}</dd>
              </div>
              <div>
                <dt>Tenderdash</dt>
                <dd>
                  <HashValue
                    value={
                      software?.tenderdash
                        ? String(software.tenderdash)
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
                  {s.version?.protocol?.drive?.current != null
                    ? `v${s.version.protocol.drive.current}`
                    : "Not reported"}
                </dd>
              </div>
              <div>
                <dt>Chain ID</dt>
                <dd>{String(network?.chain_id ?? "Not reported")}</dd>
              </div>
              <div>
                <dt>Listening</dt>
                <dd>
                  {network?.isListening === undefined
                    ? "Not reported"
                    : network.isListening
                      ? "Yes"
                      : "No"}
                </dd>
              </div>
              <div>
                <dt>Latest block</dt>
                <dd>
                  <HashValue
                    value={chain?.latest_block_hash}
                    label="Latest Platform block hash"
                  />
                </dd>
              </div>
              <div>
                <dt>Max peer height</dt>
                <dd>
                  {chain?.max_peer_block_height != null
                    ? formatNumber(String(chain.max_peer_block_height))
                    : "Not reported"}
                </dd>
              </div>
              <div>
                <dt>Node ID</dt>
                <dd>
                  <HashValue value={node?.id} label="Platform node ID" />
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
          {!creditsLoading && !creditsError && (
            <dl className="dh-stats">
              <BalanceStat
                credits={credits?.totalCreditsInPlatform}
                unit={unit}
                label="Platform balance · DASH equivalent"
              />
            </dl>
          )}
          {creditsLoading && <Reading subject="total credits" />}
          {creditsError && (
            <ReadError
              error={creditsError}
              subject="total credits"
              onRetry={() => void retryCredits()}
            />
          )}
          <details className="dh-disclosure">
            <summary><span>Raw node response</span></summary>
            <JsonView data={s.toJSON()} />
          </details>
        </div>
      )}
    </Card>
  );
}
