import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Stat } from '../../components/Card';
import { JsonView } from '../../components/JsonView';
import { useDapi } from '../../hooks/useDapi';
import { useNetworkStore } from '../../store/network';
import { hexToBytes } from '../../lib/dapi';

export function IdentityLookup() {
  const [identityId, setIdentityId] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);

  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  const { data, isLoading, error } = useQuery({
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
      setSubmitted(identityId.trim());
    }
  };

  return (
    <Card title="Identity Lookup">
      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={identityId}
            onChange={(e) => setIdentityId(e.target.value)}
            placeholder="Identity ID (hex, 32 bytes)"
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-dash-blue"
          />
          <button
            type="submit"
            className="bg-dash-blue text-white px-4 py-1.5 rounded text-sm hover:bg-dash-dark transition-colors"
          >
            Lookup
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Enter a 32-byte hex identity ID (e.g., from a Dash Platform application)
        </p>
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

      {data?.identity ? (
        <div className="space-y-4">
          {data.balance ? (
            <Stat
              label="Credit Balance"
              value={`${Number(data.balance.balance).toLocaleString()} credits`}
            />
          ) : null}
          <div>
            <dt className="text-xs text-gray-500 uppercase tracking-wide mb-2">Identity Data</dt>
            <JsonView data={data.identity} />
          </div>
        </div>
      ) : null}
    </Card>
  );
}
