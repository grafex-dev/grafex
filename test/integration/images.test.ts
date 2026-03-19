import { describe, test, expect, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { pipeline } from '../../src/render.js';
import { BrowserManager } from '../../src/browser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '../fixtures');

const manager = new BrowserManager({ idleTimeoutMs: 5000 });

afterAll(async () => {
  await manager.close();
});

describe('pipeline() — local image embedding', () => {
  test('with-image.tsx renders without throwing', async () => {
    const result = await pipeline(resolve(fixturesDir, 'with-image.tsx'), {}, manager);
    expect(result.format).toBe('png');
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer.length).toBeGreaterThan(0);
  });

  test('with-image.tsx returns PNG magic bytes', async () => {
    const result = await pipeline(resolve(fixturesDir, 'with-image.tsx'), {}, manager);
    expect(result.buffer[0]).toBe(0x89);
    expect(result.buffer[1]).toBe(0x50);
    expect(result.buffer[2]).toBe(0x4e);
    expect(result.buffer[3]).toBe(0x47);
  });

  test('with-image.tsx produces non-trivially-sized output', async () => {
    const result = await pipeline(resolve(fixturesDir, 'with-image.tsx'), {}, manager);
    expect(result.buffer.length).toBeGreaterThan(100);
  });
});
