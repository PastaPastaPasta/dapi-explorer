import { useEffect, useRef, type ReactNode } from "react";
import { StatusTiles } from "../features/dashboard/StatusTiles";
import { useNetworkStore } from "../store/network";
import type { DashhqNetworkEventDetail } from "../../public/dashhq/dashhq-shell";
import type {} from "../../public/dashhq/dashhq-shell.react";

const tabIcons: Record<string, string> = {
  dashboard: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  core: "M12 3l9 5v8l-9 5-9-5V8z M3 8l9 5 9-5 M12 13v8",
  platform: "M12 3l10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5",
  stream: "M4 20V12 M9 20V4 M14 20V9 M19 20V2",
};

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

  useEffect(() => {
    const preserveScroll = () => {
      const top = window.scrollY;
      requestAnimationFrame(() => {
        if (window.scrollY !== top) window.scrollTo({ top, left: 0, behavior: "instant" });
      });
    };
    document.addEventListener("dashhq-theme", preserveScroll);
    return () => document.removeEventListener("dashhq-theme", preserveScroll);
  }, []);

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
        phone-nav="tabs"
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
                <span className="dh-nav-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d={tabIcons[tab.id]} />
                  </svg>
                </span>
                {tab.label}
              </a>
            );
          })}
        </nav>
      </dashhq-bar>
      <main id="main" className="console-main">
        <div className={activeTab === "dashboard" ? "console-band" : ""}>
          <div className="dh-container dh-page console-heading">
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
          {activeTab === "dashboard" && <StatusTiles />}
          </div>
        </div>
        <div className="dh-container console-content">{children}</div>
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
