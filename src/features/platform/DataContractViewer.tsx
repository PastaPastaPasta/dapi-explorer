import { useState, useEffect, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUrlParam } from '../../lib/location';
import { ReadError, Reading } from '../../components/ReadState';
import { Card } from '../../components/Card';
import { JsonView } from '../../components/JsonView';
import { platformRead } from '../../lib/platform';
import { useNetworkStore } from '../../store/network';
import { identifierToBytes, identifierToBase58 } from '../../lib/identifier';

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

  const network = useNetworkStore((s) => s.network);

  const { data, isFetching: isLoading, isSuccess, error, refetch } = useQuery({
    queryKey: ['dataContract', network, submitted],
    queryFn: async () => {
      if (!submitted) return null;
      const idBytes = identifierToBytes(submitted);
      return platformRead(network, async (sdk) => (await sdk.contracts.fetch(idBytes))?.toJSON(sdk.version()) ?? null);
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
        <label htmlFor="contract-input">Contract ID (base58 or hex)</label>
        <div className="lookup-fields">
          <input
            id="contract-input"
            required
            title="Use a base58 Platform ID or 64 hexadecimal characters."
            type="text"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            placeholder="Data Contract ID (base58 or hex)"
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
      {error && !isLoading && <ReadError error={error} subject="the lookup result" onRetry={() => void refetch()} />}
      {isSuccess && !isLoading && !data && <p className="text-sm">No contract found on {network === 'mainnet' ? 'Mainnet' : 'Testnet'}. Check the ID or change the network.</p>}

      {submitted && data && <p className="text-sm mb-4"><a href={window.dashhq.href('explorer', '/contract/?id=' + identifierToBase58(submitted), { network })}>Open contract in Explorer →</a></p>}

      {data ? (
        <div>
          <dt className="text-xs text-gray-500 mb-2">Contract schema</dt>
          <JsonView data={data} maxHeight="500px" />
        </div>
      ) : null}
    </Card>
  );
}
