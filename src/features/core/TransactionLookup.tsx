import { useState, useEffect, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUrlParam } from '../../lib/location';
import { ReadError, Reading } from '../../components/ReadState';
import { HashValue } from '../../components/HashValue';
import { Card, Stat } from '../../components/Card';
import { useDapi } from '../../hooks/useDapi';
import { useNetworkStore } from '../../store/network';
import { bytesToHex } from '../../lib/dapi';

export function TransactionLookup() {
  const [submitted, setSubmitted] = useUrlParam('tx');
  const [txid, setTxid] = useState(submitted);
  useEffect(() => setTxid(submitted), [submitted]);

  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  const { data, isFetching: isLoading, error, refetch } = useQuery({
    queryKey: ['transaction', network, submitted],
    queryFn: async () => {
      if (!submitted) return null;
      if (!/^[0-9a-fA-F]{64}$/.test(submitted)) throw new Error('Use a 64-character hexadecimal transaction ID.');
      return client.core.getTransaction(submitted);
    },
    enabled: !!submitted,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (txid.trim()) {
      if (submitted === txid.trim()) void refetch();
      else setSubmitted(txid.trim());
    }
  };

  return (
    <Card title="Transaction lookup" method="getTransaction">
      <form onSubmit={handleSubmit} className="dh-field mb-4">
        <label className="dh-field__label" htmlFor="tx-input">Transaction ID (64 hexadecimal characters)</label>
        <div className="dh-inline-form">
          <input
            id="tx-input" aria-describedby="tx-input-help"
            required pattern="[0-9a-fA-F]{64}"
            title="Use a 32-byte ID: 64 hexadecimal characters."
            type="text"
            value={txid}
            onChange={(e) => setTxid(e.target.value)}
            placeholder="Transaction ID (txid)"
            className="dh-input dh-input--mono flex-1"
          />
          <button
            type="submit"
            className="dh-btn dh-btn--primary"
          >
            Look up transaction
          </button>
        </div>
        <p className="dh-field__help" id="tx-input-help">Use the full 64-character hexadecimal transaction ID.</p>
      </form>

      {isLoading && <Reading subject="the lookup result" />}
      {error && !isLoading && <ReadError error={error} subject="the lookup result" onRetry={() => void refetch()} />}

      {data && (
        <div className="space-y-3">
          <dl className="dh-stats grid grid-cols-2 gap-4">
            <Stat label="Height" value={data.height} />
            <Stat label="Confirmations" value={data.confirmations} />
            <Stat
              label="Block hash"
              value={<HashValue value={data.blockHash ? bytesToHex(data.blockHash) : undefined} label="Block hash" />}
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
          </dl>
          <div>
            <p className="text-xs text-gray-500 mb-2">Raw transaction (hex)</p>
            <pre className="bg-gray-50 rounded p-3 text-xs font-mono overflow-auto max-h-48 break-all">
              {bytesToHex(data.transaction)}
            </pre>
          </div>
        </div>
      )}
    </Card>
  );
}
