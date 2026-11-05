import { useMemo } from 'react';
import { useNetworkStore } from '../store/network';

export function ReadError({ error, subject = 'this response', onRetry }: { error: Error; subject?: string; onRetry?: () => void }) {
  const network = useNetworkStore((s) => s.network);
  const endedAt = useMemo(() => new Date().toISOString().slice(11, 19), [error]);
  const unsupported = /endpoint is not supported|unimplemented/i.test(error.message);
  return <div className="read-error" role="alert">
    <p className="font-medium">Couldn’t read {subject} from this node.</p>
    <p className="text-sm mt-1">{unsupported ? 'This node no longer exposes the legacy consensus endpoint. Platform version, sync state and epochs are available above.' : `${network === 'mainnet' ? 'Mainnet' : 'Testnet'} read unavailable. Other queries remain usable. Retry, or change the network in the bar.`}</p>
    <p className="text-xs mt-2">Attempt ended at {endedAt} UTC.</p>
    {onRetry && <button className="mt-3 lookup-button" onClick={onRetry}>Try again</button>}
    <details className="mt-3 text-sm"><summary>Technical details</summary><pre>{error.message}</pre></details>
  </div>;
}

export function Reading({ subject }: { subject: string }) {
  return <p className="reading" role="status"><span className="spinner" aria-hidden="true" />Reading {subject} from a node…</p>;
}
