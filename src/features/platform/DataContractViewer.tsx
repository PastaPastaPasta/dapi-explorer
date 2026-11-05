import { useState, useEffect, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUrlParam } from '../../lib/location';
import { ReadError, Reading } from '../../components/ReadState';
import { Card } from '../../components/Card';
import { JsonView } from '../../components/JsonView';
import { useDapi } from '../../hooks/useDapi';
import { useNetworkStore } from '../../store/network';
import { hexToBytes, hexToBase58 } from '../../lib/dapi';

const KNOWN_CONTRACTS = [
  {
    name: 'Usernames (DPNS)',
    id: 'e668c659af66aee1e72c186dde7b5b7e0a1d712a09c40d5721f622bf53c53155',
    description: 'Dash Platform Naming Service',
  },
];

export function DataContractViewer() {
  const [submitted, setSubmitted] = useUrlParam('contract');
  const [contractId, setContractId] = useState(submitted);
  useEffect(() => setContractId(submitted), [submitted]);

  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  const { data, isFetching: isLoading, error, refetch } = useQuery({
    queryKey: ['dataContract', network, submitted],
    queryFn: async () => {
      if (!submitted) return null;
      const idBytes = hexToBytes(submitted);
      return client.platform.getDataContract(idBytes);
    },
    enabled: !!submitted,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (contractId.trim()) {
      if (submitted === contractId.trim()) void refetch();
      else setSubmitted(contractId.trim());
    }
  };

  const handleKnownContract = (id: string) => {
    setContractId(id);
    setSubmitted(id);
  };

  return (
    <Card title="Data contract">
      <form onSubmit={handleSubmit} className="lookup-form space-y-3 mb-4">
        <label htmlFor="contract-input">Contract ID (64 hexadecimal characters)</label>
        <div className="lookup-fields">
          <input
            id="contract-input"
            required pattern="(?:0x)?[0-9a-fA-F]{64}"
            title="Use a 32-byte ID: 64 hexadecimal characters."
            type="text"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            placeholder="Data Contract ID (hex, 32 bytes)"
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="submit"
            className="lookup-button px-4 py-1.5 rounded text-sm transition-colors"
          >
            Fetch contract
          </button>
        </div>
      </form>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Known contracts (click to load):</p>
        <div className="flex flex-wrap gap-2">
          {KNOWN_CONTRACTS.map((contract) => (
            <button
              key={contract.id}
              onClick={() => handleKnownContract(contract.id)}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
              title={contract.description}
            >
              {contract.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <Reading subject="the lookup result" />}
      {error && !isLoading && <ReadError error={error} subject="the lookup result" />}

      {submitted && /^(?:0x)?[0-9a-fA-F]{64}$/.test(submitted) && <p className="text-sm mb-4"><a href={window.dashhq.href('explorer', '/contract/?id=' + hexToBase58(submitted), { network })}>Open contract in Explorer →</a></p>}

      {data ? (
        <div>
          <dt className="text-xs text-gray-500 mb-2">Contract schema</dt>
          <JsonView data={data} maxHeight="500px" />
        </div>
      ) : null}
    </Card>
  );
}
