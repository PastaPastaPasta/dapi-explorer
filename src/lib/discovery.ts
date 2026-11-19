import { networks, type NetworkType } from './networks.ts';

interface MasternodeEntry {
  address?: string;
  addresses?: { platform_https?: string[] };
  status?: string;
  versionCheck?: string;
  platformHTTPPort?: number;
}

export function evonodeAddresses(entries: MasternodeEntry[]): string[] {
  const addresses = new Set<string>();
  for (const entry of entries) {
    if (entry.status !== 'ENABLED' || entry.versionCheck !== 'success') continue;
    const https = entry.addresses?.platform_https?.[0];
    const host = entry.address?.replace(/:\d+$/, '');
    const address = https ?? (host && entry.platformHTTPPort ? `${host}:${entry.platformHTTPPort}` : undefined);
    if (address && !address.startsWith('[')) addresses.add(address);
  }
  return [...addresses];
}

export async function discoverEvonodes(network: NetworkType, timeoutMs = 5000): Promise<string[]> {
  const response = await fetch(networks[network].masternodeListUrl, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) throw new Error(`Masternode list returned HTTP ${response.status}`);
  const body = (await response.json()) as { data?: MasternodeEntry[] };
  return evonodeAddresses(body.data ?? []);
}
