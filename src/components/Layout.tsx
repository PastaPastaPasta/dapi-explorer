import { useEffect, useRef, type ReactNode } from "react";
import { useNetworkStore } from "../store/network";
import type { DashhqNetworkEventDetail } from "../../public/dashhq/dashhq-shell";
import type {} from "../../public/dashhq/dashhq-shell.react";

interface LayoutProps {
  children: ReactNode;
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function Layout({
  children,
  tabs,
  activeTab,
  onTabChange,
}: LayoutProps) {
  const bar = useRef<HTMLElement>(null);
  const { network, setNetwork } = useNetworkStore();
  useEffect(() => {
    const element = bar.current!;
    const change = (event: Event) => {
      event.preventDefault();
      const { network: next } = (event as CustomEvent<DashhqNetworkEventDetail>)
        .detail;
      if (next === "mainnet" || next === "testnet") setNetwork(next);
    };
    element.addEventListener("dashhq-network", change);
    return () => element.removeEventListener("dashhq-network", change);
  }, [setNetwork]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <dashhq-bar
        ref={bar}
        product="dapi"
        product-href={window.dashhq.href("dapi", "/", { network })}
        network={network}
        networks="mainnet testnet"
        sticky=""
      >
        <nav slot="nav" aria-label="DAPI console sections">
          {tabs.map((tab) => {
            const url = new URL(window.location.href);
            url.searchParams.set("tab", tab.id);
            return (
              <a
                key={tab.id}
                href={url.pathname + url.search}
                aria-current={activeTab === tab.id ? "page" : undefined}
                onClick={(event) => {
                  if (
                    !event.ctrlKey &&
                    !event.metaKey &&
                    !event.shiftKey &&
                    !event.altKey &&
                    event.button === 0
                  ) {
                    event.preventDefault();
                    onTabChange(tab.id);
                  }
                }}
              >
                {tab.label}
              </a>
            );
          })}
        </nav>
      </dashhq-bar>
      <main id="main" className="dh-container dh-page">
        <header className="dh-page-header console-header">
          <h1 className="dh-h1">
            {activeTab === "dashboard"
              ? "Read a node’s status"
              : activeTab === "core"
                ? "Inspect Core data"
                : activeTab === "platform"
                  ? "Look up Platform data"
                  : "Follow new Core blocks"}
          </h1>
          <p className="dh-page-header__lede">
            {activeTab === "dashboard"
              ? "Check Core and Platform responses from a node, then inspect an identity, contract or block."
              : activeTab === "core"
                ? "Find a block or transaction and inspect its response."
                : activeTab === "platform"
                  ? "Read an identity, contract or epoch from the selected network."
                  : "Watch the latest block height as this node reports it."}
          </p>
          <p className="dh-meta console-source">
            <span>Source: DAPI nodes</span><span>Read-only</span><span>Not proof-checked</span>
            <a href={window.dashhq.href("explorer", "/", { network })}>
              Verify records in Explorer →
            </a>
          </p>
        </header>
        {children}
      </main>
      <dashhq-footer
        product="dapi"
        source="https://github.com/PastaPastaPasta/dapi-explorer"
      >
        <span>
          Public, read-only queries.{" "}
          <a href={window.dashhq.href("explorer", "/", { network })}>
            Open Explorer
          </a>{" "}
          ·{" "}
          <a href={window.dashhq.href("explorer", "/tools/fees/", { network })}>
            Fee estimator
          </a>
        </span>
      </dashhq-footer>
    </>
  );
}
