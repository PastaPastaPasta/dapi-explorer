import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/Card';
import { JsonView } from '../../components/JsonView';
import { useDapi } from '../../hooks/useDapi';
import { useNetworkStore } from '../../store/network';
import { hexToBytes } from '../../lib/dapi';

const KNOWN_CONTRACTS = [
  {
    name: 'DPNS (Domain Names)',
    id: '6469736874657374646f6d61696e73746573746e657470726f746f636f6c3131',
    description: 'Dash Platform Naming Service',
  },
];

export function DataContractViewer() {
  const [contractId, setContractId] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);

  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  const { data, isLoading, error } = useQuery({
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
      setSubmitted(contractId.trim());
    }
  };

  const handleKnownContract = (id: string) => {
    setContractId(id);
    setSubmitted(id);
  };

  return (
    <Card title="Data Contract Viewer">
      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            placeholder="Data Contract ID (hex, 32 bytes)"
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-dash-blue"
          />
          <button
            type="submit"
            className="bg-dash-blue text-white px-4 py-1.5 rounded text-sm hover:bg-dash-dark transition-colors"
          >
            Fetch
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

      {data ? (
        <div>
          <dt className="text-xs text-gray-500 uppercase tracking-wide mb-2">Contract Schema</dt>
          <JsonView data={data} maxHeight="500px" />
        </div>
      ) : null}
    </Card>
  );
}
