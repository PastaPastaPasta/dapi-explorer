import { useNetworkStore } from '../store/network';
import { networks, type NetworkType } from '../lib/networks';

export function NetworkSelector() {
  const { network, setNetwork } = useNetworkStore();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Network:</span>
      <select
        value={network}
        onChange={(e) => setNetwork(e.target.value as NetworkType)}
        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-dash-blue focus:border-transparent"
      >
        {Object.values(networks).map((net) => (
          <option key={net.network} value={net.network}>
            {net.label}
          </option>
        ))}
      </select>
    </div>
  );
}
