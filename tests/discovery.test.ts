import { test } from 'node:test';
import assert from 'node:assert/strict';
import DAPIClient from '@dashevo/dapi-client';
import { evonodeAddresses, discoverEvonodes } from '../src/lib/discovery.ts';
import { DiscoveringAddressProvider } from '../src/lib/addressProvider.ts';
import { networks, type NetworkType } from '../src/lib/networks.ts';

test('keeps only enabled evonodes that pass the version check', () => {
  const found = evonodeAddresses([
    { status: 'ENABLED', versionCheck: 'success', addresses: { platform_https: ['1.2.3.4:443'] } },
    { status: 'ENABLED', versionCheck: 'success', address: '5.6.7.8:9999', platformHTTPPort: 1443 },
    { status: 'ENABLED', versionCheck: 'fail', addresses: { platform_https: ['9.9.9.9:443'] } },
    { status: 'POSE_BANNED', versionCheck: 'success', addresses: { platform_https: ['8.8.8.8:443'] } },
    { status: 'ENABLED', versionCheck: 'success', address: '[::]:0' },
  ]);
  assert.deepEqual(found, ['1.2.3.4:443', '5.6.7.8:1443']);
});

const empty = new Uint8Array([0, 0, 0, 0, 0]);

async function answersGrpcWeb(address: string): Promise<boolean> {
  try {
    const response = await fetch(`https://${address}/org.dash.platform.dapi.v0.Core/getBlockchainStatus`, {
      method: 'POST',
      headers: { 'content-type': 'application/grpc-web+proto', 'x-grpc-web': '1' },
      body: empty,
      signal: AbortSignal.timeout(8000),
    });
    return response.ok && (await response.arrayBuffer()).byteLength > 5;
  } catch {
    return false;
  }
}

for (const network of Object.keys(networks) as NetworkType[]) {
  test(`${network}: discovery finds evonodes that answer grpc-web`, async () => {
    const found = await discoverEvonodes(network, 15000);
    assert.ok(found.length >= 5, `only ${found.length} evonodes discovered`);
    const sample = found.sort(() => Math.random() - 0.5).slice(0, 5);
    const answers = await Promise.all(sample.map(answersGrpcWeb));
    assert.ok(answers.some(Boolean), `none of ${sample.join(', ')} answered`);
  });

  test(`${network}: at least one fallback node answers grpc-web`, async () => {
    const answers = await Promise.all(networks[network].fallbackAddresses.map(answersGrpcWeb));
    assert.ok(answers.some(Boolean), 'every fallback node is unreachable');
  });

  test(`${network}: the app client reads Core and Platform status`, async () => {
    const client = new DAPIClient({
      network,
      dapiAddressProvider: new DiscoveringAddressProvider(network),
      timeout: 15000,
      retries: 3,
    });
    try {
      const core = await client.core.getBlockchainStatus();
      assert.equal(core.chain.name, network === 'mainnet' ? 'main' : 'test');
      const platform = (await client.platform.getStatus()) as unknown as { chain: { latestBlockHeight: bigint } };
      assert.ok(platform.chain.latestBlockHeight > 0n);
    } finally {
      await client.disconnect();
    }
  });
}
