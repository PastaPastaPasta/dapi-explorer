import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Stat } from '../../components/Card';
import { useDapi } from '../../hooks/useDapi';
import { useNetworkStore } from '../../store/network';
import { bytesToHex } from '../../lib/dapi';
import { truncateHash } from '../../lib/format';

export function TransactionLookup() {
  const [txid, setTxid] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);

  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  const { data, isLoading, error } = useQuery({
    queryKey: ['transaction', network, submitted],
    queryFn: async () => {
      if (!submitted) return null;
      return client.core.getTransaction(submitted);
    },
    enabled: !!submitted,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (txid.trim()) {
      setSubmitted(txid.trim());
    }
  };

  return (
    <Card title="Transaction Lookup">
      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={txid}
            onChange={(e) => setTxid(e.target.value)}
            placeholder="Transaction ID (txid)"
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-dash-blue"
          />
          <button
            type="submit"
            className="bg-dash-blue text-white px-4 py-1.5 rounded text-sm hover:bg-dash-dark transition-colors"
          >
            Lookup
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-dash-blue border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm bg-red-50 rounded p-3">
          {(error as Error).message}
        </div>
      )}

      {data && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Height" value={data.height} />
            <Stat label="Confirmations" value={data.confirmations} />
            <Stat
              label="Block Hash"
              value={truncateHash(bytesToHex(data.blockHash))}
              mono
            />
            <Stat
              label="InstantSend"
              value={
                <span className={data.isInstantLocked ? 'text-green-600' : 'text-gray-500'}>
                  {data.isInstantLocked ? 'Locked' : 'No'}
                </span>
              }
            />
            <Stat
              label="ChainLock"
              value={
                <span className={data.isChainLocked ? 'text-green-600' : 'text-gray-500'}>
                  {data.isChainLocked ? 'Locked' : 'No'}
                </span>
              }
            />
          </div>
          <div>
            <dt className="text-xs text-gray-500 uppercase tracking-wide mb-2">Raw Transaction (Hex)</dt>
            <pre className="bg-gray-50 rounded p-3 text-xs font-mono overflow-auto max-h-48 break-all">
              {bytesToHex(data.transaction)}
            </pre>
          </div>
        </div>
      )}
    </Card>
  );
}
