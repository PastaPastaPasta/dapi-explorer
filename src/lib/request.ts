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

export function coreHealth(status: string | undefined): { label: string; className: string } {
  if (status === 'READY') return { label: 'Reachable', className: 'text-green-600' };
  if (status === 'ERROR') return { label: 'Health error', className: 'text-yellow-600' };
  if (status === 'SYNCING') return { label: 'Syncing', className: 'text-yellow-600' };
  return { label: 'Health unknown', className: 'text-gray-500' };
}
