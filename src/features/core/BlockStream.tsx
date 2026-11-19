import { useState, useEffect, useRef, useCallback } from 'react';
import type { BlockHeadersStream } from '@dashevo/dapi-client';
import { Card } from '../../components/Card';
import { useDapi } from '../../hooks/useDapi';
import { useNetworkStore } from '../../store/network';
import { useBestBlockHeight } from '../../hooks/useBlockchainStatus';
import { formatRelativeTime } from '../../lib/format';

interface BlockHeader {
  height: number;
  hash: string;
  timestamp: number;
  chainLocked: boolean;
}

export function BlockStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [blocks, setBlocks] = useState<BlockHeader[]>([]);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<BlockHeadersStream | null>(null);
  const abortRef = useRef(false);

  const client = useDapi();
  const network = useNetworkStore((s) => s.network);
  const { data: currentHeight } = useBestBlockHeight();

  const stopStream = useCallback(() => {
    abortRef.current = true;
    setIsStreaming(false);
    streamRef.current?.cancel();
    streamRef.current = null;
  }, []);

  const startStream = useCallback(async () => {
    if (!currentHeight) return;

    setError(null);
    setIsStreaming(true);
    abortRef.current = false;

    const fail = (err: Error) => {
      if (abortRef.current) return;
      setError(err.message);
      setIsStreaming(false);
    };

    try {
      let nextHeight = Math.max(1, currentHeight - 5);
      let chainLockHeight = 0;
      const stream = await client.core.subscribeToBlockHeadersWithChainLocks({
        fromBlockHeight: nextHeight,
        count: 0,
      });
      if (abortRef.current) {
        stream.cancel();
        return;
      }
      streamRef.current = stream;
      stream.on('error', fail);
      stream.on('end', () => setIsStreaming(false));
      stream.on('data', (response) => {
        if (abortRef.current) return;
        const lock = response.getChainLock_asU8();
        if (lock.length === 132) {
          chainLockHeight = Math.max(chainLockHeight, new DataView(lock.buffer, lock.byteOffset).getUint32(0, true));
          setBlocks((prev) => prev.map((b) => ({ ...b, chainLocked: b.height <= chainLockHeight })));
        }
        const headers = response.getBlockHeaders()?.getHeadersList_asU8() ?? [];
        const firstHeight = nextHeight;
        nextHeight += headers.length;
        Promise.all(
          headers.map(async (header, index) => ({
            height: firstHeight + index,
            hash: await client.core.getBlockHash(firstHeight + index),
            timestamp: new DataView(header.buffer, header.byteOffset).getUint32(68, true),
            chainLocked: firstHeight + index <= chainLockHeight,
          })),
        )
          .then((newBlocks) => {
            if (abortRef.current) return;
            setBlocks((prev) => {
              const combined = [...newBlocks, ...prev];
              const unique = combined.filter(
                (block, index, self) => index === self.findIndex((b) => b.height === block.height),
              );
              return unique.sort((a, b) => b.height - a.height).slice(0, 20);
            });
          })
          .catch(fail);
      });
    } catch (err) {
      fail(err as Error);
    }
  }, [client, currentHeight]);

  useEffect(() => {
    return () => {
      abortRef.current = true;
      streamRef.current?.cancel();
      streamRef.current = null;
    };
  }, [network]);

  return (
    <Card title="Block Stream (Real-time)">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={isStreaming ? stopStream : startStream}
            disabled={!currentHeight}
            className={`px-4 py-1.5 rounded text-sm transition-colors ${
              isStreaming
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-dash-blue text-white hover:bg-dash-dark'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isStreaming ? 'Stop' : 'Start'} Stream
          </button>
          {isStreaming && (
            <span className="flex items-center gap-2 text-sm text-green-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Streaming
            </span>
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 rounded p-3">{error}</div>
        )}

        {blocks.length > 0 && (
          <div className="border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Height</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Hash</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Time</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">ChainLock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {blocks.map((block) => (
                  <tr key={block.height} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono">{block.height}</td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {block.hash.slice(0, 12)}...
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {formatRelativeTime(block.timestamp)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs ${
                          block.chainLocked
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {block.chainLocked ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {blocks.length === 0 && !isStreaming && (
          <p className="text-gray-500 text-sm">Click Start Stream to receive real-time block headers.</p>
        )}
      </div>
    </Card>
  );
}
