import { Card, Stat } from '../../components/Card';
import { usePlatformStatus, useTotalCredits } from '../../hooks/usePlatformStatus';
import { formatNumber, formatCredits, truncateHash } from '../../lib/format';

export function PlatformStatus() {
  const { data: status, isLoading, error } = usePlatformStatus();
  const { data: credits } = useTotalCredits();

  const s = status as Record<string, unknown> | undefined;
  const version = s?.version as Record<string, unknown> | undefined;
  const node = s?.node as Record<string, unknown> | undefined;
  const chain = s?.chain as Record<string, unknown> | undefined;
  const network = s?.network as Record<string, unknown> | undefined;
  const time = s?.time as Record<string, unknown> | undefined;

  return (
    <Card title="Platform status" loading={isLoading} error={error}>
      {s && (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Version info</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Stat label="DAPI" value={String(version?.dapiVersion ?? 'N/A')} />
              <Stat label="Drive" value={String(version?.driveVersion ?? 'N/A')} />
              <Stat label="Tenderdash" value={String(version?.tenderdashVersion ?? 'N/A')} />
              <Stat label="Drive protocol" value={String(version?.driveCurrentProtocol ?? 'N/A')} />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Chain info</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Stat label="Latest block height" value={chain?.latestBlockHeight ? formatNumber(String(chain.latestBlockHeight)) : 'N/A'} />
              <Stat label="Core ChainLock height" value={chain?.coreChainLockedHeight ? formatNumber(String(chain.coreChainLockedHeight)) : 'N/A'} />
              <Stat
                label="Catching up"
                value={
                  chain?.catchingUp !== undefined ? (
                    <span className={chain.catchingUp ? 'text-yellow-600' : 'text-green-600'}>
                      {chain.catchingUp ? 'Yes' : 'No'}
                    </span>
                  ) : 'N/A'
                }
              />
              <Stat
                label="Latest block hash"
                value={chain?.latestBlockHash ? truncateHash(String(chain.latestBlockHash)) : 'N/A'}
                mono
              />
              <Stat label="Max peer block height" value={chain?.maxPeerBlockHeight ? formatNumber(String(chain.maxPeerBlockHeight)) : 'N/A'} />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Network info</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Stat label="Chain ID" value={String(network?.chainId ?? 'N/A')} />
              <Stat label="Peers" value={String(network?.peersCount ?? 'N/A')} />
              <Stat
                label="Listening"
                value={
                  network?.listening !== undefined ? (
                    <span className={network.listening ? 'text-green-600' : 'text-gray-500'}>
                      {network.listening ? 'Yes' : 'No'}
                    </span>
                  ) : 'N/A'
                }
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Node info</h4>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Node ID" value={node?.nodeId ? truncateHash(String(node.nodeId)) : (node?.id ? truncateHash(String(node.id)) : 'N/A')} mono />
              <Stat label="ProTx hash" value={node?.proTxHash ? truncateHash(String(node.proTxHash)) : 'N/A'} mono />
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
