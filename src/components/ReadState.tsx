import { useMemo } from "react";
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
  return (
    <p className="dh-loading" role="status">
      <span className="dh-spin" aria-hidden="true" />
      Reading {subject} from a node…
    </p>
  );
}
