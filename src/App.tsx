import { useState } from 'react';
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
  { id: 'core', label: 'Core (L1)' },
  { id: 'platform', label: 'Platform (L2)' },
  { id: 'stream', label: 'Live Stream' },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Layout tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
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
          <PlatformStatus />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IdentityLookup />
            <DataContractViewer />
          </div>
          <EpochInfo />
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
