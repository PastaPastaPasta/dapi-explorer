import { BlockchainStatus } from '../core/BlockchainStatus';
import { PlatformStatus } from '../platform/PlatformStatus';
import { BlockStream } from '../core/BlockStream';

export function Dashboard() {
  return (
    <div className="dashboard-grid">
      <div className="space-y-6 dashboard-diagnostics">
        <BlockchainStatus />
        <PlatformStatus />
      </div>
      <BlockStream ticker autoStart />
    </div>
  );
}
