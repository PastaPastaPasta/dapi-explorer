import { useSyncExternalStore } from 'react';

const subscribe = (notify: () => void) => {
  window.addEventListener('popstate', notify);
  return () => window.removeEventListener('popstate', notify);
};

export function useUrlParam(key: string, fallback = ''): [string, (value: string) => void] {
  const search = useSyncExternalStore(subscribe, () => window.location.search);
  return [new URLSearchParams(search).get(key) ?? fallback, (value) => updateUrl({ [key]: value })];
}

export function updateUrl(values: Record<string, string>) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  if (url.href === window.location.href) return;
  window.history.pushState(null, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
