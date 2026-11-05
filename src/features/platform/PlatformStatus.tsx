import { Card, Stat } from '../../components/Card';
import { Reading, ReadError } from '../../components/ReadState';
import { usePlatformStatus, useTotalCredits } from '../../hooks/usePlatformStatus';
import { formatNumber, formatCredits, truncateHash } from '../../lib/format';

export function PlatformStatus() {
  const { data: status, isLoading, error, refetch, dataUpdatedAt } = usePlatformStatus();
  const {
    data: credits,
    isLoading: creditsLoading,
    error: creditsError,
    refetch: retryCredits,
  } = useTotalCredits();

  const s = status;
  const software = s?.version.software;
  const chain = s?.chain;
  const network = s?.network;
  const time = s?.time;
  const node = s?.node;

  return (
    <Card title="Platform status" loading={isLoading} error={error} onRetry={() => void refetch()}>
      {s && (
        <p className="text-xs text-gray-500 mb-4">
          Reported by Platform · read at {new Date(dataUpdatedAt).toISOString().slice(11, 19)} UTC ·
          SDK 5.0.0-rc.8. Node ProTx hash below identifies the responding node.
        </p>
      )}
      {s && (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Version info</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Stat label="DAPI" value={String(software?.dapi ?? 'N/A')} />
              <Stat label="Drive" value={String(software?.drive ?? 'N/A')} />
              <div className="col-span-2 md:col-span-3">
                <Stat
                  label="Tenderdash"
                  value={String(software?.tenderdash ?? 'N/A')
                    .split('+')[0]
                    .replace(/-[0-9a-f]{7,}.*$/i, '')}
                />
                {software?.tenderdash ? (
                  <details>
                    <summary className="text-sm">Exact build identifier</summary>
                    <p className="font-mono text-sm break-all my-2">
                      {String(software.tenderdash)}
                    </p>
                    <dashhq-hash
                      value={String(software.tenderdash)}
                      label="Tenderdash build"
                      full=""
                    />
                  </details>
                ) : null}
              </div>
              <Stat
                label="Drive protocol"
                value={String(s?.version.protocol.drive.current ?? 'N/A')}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Chain info</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Stat
                label="Latest block height"
                value={
                  chain?.latest_block_height
                    ? formatNumber(String(chain.latest_block_height))
                    : 'N/A'
                }
              />
              <Stat
                label="Core ChainLock height"
                value={
                  chain?.core_chain_locked_height
                    ? formatNumber(String(chain.core_chain_locked_height))
                    : 'N/A'
                }
              />
              <Stat
                label="Catching up"
                value={
                  chain?.isCatchingUp !== undefined ? (
                    <span className={chain.isCatchingUp ? 'text-yellow-600' : 'text-green-600'}>
                      {chain.isCatchingUp ? 'Yes' : 'No'}
                    </span>
                  ) : (
                    'N/A'
                  )
                }
              />
              <Stat
                label="Latest block hash"
                value={
                  chain?.latest_block_hash ? truncateHash(String(chain.latest_block_hash)) : 'N/A'
                }
                mono
              />
              <Stat
                label="Max peer block height"
                value={
                  chain?.max_peer_block_height
                    ? formatNumber(String(chain.max_peer_block_height))
                    : 'N/A'
                }
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Network info</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Stat label="Chain ID" value={String(network?.chain_id ?? 'N/A')} />
              <Stat label="Peers" value={String(network?.peers_count ?? 'N/A')} />
              <Stat
                label="Listening"
                value={
                  network?.isListening !== undefined ? (
                    <span className={network.isListening ? 'text-green-600' : 'text-gray-500'}>
                      {network.isListening ? 'Yes' : 'No'}
                    </span>
                  ) : (
                    'N/A'
                  )
                }
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Node info</h4>
            {creditsLoading && <Reading subject="total credits" />}
            {creditsError && (
              <ReadError
                error={creditsError}
                subject="total credits"
                onRetry={() => void retryCredits()}
              />
            )}
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Node ID" value={node?.id ? truncateHash(node.id) : 'N/A'} mono />
              <Stat
                label="ProTx hash"
                value={
                  node?.proTxHash ? (
                    <dashhq-hash
                      value={String(s?.toJSON()?.node?.proTxHash ?? '')}
                      label="Node ProTx hash"
                    />
                  ) : (
                    'N/A'
                  )
                }
                mono
              />
              <Stat label="Current epoch" value={String(time?.epoch ?? 'N/A')} />
              {credits?.totalCreditsInPlatform !== undefined && (
                <Stat
                  label="Total credits in Platform"
                  value={formatCredits(credits.totalCreditsInPlatform)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
