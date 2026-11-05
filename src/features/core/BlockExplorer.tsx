import { useState, useEffect, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUrlParam, updateUrl } from '../../lib/location';
import { ReadError, Reading } from '../../components/ReadState';
import { Card, Stat } from '../../components/Card';
import { useDapi } from '../../hooks/useDapi';
import { useNetworkStore } from '../../store/network';
import { bytesToHex } from '../../lib/dapi';

export function BlockExplorer() {
  const [block] = useUrlParam('block');
  const [type] = useUrlParam('blockType', 'height');
  const [searchType, setSearchType] = useState<'height' | 'hash'>(type === 'hash' ? 'hash' : 'height');
  const [searchValue, setSearchValue] = useState(block);
  useEffect(() => { setSearchValue(block); setSearchType(type === 'hash' ? 'hash' : 'height'); }, [block, type]);
  const submitted = block ? { type, value: block } : null;

  const client = useDapi();
  const network = useNetworkStore((s) => s.network);

  const { data, isFetching: isLoading, error, refetch } = useQuery({
    queryKey: ['block', network, submitted?.type, submitted?.value],
    queryFn: async () => {
      if (!submitted) return null;
      if (submitted.type === 'height' ? !/^\d+$/.test(submitted.value) || !Number.isSafeInteger(Number(submitted.value)) : !/^[0-9a-fA-F]{64}$/.test(submitted.value)) throw new Error('Use a non-negative block height or a 64-character hexadecimal hash.');
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
      if (block === searchValue.trim() && type === searchType) void refetch();
      else updateUrl({ block: searchValue.trim(), blockType: searchType });
    }
  };

  return (
    <Card title="Block lookup">
      <form onSubmit={handleSubmit} className="lookup-form space-y-3 mb-4">
        <label htmlFor="block-input">Block height or hash</label>
        <div className="lookup-fields">
          <select aria-label="Find block by"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'height' | 'hash')}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"
          >
            <option value="height">By height</option>
            <option value="hash">By hash</option>
          </select>
          <input
            id="block-input" required pattern={searchType === 'height' ? '[0-9]+' : '[0-9a-fA-F]{64}'}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchType === 'height' ? 'Block height (e.g., 1000)' : 'Block hash'}
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="submit"
            className="lookup-button px-4 py-1.5 rounded text-sm transition-colors"
          >
            Fetch block
          </button>
        </div>
      </form>

      {isLoading && <Reading subject="the block" />}
      {error && !isLoading && <ReadError error={error} subject="the block" />}

      {data && (
        <div className="space-y-3">
          {data.height && <Stat label="Height" value={data.height} />}
          {data.hash && <Stat label="Hash" value={data.hash} mono />}
          <div>
            <dt className="text-xs text-gray-500 mb-2">Raw block data (hex)</dt>
            <pre className="bg-gray-50 rounded p-3 text-xs font-mono overflow-auto max-h-48 break-all">
              {data.raw}
            </pre>
          </div>
        </div>
      )}
    </Card>
  );
}
