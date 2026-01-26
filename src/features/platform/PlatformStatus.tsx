import { Card, Stat } from '../../components/Card';
import { usePlatformStatus, useTotalCredits } from '../../hooks/usePlatformStatus';
import { formatNumber, formatCredits, truncateHash } from '../../lib/format';

export function PlatformStatus() {
  const { data: status, isLoading, error } = usePlatformStatus();
  const { data: credits } = useTotalCredits();

  // The actual API response has a different structure than the TypeScript types
  // Cast to any to access the real fields
  const s = status as Record<string, unknown> | undefined;
  const version = s?.version as Record<string, unknown> | undefined;
  const node = s?.node as Record<string, unknown> | undefined;
  const chain = s?.chain as Record<string, unknown> | undefined;
  const network = s?.network as Record<string, unknown> | undefined;
  const time = s?.time as Record<string, unknown> | undefined;

  return (
    <Card title="Platform Status" loading={isLoading} error={error}>
      {s && (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Version Info</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Stat label="DAPI" value={String(version?.dapiVersion ?? 'N/A')} />
              <Stat label="Drive" value={String(version?.driveVersion ?? 'N/A')} />
              <Stat label="Tenderdash" value={String(version?.tenderdashVersion ?? 'N/A')} />
              <Stat label="Drive Protocol" value={String(version?.driveCurrentProtocol ?? 'N/A')} />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Chain Info</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Stat label="Latest Block Height" value={chain?.latestBlockHeight ? formatNumber(String(chain.latestBlockHeight)) : 'N/A'} />
              <Stat label="Core ChainLock Height" value={chain?.coreChainLockedHeight ? formatNumber(String(chain.coreChainLockedHeight)) : 'N/A'} />
              <Stat
                label="Catching Up"
                value={
                  chain?.catchingUp !== undefined ? (
                    <span className={chain.catchingUp ? 'text-yellow-600' : 'text-green-600'}>
                      {chain.catchingUp ? 'Yes' : 'No'}
                    </span>
                  ) : 'N/A'
                }
              />
              <Stat
                label="Latest Block Hash"
                value={chain?.latestBlockHash ? truncateHash(String(chain.latestBlockHash)) : 'N/A'}
                mono
              />
              <Stat label="Max Peer Block Height" value={chain?.maxPeerBlockHeight ? formatNumber(String(chain.maxPeerBlockHeight)) : 'N/A'} />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Network Info</h4>
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
            <h4 className="text-sm font-medium text-gray-700 mb-3">Node Info</h4>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Node ID" value={node?.nodeId ? truncateHash(String(node.nodeId)) : (node?.id ? truncateHash(String(node.id)) : 'N/A')} mono />
              <Stat label="ProTxHash" value={node?.proTxHash ? truncateHash(String(node.proTxHash)) : 'N/A'} mono />
              <Stat label="Current Epoch" value={String(time?.epoch ?? 'N/A')} />
              {credits?.totalCreditsInPlatform !== undefined && (
                <Stat
                  label="Total Credits in Platform"
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
