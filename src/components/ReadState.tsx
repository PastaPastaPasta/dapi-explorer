import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Freshness } from "./Freshness";
import { useNetworkStore } from "../store/network";

export function ReadError({
  error,
  subject = "this response",
  onRetry,
}: {
  error: Error;
  subject?: string;
  onRetry?: () => void;
}) {
  const network = useNetworkStore((s) => s.network);
  const endedAt = useMemo(() => Date.now(), [error]);
  const unsupported = /endpoint is not supported|unimplemented/i.test(
    error.message,
  );
  return (
    <div className="dh-error" role="alert">
      <p className="dh-error__title">Couldn’t read {subject} from this node.</p>
      <p className="text-sm mt-1">
        {unsupported
          ? "This node no longer exposes the legacy consensus endpoint. Platform version, sync state and epochs are available above."
          : `${network === "mainnet" ? "Mainnet" : "Testnet"} read unavailable. Other queries remain usable. Retry, or change the network in the bar.`}
      </p>
      <p className="text-xs mt-2">
        Attempt ended at <Freshness value={endedAt} />.
      </p>
      {unsupported ? (
        <a
          className="dh-btn mt-3"
          href={window.dashhq.href("dapi", "/?tab=dashboard", { network })}
        >
          Open current Platform status
        </a>
      ) : (
        onRetry && (
          <button className="mt-3 dh-btn" onClick={onRetry}>
            Try again
          </button>
        )
      )}
      <details className="dh-disclosure mt-3 text-sm">
        <summary>Technical details</summary>
        <pre>{error.message}</pre>
      </details>
    </div>
  );
}

export function Reading({ subject }: { subject: string }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    setSlow(false);
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, [subject]);
  return (
    <p className="dh-loading" role="status">
      <span className="dh-spin" aria-hidden="true" />
      {slow ? `Still reading ${subject} from the network… Other queries remain usable.` : `Reading ${subject} from a node…`}
    </p>
  );
}

export function RefreshFailed({ subject, onRetry }: { subject: string; onRetry?: () => void }) {
  return (
    <p className="dh-meta refresh-failed mb-3" role="status">
      <span>Couldn’t refresh {subject}</span>
      <span>Showing the last successful read, retrying</span>
      {onRetry && <span><button type="button" className="dh-btn dh-btn--sm" onClick={onRetry}>Retry now</button></span>}
    </p>
  );
}

export function ReadBoundary({
  subject,
  loading,
  error,
  hasData = false,
  onRetry,
  children,
}: {
  subject: string;
  loading?: boolean;
  error?: Error | null;
  hasData?: boolean;
  onRetry?: () => void;
  children: ReactNode;
}) {
  if (loading) return <Reading subject={subject} />;
  if (error && !hasData) return <ReadError error={error} subject={subject} onRetry={onRetry} />;
  return (
    <>
      {error && <RefreshFailed subject={subject} onRetry={onRetry} />}
      {children}
    </>
  );
}
