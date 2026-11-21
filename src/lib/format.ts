export function formatTimestamp(
  timestamp: number | bigint | string,
  unit: 'seconds' | 'milliseconds' = 'seconds',
): string {
  const numeric = typeof timestamp !== 'string' || /^\d+$/.test(timestamp);
  const date = new Date(
    numeric ? Number(timestamp) * (unit === 'seconds' ? 1000 : 1) : String(timestamp),
  );
  return Number.isNaN(date.getTime())
    ? 'Unavailable'
    : new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      }).format(date) + ' UTC';
}

export function formatRelativeTime(timestamp: number | string): string {
  const date = new Date(typeof timestamp === 'string' ? timestamp : timestamp * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function formatNumber(num: number | bigint | string): string {
  const n = typeof num === 'bigint' ? num : BigInt(Math.floor(Number(num)));
  return n.toLocaleString();
}

export function formatCredits(credits: bigint | number | string): string {
  const value = typeof credits === 'bigint' ? credits : BigInt(credits);
  const dash = Number(value) / 100_000_000_000;
  return `${dash.toFixed(4)} DASH (${formatNumber(value)} credits)`;
}

export function truncateHash(hash: string, chars = 8): string {
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatDash(credits: bigint | number | string): string {
  const value = BigInt(credits);
  const whole = value / 100_000_000_000n;
  const fraction = (value % 100_000_000_000n).toString().padStart(11, '0').slice(0, 8).replace(/0+$/, '');
  return `${whole.toLocaleString('en-US')}${fraction ? '.' + fraction : ''}`;
}

export function creditValue(value: unknown): bigint | null {
  if (typeof value !== 'bigint' && typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'number' && !Number.isSafeInteger(value)) return null;
  if (typeof value === 'string' && !/^\d+$/.test(value)) return null;
  try { const parsed = BigInt(value); return parsed >= 0n ? parsed : null; } catch { return null; }
}

export function hashText(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (value instanceof Uint8Array || (Array.isArray(value) && value.length > 0 && value.every(byte => Number.isInteger(byte) && byte >= 0 && byte <= 255))) {
    return Array.from(value as Uint8Array).map(byte => byte.toString(16).padStart(2, '0')).join('') || null;
  }
  return null;
}
