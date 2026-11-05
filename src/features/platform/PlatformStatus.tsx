import { useNetworkStore } from '../../store/network';
import { Card, Stat } from '../../components/Card';
import { Reading, ReadError } from '../../components/ReadState';
import { usePlatformStatus, useTotalCredits } from '../../hooks/usePlatformStatus';
import { formatNumber, formatDash, truncateHash } from '../../lib/format';

export function PlatformStatus() {
  const unit = useNetworkStore(s => s.network) === 'testnet' ? 'tDASH' : 'DASH';
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
            <h3 className="dh-h3 mb-3">Version info</h3>
            <dl className="dh-stats grid grid-cols-2 md:grid-cols-3 gap-4">
              <Stat label="DAPI" value={String(software?.dapi ?? 'N/A')} mono />
              <Stat label="Drive" value={String(software?.drive ?? 'N/A')} mono />
              <Stat
                label="Drive protocol"
                value={String(s?.version.protocol.drive.current ?? 'N/A')}
              />
            </dl>
            <dl className="dh-kv mt-4">
              <div>
                <dt>Tenderdash</dt>
                <dd>
                  {software?.tenderdash ? <details>
                    <summary>Exact software build</summary>
                    <dashhq-hash value={String(software.tenderdash)} label="Tenderdash build" full="" />
                  </details> : null}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="dh-h3 mb-3">Chain info</h3>
            <dl className="dh-stats grid grid-cols-2 md:grid-cols-3 gap-4">
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
            </dl>
          </div>

          <div>
            <h3 className="dh-h3 mb-3">Network info</h3>
            <dl className="dh-stats grid grid-cols-2 md:grid-cols-3 gap-4">
              <Stat label="Chain ID" value={String(network?.chain_id ?? 'N/A')} mono />
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
            </dl>
          </div>

          <div>
            <h3 className="dh-h3 mb-3">Node info</h3>
            {creditsLoading && <Reading subject="total credits" />}
            {creditsError && (
              <ReadError
                error={creditsError}
                subject="total credits"
                onRetry={() => void retryCredits()}
              />
            )}
            <dl className="dh-stats grid grid-cols-2 gap-4">
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
                  label="Platform balance · DASH equivalent"
                  value={<><span className="stat-amount">{formatDash(credits.totalCreditsInPlatform)}</span><span className="stat-unit">{unit}</span><small className="stat-exact"><dashhq-hash value={String(credits.totalCreditsInPlatform)} label="Exact Platform credits" full="" /> credits</small></>}
                />
              )}
            </dl>
          </div>
        </div>
      )}
    </Card>
  );
}
