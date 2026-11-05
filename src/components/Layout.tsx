import { useEffect, useRef, type ReactNode } from 'react';
import { useNetworkStore } from '../store/network';
import type { DashhqNetworkEventDetail } from '../../public/dashhq/dashhq-shell';
import type {} from '../../public/dashhq/dashhq-shell.react';

interface LayoutProps {
  children: ReactNode;
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function Layout({ children, tabs, activeTab, onTabChange }: LayoutProps) {
  const bar = useRef<HTMLElement>(null);
  const { network, setNetwork } = useNetworkStore();
  useEffect(() => {
    const element = bar.current!;
    const change = (event: Event) => {
      event.preventDefault();
      const { network: next } = (event as CustomEvent<DashhqNetworkEventDetail>).detail;
      if (next === 'mainnet' || next === 'testnet') setNetwork(next);
    };
    element.addEventListener('dashhq-network', change);
    return () => element.removeEventListener('dashhq-network', change);
  }, [setNetwork]);

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <dashhq-bar ref={bar} product="dapi" network={network} networks="mainnet testnet" sticky="">
      <nav slot="nav" aria-label="DAPI console">
        {tabs.map(tab => {
          const url = new URL(window.location.href);
          url.searchParams.set('tab', tab.id);
          return <a key={tab.id} href={url.pathname + url.search} aria-current={activeTab === tab.id ? 'page' : undefined}
            onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) { event.preventDefault(); onTabChange(tab.id); } }}>{tab.label}</a>;
        })}
      </nav>
    </dashhq-bar>
    <main id="main" className="app-main">
      <div className="page-intro">
        <p className="tool-links"><a href={window.dashhq.href('explorer', '/', { network })}>Explorer</a><span>/</span><span>Tools</span><a href={window.dashhq.href('fees', '/?network=' + network)}>Fee estimator →</a></p>
        <h1>DAPI console</h1>
        <p>Read Core and Platform directly from a node. Responses are diagnostic data. Open Explorer for proof verification details.</p>
      </div>
      {children}
    </main>
    <dashhq-footer product="dapi" source="https://github.com/PastaPastaPasta/dapi-explorer">
      <p>Public, read-only queries. <a href={window.dashhq.href('explorer', '/', { network })}>Open Explorer</a> · <a href={window.dashhq.href('fees', '/?network=' + network)}>Estimate contract fees</a></p>
    </dashhq-footer>
  </>;
}
