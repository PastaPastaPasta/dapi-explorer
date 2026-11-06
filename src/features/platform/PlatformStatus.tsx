import { useNetworkStore } from '../../store/network';
import { BalanceStat } from '../../components/BalanceStat';
import { HashValue } from '../../components/HashValue';
import { Card, Stat } from '../../components/Card';
import { Reading, ReadError } from '../../components/ReadState';
import { usePlatformStatus, useTotalCredits } from '../../hooks/usePlatformStatus';
import { formatNumber, hashText } from '../../lib/format';

export function PlatformStatus() {
  const selectedNetwork = useNetworkStore(s => s.network);
  const unit = selectedNetwork === 'testnet' ? 'tDASH' : 'DASH';
  const { data: status, isLoading, error, refetch, dataUpdatedAt } = usePlatformStatus();
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
    <Card title="Platform status" loading={isLoading} error={error} onRetry={() => void refetch()}>
      {s && <div className="dh-source mb-4">
        <p>Source: Platform node · Responses are not proof-checked here.</p>
        <p>Responding node: <HashValue value={proTxHash} label="Responding ProTx hash" href={proTxHash ? window.dashhq.href('nodes', `/mn/${proTxHash}`, { network: selectedNetwork }) : undefined} /></p>
        <p><a href={window.dashhq.href('nodes', '/', { network: selectedNetwork })}>See network-wide health in Radar →</a></p>
        <p className="text-xs text-gray-500 mt-2">Read at {new Date(dataUpdatedAt).toISOString().replace('T', ' ').slice(0, 19)} UTC · SDK 5.0.0-rc.8</p>
      </div>}
      {s && (
        <div className="space-y-6">
          <div>
            <h3 className="dh-h3 mb-3">Version info</h3>
            <dl className="dh-stats grid grid-cols-2 md:grid-cols-3 gap-4">
              <Stat label="DAPI" value={String(software?.dapi ?? 'N/A')} mono />
              <Stat label="Drive" value={String(software?.drive ?? 'N/A')} mono />
              <Stat
                label="Platform protocol"
                value={s?.version?.protocol?.drive?.current != null ? `v${s.version.protocol.drive.current}` : 'N/A'}
              />
            </dl>
            <dl className="dh-kv mt-4">
              <div>
                <dt>Tenderdash</dt>
                <dd>
                  {software?.tenderdash ? <>
                    <HashValue value={String(software.tenderdash)} label="Tenderdash version" />
                    <details><summary>Exact software build</summary><HashValue value={String(software.tenderdash)} label="Tenderdash build" full /></details>
                  </> : <span>— · Not reported by this node</span>}
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
                  chain?.latest_block_height != null
                    ? formatNumber(String(chain.latest_block_height))
                    : 'N/A'
                }
              />
              <Stat
                label="Core ChainLock height"
                value={
                  chain?.core_chain_locked_height != null
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
                  <HashValue value={chain?.latest_block_hash} label="Latest Platform block hash" />
                }
                mono
              />
              <Stat
                label="Max peer block height"
                value={
                  chain?.max_peer_block_height != null
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
              <Stat label="Node ID" value={<HashValue value={node?.id} label="Platform node ID" />} mono />
              <Stat
                label="ProTx hash"
                value={
                  node?.proTxHash ? (
                    <HashValue value={proTxHash} label="Node ProTx hash" />
                  ) : (
                    'N/A'
                  )
                }
                mono
              />
              <Stat label="Current epoch" value={String(time?.epoch ?? 'N/A')} />
              {!creditsLoading && !creditsError && <BalanceStat label="Platform balance · DASH equivalent" credits={credits?.totalCreditsInPlatform} unit={unit} />}
            </dl>
          </div>
        </div>
      )}
    </Card>
  );
}
