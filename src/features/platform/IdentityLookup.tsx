import { useState, useEffect, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUrlParam } from '../../lib/location';
import { ReadError, Reading } from '../../components/ReadState';
import { Card, Stat } from '../../components/Card';
import { JsonView } from '../../components/JsonView';
import { platformRead } from '../../lib/platform';
import { useNetworkStore } from '../../store/network';
import { identifierToBytes, identifierToBase58 } from '../../lib/identifier';

export function IdentityLookup() {
  const [submitted, setSubmitted] = useUrlParam('identity');
  const [identityId, setIdentityId] = useState(submitted);
  useEffect(() => setIdentityId(submitted), [submitted]);

  const network = useNetworkStore((s) => s.network);

  const { data, isFetching: isLoading, error, refetch } = useQuery({
    queryKey: ['identity', network, submitted],
    queryFn: async () => {
      if (!submitted) return null;
      const idBytes = identifierToBytes(submitted);
      const [identity, balance] = await Promise.all([
        platformRead(network, (sdk) => sdk.identities.fetch(idBytes)),
        platformRead(network, async (sdk) => ({ balance: await sdk.identities.balance(idBytes) })).catch(() => null),
      ]);
      return { identity, balance };
    },
    enabled: !!submitted,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (identityId.trim()) {
      if (submitted === identityId.trim()) void refetch();
      else setSubmitted(identityId.trim());
    }
  };

  return (
    <Card title="Identity lookup">
      <form onSubmit={handleSubmit} className="lookup-form space-y-3 mb-4">
        <label htmlFor="identity-input">Identity ID (base58 or hex)</label>
        <div className="lookup-fields">
          <input
            id="identity-input"
            required
            title="Use a base58 Platform ID or 64 hexadecimal characters."
            type="text"
            value={identityId}
            onChange={(e) => setIdentityId(e.target.value)}
            placeholder="Identity ID (base58 or hex)"
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="submit"
            className="lookup-button px-4 py-1.5 rounded text-sm transition-colors"
          >
            Look up identity
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Paste the same base58 identity ID used in Explorer, or a 32-byte hex ID.
        </p>
      </form>

      {isLoading && <Reading subject="the lookup result" />}
      {error && !isLoading && <ReadError error={error} subject="the lookup result" onRetry={() => void refetch()} />}

      {submitted && data && <p className="text-sm mb-4"><a href={window.dashhq.href('explorer', '/identity/?id=' + identifierToBase58(submitted), { network })}>Open identity in Explorer →</a></p>}

      {data && !data.identity && <p className="text-sm">No identity found on {network === 'mainnet' ? 'Mainnet' : 'Testnet'}. Check the ID or change the network.</p>}
      {data?.identity ? (
        <div className="space-y-4">
          {data.balance ? (
            <Stat
              label="Credit balance"
              value={`${Number(data.balance.balance ?? 0n).toLocaleString()} credits`}
            />
          ) : null}
          <div>
            <dt className="text-xs text-gray-500 mb-2">Identity data</dt>
            <JsonView data={data.identity} />
          </div>
        </div>
      ) : null}
    </Card>
  );
}
