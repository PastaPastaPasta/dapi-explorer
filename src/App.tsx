import { useUrlParam } from './lib/location';
import { Layout } from './components/Layout';
import { Dashboard } from './features/dashboard/Dashboard';
import { BlockchainStatus } from './features/core/BlockchainStatus';
import { BlockExplorer } from './features/core/BlockExplorer';
import { TransactionLookup } from './features/core/TransactionLookup';
import { BlockStream } from './features/core/BlockStream';
import { PlatformStatus } from './features/platform/PlatformStatus';
import { IdentityLookup } from './features/platform/IdentityLookup';
import { DataContractViewer } from './features/platform/DataContractViewer';
import { EpochInfo } from './features/platform/EpochInfo';

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'core', label: 'Core' },
  { id: 'platform', label: 'Platform' },
  { id: 'stream', label: 'Live stream' },
];

function App() {
  const [identity] = useUrlParam('identity');
  const [tab, setTab] = useUrlParam('tab', identity ? 'platform' : 'dashboard');
  const activeTab = tabs.some((item) => item.id === tab) ? tab : 'dashboard';

  return (
    <Layout tabs={tabs} activeTab={activeTab} onTabChange={setTab}>
      {activeTab === 'dashboard' && <Dashboard />}

      {activeTab === 'core' && (
        <div className="space-y-6">
          <BlockchainStatus />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BlockExplorer />
            <TransactionLookup />
          </div>
        </div>
      )}

      {activeTab === 'platform' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IdentityLookup />
            <DataContractViewer />
          </div>
          <EpochInfo />
          <details className="dh-disclosure" id="platform-diagnostics">
            <summary>Platform node diagnostics</summary>
            <PlatformStatus />
          </details>
        </div>
      )}

      {activeTab === 'stream' && (
        <div className="space-y-6">
          <BlockStream />
        </div>
      )}
    </Layout>
  );
}

export default App;
