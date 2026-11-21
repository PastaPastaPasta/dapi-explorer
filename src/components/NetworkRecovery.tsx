import { useQuery } from '@tanstack/react-query';
import { useNetworkStore } from '../store/network';
import { platformRead } from '../lib/platform';
import { identifierToBase58, identifierToBytes } from '../lib/identifier';

export function NetworkRecovery({ kind, id }: { kind: 'identity' | 'contract'; id: string }) {
  const network = useNetworkStore((s) => s.network);
  const other = network === 'mainnet' ? 'testnet' : 'mainnet';
  const probe = useQuery({
    queryKey: ['network-recovery', kind, other, id],
    queryFn: () => platformRead(other, async (reader) => {
      const bytes = identifierToBytes(id);
      return !!(await (kind === 'identity' ? reader.identity(bytes) : reader.contract(bytes)));
    }),
    retry: false,
    staleTime: 60000,
  });
  const url = new URL(window.location.href);
  const href = window.dashhq.href('dapi', url.pathname + url.search, { network: other });
  url.searchParams.delete(kind);
  url.searchParams.set('tab', 'platform');
  const listHref = window.dashhq.href('dapi', url.pathname + url.search, { network });
  const base58 = identifierToBase58(id);
  return <dashhq-not-found thing={kind} id-label="ID" network={network}
    found={probe.isPending || probe.isFetching ? undefined : probe.isError ? 'unknown' : probe.data ? other : 'none'}
    href={href} list-href={listHref}
    list-label={`Search ${network === 'mainnet' ? 'Mainnet' : 'Testnet'}`}>
    <p><dashhq-hash value={base58} label={`${kind} ID`} full="">{base58}</dashhq-hash></p>
  </dashhq-not-found>;
}
