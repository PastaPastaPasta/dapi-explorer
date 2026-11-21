import { HashValue } from '../../components/HashValue';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ReadError, Reading } from '../../components/ReadState';
import { Card } from '../../components/Card';
import { useDapi } from '../../hooks/useDapi';
import { useNetworkStore } from '../../store/network';
import { useBestBlockHeight } from '../../hooks/useBlockchainStatus';
import { headerTimestamp } from '../../lib/block-freshness';
import { formatRelativeTime } from '../../lib/format';
import type { BlockHeadersStream } from '@dashevo/dapi-client';

interface BlockHeader {
  height: number;
  hash: string;
  timestamp: number;
  chainLocked: boolean;
}

export function BlockStream({ ticker = false, autoStart = false }: { ticker?: boolean; autoStart?: boolean }) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [blocks, setBlocks] = useState<BlockHeader[]>([]);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<BlockHeadersStream | null>(null);
  const generation = useRef(0);
  const autoStarted = useRef(false);
  const [, refreshAge] = useState(0);

  const client = useDapi();
  const network = useNetworkStore((s) => s.network);
  const { data: currentHeight, isLoading: heightLoading, error: heightError, refetch: retryHeight } = useBestBlockHeight();

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
    let nextHeight = Math.max(1, currentHeight - (ticker ? 11 : 5));
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
        if (lock.length === 132) {
          chainLockHeight = Math.max(chainLockHeight, new DataView(lock.buffer, lock.byteOffset, lock.byteLength).getUint32(0, true));
          setBlocks(previous => previous.map(block => ({ ...block, chainLocked: block.chainLocked || block.height <= chainLockHeight })));
        }
        const headers = response.getBlockHeaders()?.getHeadersList_asU8() ?? [];
        const firstHeight = nextHeight;
        nextHeight += headers.length;
        void Promise.all(headers.map(async (header, index) => {
          const height = firstHeight + index;
          const hash = await client.core.getBlockHash(height);
          const timestamp = headerTimestamp(header);
          return { height, hash, timestamp };
        })).then(batch => {
          if (generation.current !== run) return;
          const locked = batch.map(block => ({ ...block, chainLocked: block.height <= chainLockHeight }));
          setBlocks(previous => [...locked, ...previous].filter((block, index, all) => index === all.findIndex(other => other.height === block.height)).sort((a, b) => b.height - a.height).slice(0, ticker ? 12 : 20));
        }).catch(fail);
      });
    } catch (err) { fail(err instanceof Error ? err : new Error(String(err))); }
  }, [client, currentHeight, stopStream, ticker]);

  useEffect(() => {
    setBlocks([]);
    autoStarted.current = false;
    return stopStream;
  }, [network, stopStream]);

  useEffect(() => {
    if (autoStart && currentHeight && !autoStarted.current) {
      autoStarted.current = true;
      void startStream();
    }
  }, [autoStart, currentHeight, startStream]);

  useEffect(() => {
    const timer = window.setInterval(() => refreshAge(value => value + 1), 10000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Card title={ticker ? "Latest 12 Core blocks" : "Live block stream"} method="subscribeToBlockHeadersWithChainLocks" className={ticker ? 'block-ticker' : ''}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Newest blocks first · Core headers do not include a Platform proposer.</p>
        <div className="flex items-center gap-3">
          <button
            onClick={isStreaming ? stopStream : startStream}
            disabled={!currentHeight}
            className="dh-btn"
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

        {heightLoading && <Reading subject="the starting block height" />}
        {heightError && <ReadError error={heightError} subject="the starting block height" onRetry={() => void retryHeight()} />}
        {error && <ReadError error={new Error(error)} subject="the block stream" onRetry={() => void startStream()} />}

        {ticker && blocks.length > 0 && (
          <>
            <div className="block-ticker__labels"><span>Block height</span><span>Age · ChainLock</span></div>
            <ol className="block-ticker__list">
              {blocks.map(block => (
                <li key={block.height}>
                  <span className="block-ticker__tile" aria-hidden="true">BLK</span>
                  <div><strong>{block.height.toLocaleString()}</strong><small>Proposer: not in Core headers</small></div>
                  <div className="block-ticker__age">{formatRelativeTime(block.timestamp)}<small>{block.chainLocked ? 'ChainLocked' : 'No ChainLock reported'}</small></div>
                </li>
              ))}
            </ol>
          </>
        )}
        {!ticker && blocks.length > 0 && (
          <div className="border border-gray-200 rounded overflow-hidden">
            <table className="dh-table dh-table--cards">
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
                    <td data-label="Height" className="dh-rc-title">{block.height}</td>
                    <td data-label="Hash" className="px-3 py-2 font-mono text-xs">
                      <HashValue value={block.hash} label="Block hash" />
                    </td>
                    <td data-label="Time" className="px-3 py-2 text-gray-600">
                      {formatRelativeTime(block.timestamp)}
                    </td>
                    <td data-label="ChainLock" className="px-3 py-2">
                      <span
                        className={`dh-badge ${
                          block.chainLocked
                            ? 'dh-badge--good'
                            : 'dh-badge--outline'
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

        {blocks.length === 0 && isStreaming && !error && <Reading subject="the latest block headers" />}
        {blocks.length === 0 && !isStreaming && (
          <p className="dh-empty dh-empty--inline">Start the stream to receive real-time block headers.</p>
        )}
      </div>
    </Card>
  );
}
