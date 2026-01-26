import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util', 'events', 'assert', 'path', 'os', 'url', 'http', 'https', 'zlib', 'fs', 'vm', 'process'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  base: './',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 15000,
  },
});
