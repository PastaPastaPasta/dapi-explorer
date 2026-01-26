import { BlockchainStatus } from '../core/BlockchainStatus';
import { PlatformStatus } from '../platform/PlatformStatus';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BlockchainStatus />
        <PlatformStatus />
      </div>
    </div>
  );
}
