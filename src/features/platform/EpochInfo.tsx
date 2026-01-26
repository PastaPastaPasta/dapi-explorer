import { Card } from '../../components/Card';
import { JsonView } from '../../components/JsonView';
import { useEpochsInfo, useConsensusParams } from '../../hooks/usePlatformStatus';
import { formatNumber, formatTimestamp, formatBytes } from '../../lib/format';

export function EpochInfo() {
  const { data: epochsData, isLoading: epochsLoading, error: epochsError } = useEpochsInfo(0, 10);
  const { data: consensusParams, isLoading: paramsLoading } = useConsensusParams();

  const isLoading = epochsLoading || paramsLoading;
  const error = epochsError;

  // Check if consensus params have expected structure
  const hasConsensusStructure = consensusParams?.block?.maxBytes !== undefined;

  return (
    <Card title="Epochs & Consensus" loading={isLoading} error={error}>
      <div className="space-y-6">
        {consensusParams && !hasConsensusStructure && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Consensus params (raw):</p>
            <JsonView data={consensusParams} />
          </div>
        )}
        {consensusParams && hasConsensusStructure && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Consensus Parameters</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="py-2">
                <dt className="text-xs text-gray-500 uppercase tracking-wide">Max Block Bytes</dt>
                <dd className="mt-1 text-gray-900">
                  {consensusParams.block?.maxBytes ? formatBytes(parseInt(consensusParams.block.maxBytes, 10)) : 'N/A'}
                </dd>
              </div>
              <div className="py-2">
                <dt className="text-xs text-gray-500 uppercase tracking-wide">Max Evidence Age (Blocks)</dt>
                <dd className="mt-1 text-gray-900">
                  {consensusParams.evidence?.maxAgeNumBlocks ? formatNumber(consensusParams.evidence.maxAgeNumBlocks) : 'N/A'}
                </dd>
              </div>
              <div className="py-2">
                <dt className="text-xs text-gray-500 uppercase tracking-wide">Max Evidence Bytes</dt>
                <dd className="mt-1 text-gray-900">
                  {consensusParams.evidence?.maxBytes ? formatBytes(parseInt(consensusParams.evidence.maxBytes, 10)) : 'N/A'}
                </dd>
              </div>
            </div>
          </div>
        )}

        {epochsData?.epochsInfo && epochsData.epochsInfo.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Epochs</h4>
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Epoch</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Start Block</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Core Block</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Start Time</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Fee Multiplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {epochsData.epochsInfo.map((epoch, idx) => (
                    <tr key={epoch?.number ?? idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono">{epoch?.number ?? 'N/A'}</td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {epoch?.firstBlockHeight ? formatNumber(epoch.firstBlockHeight) : 'N/A'}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {epoch?.firstCoreBlockHeight ? formatNumber(epoch.firstCoreBlockHeight) : 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-gray-600 text-xs">
                        {epoch?.startTime ? formatTimestamp(epoch.startTime) : 'N/A'}
                      </td>
                      <td className="px-3 py-2">{epoch?.feeMultiplier?.toFixed?.(4) ?? 'N/A'}</td>
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
