export function formatTimestamp(timestamp: number | bigint | string, unit: 'seconds' | 'milliseconds' = 'seconds'): string {
  const numeric = typeof timestamp !== 'string' || /^\d+$/.test(timestamp);
  const date = new Date(numeric ? Number(timestamp) * (unit === 'seconds' ? 1000 : 1) : String(timestamp));
  return Number.isNaN(date.getTime()) ? 'Unavailable' : date.toLocaleString();
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
