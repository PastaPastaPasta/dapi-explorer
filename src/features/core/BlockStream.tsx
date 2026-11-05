import { useState, useEffect, useRef, useCallback } from 'react';
import { ReadError } from '../../components/ReadState';
import { Card } from '../../components/Card';
import { useDapi } from '../../hooks/useDapi';
import { useNetworkStore } from '../../store/network';
import { useBestBlockHeight } from '../../hooks/useBlockchainStatus';
import { formatRelativeTime } from '../../lib/format';
import type { BlockHeaderStream } from '@dashevo/dapi-client';

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
  const streamRef = useRef<BlockHeaderStream | null>(null);
  const generation = useRef(0);

  const client = useDapi();
  const network = useNetworkStore((s) => s.network);
  const { data: currentHeight } = useBestBlockHeight();

  const stopStream = useCallback(() => {
    generation.current++;
    const stream = streamRef.current;
    streamRef.current = null;
    stream?.cancel();
    setIsStreaming(false);
  }, []);

  const startStream = useCallback(async () => {
    if (!currentHeight) return;
    const run = ++generation.current;
    setError(null);
    setIsStreaming(true);
    let nextHeight = Math.max(1, currentHeight - 5);
    let chainLockHeight = 0;
    const fail = (err: Error) => {
      if (generation.current !== run) return;
      setError(err.message);
      stopStream();
    };

    try {
      const stream = await client.core.subscribeToBlockHeadersWithChainLocks({ fromBlockHeight: nextHeight, count: 0 });
      if (generation.current !== run) { stream.cancel(); return; }
      streamRef.current = stream;
      stream.on('error', fail);
      stream.on('end', () => { if (generation.current === run) stopStream(); });
      stream.on('data', (response) => {
        if (generation.current !== run) return;
        const lock = response.getChainLock_asU8();
        if (lock.length >= 4) {
          chainLockHeight = Math.max(chainLockHeight, new DataView(lock.buffer, lock.byteOffset, lock.byteLength).getUint32(0, true));
          setBlocks(previous => previous.map(block => ({ ...block, chainLocked: block.chainLocked || block.height <= chainLockHeight })));
        }
        const headers = response.getBlockHeaders()?.getHeadersList_asU8() ?? [];
        const firstHeight = nextHeight;
        nextHeight += headers.length;
        void Promise.all(headers.map(async (header, index) => {
          if (header.length < 80) throw new Error('The node returned an incomplete block header.');
          const height = firstHeight + index;
          const hash = await client.core.getBlockHash(height);
          const timestamp = new DataView(header.buffer, header.byteOffset, header.byteLength).getUint32(68, true);
          return { height, hash, timestamp, chainLocked: height <= chainLockHeight };
        })).then(batch => {
          if (generation.current !== run) return;
          setBlocks(previous => [...batch, ...previous].filter((block, index, all) => index === all.findIndex(other => other.height === block.height)).sort((a, b) => b.height - a.height).slice(0, 20));
        }).catch(fail);
      });
    } catch (err) { fail(err instanceof Error ? err : new Error(String(err))); }
  }, [client, currentHeight, stopStream]);

  useEffect(() => {
    setBlocks([]);
    return stopStream;
  }, [network, stopStream]);

  return (
    <Card title="Live block stream">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Block hashes and ChainLock status are reported by the node. They are not proof-verified here.</p>
        <div className="flex items-center gap-3">
          <button
            onClick={isStreaming ? stopStream : startStream}
            disabled={!currentHeight}
            className="lookup-button px-4 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming ? 'Stop' : 'Start'} stream
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
          <p className="text-gray-500 text-sm">Start the stream to receive real-time block headers.</p>
        )}
      </div>
    </Card>
  );
}
