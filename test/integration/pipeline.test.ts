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

describe('pipeline() — full integration', () => {
  test('simple.tsx returns RenderResult with PNG magic bytes', async () => {
    const result = await pipeline(resolve(fixturesDir, 'simple.tsx'), {}, manager);
    expect(result.format).toBe('png');
    expect(result.width).toBe(800);
    expect(result.height).toBe(400);
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer[0]).toBe(0x89);
    expect(result.buffer[1]).toBe(0x50);
    expect(result.buffer[2]).toBe(0x4e);
    expect(result.buffer[3]).toBe(0x47);
  });

  test('with-props.tsx renders with props without throwing', async () => {
    const result = await pipeline(
      resolve(fixturesDir, 'with-props.tsx'),
      { props: { title: 'Test' } },
      manager,
    );
    expect(result.format).toBe('png');
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer.length).toBeGreaterThan(0);
  });

  test('with-components.tsx renders without throwing', async () => {
    const result = await pipeline(resolve(fixturesDir, 'with-components.tsx'), {}, manager);
    expect(result.format).toBe('png');
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
  });

  test('no-config.tsx uses default dimensions 1200x630', async () => {
    const result = await pipeline(resolve(fixturesDir, 'no-config.tsx'), {}, manager);
    expect(result.width).toBe(1200);
    expect(result.height).toBe(630);
    expect(result.format).toBe('png');
  });

  test('options.width and options.height override config', async () => {
    const result = await pipeline(
      resolve(fixturesDir, 'simple.tsx'),
      { width: 400, height: 200 },
      manager,
    );
    expect(result.width).toBe(400);
    expect(result.height).toBe(200);
    expect(result.format).toBe('png');
  });
});
