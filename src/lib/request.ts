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
