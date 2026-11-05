import { useState, useEffect, useRef, useCallback } from 'react';
import { ReadError } from '../../components/ReadState';
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
  const streamRef = useRef<AsyncIterable<unknown> | null>(null);
  const abortRef = useRef(false);

  const client = useDapi();
  const network = useNetworkStore((s) => s.network);
  const { data: currentHeight } = useBestBlockHeight();

  const stopStream = useCallback(() => {
    abortRef.current = true;
    setIsStreaming(false);
    streamRef.current = null;
  }, []);

  const startStream = useCallback(async () => {
    if (!currentHeight) return;

    setError(null);
    setIsStreaming(true);
    abortRef.current = false;

    try {
      const fromHeight = Math.max(1, currentHeight - 5);
      const stream = await client.core.subscribeToBlockHeadersWithChainLocks({
        fromBlockHeight: fromHeight,
        count: 0,
      });

      streamRef.current = stream;

      for await (const response of stream) {
        if (abortRef.current) break;

        const res = response as {
          blockHeaders?: Array<{
            hash: Uint8Array;
            height: number;
            timestamp: number;
          }>;
          chainLock?: { height: number };
        };

        if (res.blockHeaders) {
          const newBlocks = res.blockHeaders.map((header) => ({
            height: header.height,
            hash: Array.from(header.hash)
              .map((b) => b.toString(16).padStart(2, '0'))
              .join(''),
            timestamp: header.timestamp,
            chainLocked: res.chainLock ? res.chainLock.height >= header.height : false,
          }));

          setBlocks((prev) => {
            const combined = [...newBlocks, ...prev];
            const unique = combined.filter(
              (block, index, self) =>
                index === self.findIndex((b) => b.height === block.height)
            );
            return unique.sort((a, b) => b.height - a.height).slice(0, 20);
          });
        }
      }
    } catch (err) {
      if (!abortRef.current) {
        setError((err as Error).message);
        setIsStreaming(false);
      }
    }
  }, [client, currentHeight]);

  useEffect(() => {
    return () => {
      stopStream();
      setBlocks([]);
    };
  }, [network, stopStream]);

  return (
    <Card title="Live block stream">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={isStreaming ? stopStream : startStream}
            disabled={!currentHeight}
            className="lookup-button px-4 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming ? 'Stop' : 'Start'} Stream
          </button>
          {isStreaming && (
            <span className="flex items-center gap-2 text-sm text-green-600">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Streaming
            </span>
          )}
        </div>

        {error && (
          <ReadError error={new Error(error)} subject="the block stream" />
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
                    <td data-label="Height" className="px-3 py-2 font-mono">{block.height}</td>
                    <td data-label="Hash" className="px-3 py-2 font-mono text-xs">
                      <dashhq-hash value={block.hash} label="Block hash" />
                    </td>
                    <td data-label="Time" className="px-3 py-2 text-gray-600">
                      {formatRelativeTime(block.timestamp)}
                    </td>
                    <td data-label="ChainLock" className="px-3 py-2">
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
