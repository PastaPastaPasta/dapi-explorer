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
      <form onSubmit={handleSubmit} className="dh-field mb-4">
        <label className="dh-field__label" htmlFor="block-input">Block height or hash</label>
        <div className="dh-inline-form">
          <select aria-label="Find block by"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'height' | 'hash')}
            className="dh-select"
          >
            <option value="height">By height</option>
            <option value="hash">By hash</option>
          </select>
          <input
            id="block-input" aria-describedby="block-input-help" required pattern={searchType === 'height' ? '[0-9]+' : '[0-9a-fA-F]{64}'}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchType === 'height' ? 'Block height (e.g., 1000)' : 'Block hash'}
            className="dh-input dh-input--mono flex-1"
          />
          <button
            type="submit"
            className="dh-btn dh-btn--primary"
          >
            Fetch block
          </button>
        </div>
        <p className="dh-field__help" id="block-input-help">Use a block height or a 64-character hexadecimal hash.</p>
      </form>

      {isLoading && <Reading subject="the block" />}
      {error && !isLoading && <ReadError error={error} subject="the block" />}

      {data && (
        <div className="space-y-3">
          {data.height && <dl className="dh-stats"><Stat label="Height" value={data.height} /></dl>}
          {data.hash && <dl className="dh-stats"><Stat label="Hash" value={data.hash} mono /></dl>}
          <div>
            <p className="text-xs text-gray-500 mb-2">Raw block data (hex)</p>
            <pre className="bg-gray-50 rounded p-3 text-xs font-mono overflow-auto max-h-48 break-all">
              {data.raw}
            </pre>
          </div>
        </div>
      )}
    </Card>
  );
}
