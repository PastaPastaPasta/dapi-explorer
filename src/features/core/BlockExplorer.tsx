import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Stat } from '../../components/Card';
import { useDapi } from '../../hooks/useDapi';
import { useNetworkStore } from '../../store/network';
import { bytesToHex } from '../../lib/dapi';

export function BlockExplorer() {
  const [searchType, setSearchType] = useState<'height' | 'hash'>('height');
  const [searchValue, setSearchValue] = useState('');
  const [submitted, setSubmitted] = useState<{ type: 'height' | 'hash'; value: string } | null>(null);

  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  const { data, isLoading, error } = useQuery({
    queryKey: ['block', network, submitted?.type, submitted?.value],
    queryFn: async () => {
      if (!submitted) return null;
      if (submitted.type === 'height') {
        const blockData = await client.core.getBlockByHeight(parseInt(submitted.value, 10));
        return { raw: bytesToHex(blockData), height: submitted.value };
      } else {
        const blockData = await client.core.getBlockByHash(submitted.value);
        return { raw: bytesToHex(blockData), hash: submitted.value };
      }
    },
    enabled: !!submitted,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setSubmitted({ type: searchType, value: searchValue.trim() });
    }
  };

  return (
    <Card title="Block Explorer">
      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        <div className="flex gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'height' | 'hash')}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"
          >
            <option value="height">By Height</option>
            <option value="hash">By Hash</option>
          </select>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchType === 'height' ? 'Block height (e.g., 1000)' : 'Block hash'}
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
          {data.height && <Stat label="Height" value={data.height} />}
          {data.hash && <Stat label="Hash" value={data.hash} mono />}
          <div>
            <dt className="text-xs text-gray-500 uppercase tracking-wide mb-2">Raw Block Data (Hex)</dt>
            <pre className="bg-gray-50 rounded p-3 text-xs font-mono overflow-auto max-h-48 break-all">
              {data.raw}
            </pre>
          </div>
        </div>
      )}
    </Card>
  );
}
