import { describe, test, expect, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '../fixtures');

afterAll(async () => {
  const { close } = await import('../../src/index.js');
  await close();
});

describe('render() — library API', () => {
  test('render(simple.tsx) returns RenderResult with buffer, width, height, format', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'simple.tsx'));
    expect(result).toHaveProperty('buffer');
    expect(result).toHaveProperty('width');
    expect(result).toHaveProperty('height');
    expect(result).toHaveProperty('format');
  });

  test('result.buffer is a Buffer instance starting with PNG magic bytes', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'simple.tsx'));
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer[0]).toBe(0x89);
    expect(result.buffer[1]).toBe(0x50);
    expect(result.buffer[2]).toBe(0x4e);
    expect(result.buffer[3]).toBe(0x47);
  });

  test('result.format is "png"', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'simple.tsx'));
    expect(result.format).toBe('png');
  });

  test('two sequential render() calls both succeed (browser reuse)', async () => {
    const { render } = await import('../../src/index.js');
    const result1 = await render(resolve(fixturesDir, 'simple.tsx'));
    const result2 = await render(resolve(fixturesDir, 'simple.tsx'));
    expect(result1.buffer.length).toBeGreaterThan(0);
    expect(result2.buffer.length).toBeGreaterThan(0);
  });

  test('close() after render() does not throw', async () => {
    const { render, close } = await import('../../src/index.js');
    await render(resolve(fixturesDir, 'simple.tsx'));
    await expect(close()).resolves.not.toThrow();
  });

  test('close() without prior render() does not throw', async () => {
    const { close } = await import('../../src/index.js');
    await expect(close()).resolves.not.toThrow();
  });

  test('repeated close() calls do not increase process listener count', async () => {
    const { close } = await import('../../src/index.js');
    await close();
    const countAfterFirst = process.listenerCount('SIGINT');
    await close();
    await close();
    expect(process.listenerCount('SIGINT')).toBe(countAfterFirst);
  });

  test('render() after close() re-launches browser and returns valid RenderResult', async () => {
    const { render, close } = await import('../../src/index.js');
    await render(resolve(fixturesDir, 'simple.tsx'));
    await close();
    const result = await render(resolve(fixturesDir, 'simple.tsx'));
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer[0]).toBe(0x89);
    expect(result.buffer[1]).toBe(0x50);
    expect(result.buffer[2]).toBe(0x4e);
    expect(result.buffer[3]).toBe(0x47);
  });
});

describe('re-exports', () => {
  test('h is exported from the package', async () => {
    const { h } = await import('../../src/index.js');
    expect(typeof h).toBe('function');
  });

  test('Fragment is exported from the package', async () => {
    const { Fragment } = await import('../../src/index.js');
    expect(typeof Fragment).toBe('function');
  });

  test('renderToHTML is exported from the package', async () => {
    const { renderToHTML } = await import('../../src/index.js');
    expect(typeof renderToHTML).toBe('function');
  });

  test('BrowserManager is exported from the package', async () => {
    const { BrowserManager } = await import('../../src/index.js');
    expect(typeof BrowserManager).toBe('function');
  });
});
