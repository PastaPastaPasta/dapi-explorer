import { useState, useEffect, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUrlParam } from '../../lib/location';
import { ReadError, Reading } from '../../components/ReadState';
import { Card, Stat } from '../../components/Card';
import { JsonView } from '../../components/JsonView';
import { useDapi } from '../../hooks/useDapi';
import { useNetworkStore } from '../../store/network';
import { hexToBytes, hexToBase58 } from '../../lib/dapi';

export function IdentityLookup() {
  const [submitted, setSubmitted] = useUrlParam('identity');
  const [identityId, setIdentityId] = useState(submitted);
  useEffect(() => setIdentityId(submitted), [submitted]);

  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  const { data, isFetching: isLoading, error, refetch } = useQuery({
    queryKey: ['identity', network, submitted],
    queryFn: async () => {
      if (!submitted) return null;
      const idBytes = hexToBytes(submitted);
      const [identity, balance] = await Promise.all([
        client.platform.getIdentity(idBytes),
        client.platform.getIdentityBalance(idBytes).catch(() => null),
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
        <label htmlFor="identity-input">Identity ID (64 hexadecimal characters)</label>
        <div className="lookup-fields">
          <input
            id="identity-input"
            required pattern="(?:0x)?[0-9a-fA-F]{64}"
            title="Use a 32-byte ID: 64 hexadecimal characters."
            type="text"
            value={identityId}
            onChange={(e) => setIdentityId(e.target.value)}
            placeholder="Identity ID (hex, 32 bytes)"
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
          Enter a 32-byte hex identity ID (e.g., from a Dash Platform application)
        </p>
      </form>

      {isLoading && <Reading subject="the lookup result" />}
      {error && !isLoading && <ReadError error={error} subject="the lookup result" />}

      {submitted && /^(?:0x)?[0-9a-fA-F]{64}$/.test(submitted) && <p className="text-sm mb-4"><a href={window.dashhq.href('explorer', '/identity/?id=' + hexToBase58(submitted), { network })}>Open identity in Explorer →</a></p>}

      {data?.identity ? (
        <div className="space-y-4">
          {data.balance ? (
            <Stat
              label="Credit balance"
              value={`${Number(data.balance.balance).toLocaleString()} credits`}
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
