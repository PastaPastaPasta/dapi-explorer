import { ReadError, Reading } from '../../components/ReadState';
import { Card, Stat } from '../../components/Card';
import { JsonView } from '../../components/JsonView';
import { useEpochsInfo, useConsensusParams } from '../../hooks/usePlatformStatus';
import { formatNumber, formatTimestamp, formatBytes } from '../../lib/format';

export function EpochInfo() {
  const { data: epochsData, isLoading: epochsLoading, error: epochsError, refetch: retryEpochs } = useEpochsInfo(0, 10);
  const { data: consensusParams, isFetching: paramsLoading, error: paramsError, refetch: retryParams } = useConsensusParams(false);


  // Check if consensus params have expected structure
  const hasConsensusStructure = consensusParams?.block?.maxBytes !== undefined;

  return (
    <Card title="Epochs and consensus">
      <div className="space-y-6">
        <p className="text-sm text-gray-500">Current nodes expose consensus version and sync state in Platform status. The legacy consensus-parameters endpoint may be unavailable.</p>
        <button className="dh-btn" disabled={paramsLoading} onClick={() => void retryParams()}>Read legacy consensus parameters</button>
        {epochsLoading && <Reading subject="epochs" />}
        {epochsError && <ReadError error={epochsError} subject="epochs" onRetry={() => void retryEpochs()} />}
        {paramsLoading && <Reading subject="consensus parameters" />}
        {paramsError && <ReadError error={paramsError} subject="consensus parameters" onRetry={() => void retryParams()} />}
        {consensusParams && !hasConsensusStructure && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Consensus params (raw):</p>
            <JsonView data={consensusParams} />
          </div>
        )}
        {consensusParams && hasConsensusStructure && (
          <div>
            <h3 className="dh-h3 mb-3">Consensus parameters</h3>
            <dl className="dh-stats">
              <Stat label="Max block bytes" value={consensusParams.block?.maxBytes ? formatBytes(parseInt(consensusParams.block.maxBytes, 10)) : 'N/A'} />
              <Stat label="Max evidence age (blocks)" value={consensusParams.evidence?.maxAgeNumBlocks ? formatNumber(consensusParams.evidence.maxAgeNumBlocks) : 'N/A'} />
              <Stat label="Max evidence bytes" value={consensusParams.evidence?.maxBytes ? formatBytes(parseInt(consensusParams.evidence.maxBytes, 10)) : 'N/A'} />
            </dl>
          </div>
        )}

        {epochsData?.epochsInfo && epochsData.epochsInfo.length > 0 && (
          <div>
            <h3 className="dh-h3 mb-3">Epochs from genesis</h3>
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="dh-table dh-table--cards">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Epoch</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Start block</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Core block</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Start time</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Fee multiplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {epochsData.epochsInfo.map((epoch, idx) => (
                    <tr key={epoch?.index ?? idx} className="hover:bg-gray-50">
                      <td data-label="Epoch" className="dh-rc-title">{epoch?.index ?? 'N/A'}</td>
                      <td data-label="Start block" className="px-3 py-2 font-mono text-xs">
                        {epoch?.firstBlockHeight ? formatNumber(epoch.firstBlockHeight) : 'N/A'}
                      </td>
                      <td data-label="Core block" className="px-3 py-2 font-mono text-xs">
                        {epoch?.firstCoreBlockHeight ? formatNumber(epoch.firstCoreBlockHeight) : 'N/A'}
                      </td>
                      <td data-label="Start time" className="px-3 py-2 text-gray-600 text-xs">
                        {epoch?.firstBlockTime ? formatTimestamp(epoch.firstBlockTime, 'milliseconds') : 'N/A'}
                      </td>
                      <td data-label="Fee multiplier" className="px-3 py-2">{epoch?.feeMultiplier?.toFixed?.(4) ?? 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
