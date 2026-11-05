export function ReadError({ error, subject = 'this response' }: { error: Error; subject?: string }) {
  const sdkMismatch = error.message.includes('getTotalSyncedTime');
  return <div className="read-error" role="alert">
    <p className="font-medium">Couldn’t read {subject} from this node.</p>
    <p className="text-sm mt-1">{sdkMismatch ? 'The installed DAPI SDK cannot decode this node’s status response. Other queries are still available.' : 'Check the input and network, or try again shortly.'}</p>
    <details className="mt-3 text-sm"><summary>Technical details</summary><pre>{error.message}</pre></details>
  </div>;
}

export function Reading({ subject }: { subject: string }) {
  return <p className="reading" role="status"><span className="spinner" aria-hidden="true" />Reading {subject} from a node…</p>;
}
