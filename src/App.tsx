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
          {identity ? (
            <>
              <p className="handoff-note">
                Identity response · {identity}. This read-only lookup uses the selected network.{' '}
                <a href="#platform-diagnostics">Other Platform diagnostics ↓</a>
              </p>
              <IdentityLookup />
              <details id="platform-diagnostics">
                <summary>Platform status, contracts and epochs</summary>
                <div className="space-y-6">
                  <PlatformStatus />
                  <DataContractViewer />
                  <EpochInfo />
                </div>
              </details>
            </>
          ) : (
            <>
              <PlatformStatus />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IdentityLookup />
                <DataContractViewer />
              </div>
              <EpochInfo />
            </>
          )}
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
