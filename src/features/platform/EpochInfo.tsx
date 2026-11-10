import { useUrlParam } from "../../lib/location";
import { ReadError, Reading } from "../../components/ReadState";
import { Card, Stat } from "../../components/Card";
import { JsonView } from "../../components/JsonView";
import {
  useEpochsInfo,
  useCurrentEpoch,
  useConsensusParams,
} from "../../hooks/usePlatformStatus";
import { formatNumber, formatTimestamp, formatBytes } from "../../lib/format";

export function EpochInfo() {
  const [page, setPage] = useUrlParam('epoch');
  const { data: currentEpoch, isLoading: currentLoading, error: currentError, refetch: retryCurrent } = useCurrentEpoch();
  const requested = /^\d+$/.test(page) && Number.isSafeInteger(Number(page)) ? Number(page) : undefined;
  const start = currentEpoch ? Math.min(requested ?? currentEpoch.index, currentEpoch.index) : undefined;
  const {
    data: epochsData,
    isLoading: epochsLoading,
    error: epochsError,
    refetch: retryEpochs,
  } = useEpochsInfo(start);
  const {
    data: consensusParams,
    isFetching: paramsLoading,
    error: paramsError,
    refetch: retryParams,
  } = useConsensusParams(false);

  const hasConsensusStructure = consensusParams?.block?.maxBytes !== undefined;

  const epochs = epochsData?.epochsInfo ?? [];
  const earliest = epochs[epochs.length - 1]?.index;

  return (
    <Card title="Epochs and consensus" method="epoch.epochsInfo">
      <div className="space-y-6">
        {epochsLoading && <Reading subject="epochs" />}
        {epochsError && (
          <ReadError
            error={epochsError}
            subject="epochs"
            onRetry={() => void retryEpochs()}
          />
        )}
        {currentLoading && <Reading subject="the current epoch" />}
        {currentError && <ReadError error={currentError} subject="the current epoch" onRetry={() => void retryCurrent()} />}
        {!currentError && !epochsError && !currentLoading && !epochsLoading && (
        <section aria-label="Recent epochs">
          <h3 className="dh-h3 mb-3">Recent epochs</h3>
          <p className="dh-sources mb-3">Source: Platform epoch records, newest first. Not proof-checked.</p>
          {epochs.length > 0 && (
            <>
              <ol className="epoch-list">
                {epochs.map((epoch) => (
                  <li key={epoch.index}>
                    <p className="dh-meta mb-2">
                      <strong>Epoch #{epoch.index}</strong>
                      {epoch.index === currentEpoch?.index && <span className="dh-badge dh-badge--info">Current epoch</span>}
                    </p>
                    <p className="dh-meta">
                      <span>Start block {epoch.firstBlockHeight != null ? formatNumber(epoch.firstBlockHeight) : 'Not reported'}</span>
                      <span>Core block {epoch.firstCoreBlockHeight != null ? formatNumber(epoch.firstCoreBlockHeight) : 'Not reported'}</span>
                      <span>Start time {epoch.firstBlockTime != null ? formatTimestamp(epoch.firstBlockTime, 'milliseconds') : 'Not reported'}</span>
                      <span>Fee multiplier {epoch.feeMultiplier?.toFixed?.(4) ?? 'Not reported'}</span>
                    </p>
                  </li>
                ))}
              </ol>
              <div className="dh-actions mt-4">
                {earliest !== undefined && earliest > 0 && <button className="dh-btn" onClick={() => setPage(String(earliest - 1))}>Show earlier</button>}
                {requested !== undefined && <button className="dh-btn" onClick={() => setPage('')}>Back to latest</button>}
              </div>
            </>
          )}
          {!currentLoading && !currentError && !epochsLoading && !epochsError && epochsData && epochs.length === 0 && <p>No epochs returned by this node.</p>}
        </section>
        )}
        <details className="dh-disclosure">
          <summary><span>Advanced: legacy consensus parameters</span></summary>
          <p className="text-sm text-gray-500">
            Current nodes expose consensus version and sync state in Platform
            status. The legacy consensus-parameters endpoint may be unavailable.
          </p>
          <button
            className="dh-btn"
            disabled={paramsLoading}
            onClick={() => void retryParams()}
          >
            Read legacy consensus parameters
          </button>
          {paramsLoading && <Reading subject="consensus parameters" />}
          {paramsError && (
            <ReadError
              error={paramsError}
              subject="consensus parameters"
              onRetry={() => void retryParams()}
            />
          )}
          {consensusParams && !hasConsensusStructure && (
            <div>
              <p className="text-sm text-gray-500 mb-2">
                Consensus params (raw):
              </p>
              <JsonView data={consensusParams} />
            </div>
          )}
          {consensusParams && hasConsensusStructure && (
            <div>
              <h3 className="dh-h3 mb-3">Consensus parameters</h3>
              <dl className="dh-stats">
                <Stat
                  label="Max block bytes"
                  value={
                    consensusParams.block?.maxBytes
                      ? formatBytes(
                          parseInt(consensusParams.block.maxBytes, 10),
                        )
                      : "— · Not reported by this node"
                  }
                />
                <Stat
                  label="Max evidence age (blocks)"
                  value={
                    consensusParams.evidence?.maxAgeNumBlocks
                      ? formatNumber(consensusParams.evidence.maxAgeNumBlocks)
                      : "— · Not reported by this node"
                  }
                />
                <Stat
                  label="Max evidence bytes"
                  value={
                    consensusParams.evidence?.maxBytes
                      ? formatBytes(
                          parseInt(consensusParams.evidence.maxBytes, 10),
                        )
                      : "— · Not reported by this node"
                  }
                />
              </dl>
            </div>
          )}
        </details>
      </div>
    </Card>
  );
}
