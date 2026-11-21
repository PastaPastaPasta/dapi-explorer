export function blockTimestamp(value: string | number | bigint | undefined): number | null {
  if (value === undefined || value === '') return null;
  const timestamp = typeof value !== 'string' || /^\d+$/.test(value)
    ? Number(value) * (Number(value) < 1e11 ? 1000 : 1)
    : Date.parse(value);
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
}

export function blockFreshness(timestamp: number | null, targetSeconds: number, now: number, failed = false) {
  if (failed || timestamp === null || timestamp > now) return 'unknown';
  return now - timestamp <= targetSeconds * 2000 ? 'good' : 'warn';
}

export function headerTimestamp(header: Uint8Array): number {
  if (header.length < 80) throw new Error('The node returned an incomplete block header.');
  return new DataView(header.buffer, header.byteOffset, header.byteLength).getUint32(68, true);
}
