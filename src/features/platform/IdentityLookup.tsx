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
      <form onSubmit={handleSubmit} className="dh-field mb-4">
        <label className="dh-field__label" htmlFor="identity-input">Identity ID (base58 or hex)</label>
        <div className="dh-inline-form">
          <input
            id="identity-input" aria-describedby="identity-input-help"
            required
            title="Use a base58 Platform ID or 64 hexadecimal characters."
            type="text"
            value={identityId}
            onChange={(e) => setIdentityId(e.target.value)}
            placeholder="Identity ID (base58 or hex)"
            className="dh-input dh-input--mono flex-1"
          />
          <button
            type="submit"
            className="dh-btn dh-btn--primary"
          >
            Look up identity
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Paste the same base58 identity ID used in Explorer, or a 32-byte hex ID.
        </p>
        <p className="dh-field__help" id="identity-input-help">Use a base58 identity ID or its hexadecimal representation.</p>
      </form>

      {isLoading && <Reading subject="the lookup result" />}
      {error && !isLoading && <ReadError error={error} subject="the lookup result" onRetry={() => void refetch()} />}

      {submitted && data && <p className="text-sm mb-4"><a href={window.dashhq.href('explorer', '/identity/?id=' + identifierToBase58(submitted), { network })}>Open identity in Explorer →</a></p>}

      {data && !data.identity && <p className="dh-empty dh-empty--inline">No identity found on {network === 'mainnet' ? 'Mainnet' : 'Testnet'}. Check the ID or change the network.</p>}
      {data?.identity ? (
        <div className="space-y-4">
          {data.balance ? (
            <dl className="dh-stats"><Stat
              label="Credit balance"
              value={`${Number(data.balance.balance ?? 0n).toLocaleString()} credits`}
            /></dl>
          ) : null}
          <div>
            <p className="text-xs text-gray-500 mb-2">Identity data</p>
            <JsonView data={data.identity} />
          </div>
        </div>
      ) : null}
    </Card>
  );
}
