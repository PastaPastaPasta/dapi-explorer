import { useState, useEffect, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUrlParam } from '../../lib/location';
import { ReadError, Reading } from '../../components/ReadState';
import { Card } from '../../components/Card';
import { NetworkRecovery } from '../../components/NetworkRecovery';
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
      <form onSubmit={handleSubmit} className="dh-field mb-4">
        <label className="dh-field__label" htmlFor="contract-input">Contract ID (base58 or hex)</label>
        <div className="dh-inline-form">
          <input
            id="contract-input" aria-describedby="contract-input-help"
            required
            title="Use a base58 Platform ID or 64 hexadecimal characters."
            type="text"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            placeholder="Contract ID (base58 or hex)"
            className="dh-input dh-input--mono flex-1"
          />
          <button
            type="submit"
            className="dh-btn dh-btn--primary"
          >
            Fetch contract
          </button>
        </div>
        <p className="dh-field__help" id="contract-input-help">Use a base58 contract ID or its hexadecimal representation.</p>
      </form>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Known contracts:</p>
        <div className="flex flex-wrap gap-2">
          {KNOWN_CONTRACTS.map((contract) => (
            <button
              key={contract.id}
              onClick={() => handleKnownContract(contract.id)}
              className="dh-btn dh-btn--sm"
              title={contract.description}
            >
              {contract.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <Reading subject="the lookup result" />}
      {error && !isLoading && <ReadError error={error} subject="the lookup result" onRetry={() => void refetch()} />}
      {submitted && isSuccess && !isLoading && !data && <NetworkRecovery kind="contract" id={submitted} />}

      {submitted && data && <p className="text-sm mb-4"><a href={window.dashhq.href('explorer', '/contract/?id=' + identifierToBase58(submitted), { network })}>Open contract in Explorer →</a></p>}

      {data ? (
        <div>
          <p className="text-xs text-gray-500 mb-2">Contract schema</p>
          <JsonView data={data} maxHeight="500px" />
        </div>
      ) : null}
    </Card>
  );
}
