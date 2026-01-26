// Polyfill process.nextTick for browser compatibility
if (typeof globalThis.process === 'undefined') {
  (globalThis as unknown as { process: unknown }).process = {
    env: {},
    nextTick: (fn: () => void, ...args: unknown[]) => {
      setTimeout(() => fn(...(args as [])), 0);
    },
    version: '',
    versions: {},
    platform: 'browser',
    browser: true,
  };
} else if (typeof globalThis.process.nextTick !== 'function') {
  globalThis.process.nextTick = (fn: () => void, ...args: unknown[]) => {
    setTimeout(() => fn(...(args as [])), 0);
  };
}

// Ensure Buffer is available globally
import { Buffer } from 'buffer';
(globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;

export {};
