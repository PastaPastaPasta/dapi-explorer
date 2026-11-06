export async function withDeadline<T>(request: Promise<T>, timeoutMs = 18000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([
      request,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('The node did not answer within 18 seconds. Retry to discover another node.')), timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer!);
  }
}

export function coreHealth(status: string | undefined): { label: string; tone: string } {
  if (status === 'READY') return { label: 'Reachable', tone: 'good' };
  if (status === 'ERROR') return { label: 'Health error', tone: 'warn' };
  if (status === 'SYNCING') return { label: 'Syncing', tone: 'warn' };
  return { label: 'Health unknown', tone: 'info' };
}

export function coreVerdict(status: string | undefined, syncProgress: number | undefined): string {
  if (status === 'ERROR') return `Node reports ERROR${syncProgress !== undefined && syncProgress >= 1 ? ' while fully synced' : ''}. This is one node’s health report; see the raw response.`;
  if (status === 'READY') return 'Node reports ready. Responses have not been proof-checked.';
  return `Node reports ${status ?? 'no health status'}. See the raw response.`;
}
