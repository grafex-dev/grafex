import { describe, test, expect, afterAll } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BrowserManager } from '../../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '../fixtures');

afterAll(async () => {
  const { close } = await import('../../src/index.js');
  await close();
});

// --- Shared-singleton render tests ---

describe('render() — integration', () => {
  test('render(simple.tsx) returns RenderResult with non-empty buffer', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'simple.tsx'));
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer.length).toBeGreaterThan(0);
  });

  test('result.buffer starts with PNG magic bytes 89 50 4E 47', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'simple.tsx'));
    expect(result.buffer[0]).toBe(0x89);
    expect(result.buffer[1]).toBe(0x50);
    expect(result.buffer[2]).toBe(0x4e);
    expect(result.buffer[3]).toBe(0x47);
  });

  test('result.width and result.height match the fixture config dimensions', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'simple.tsx'));
    // simple.tsx config: width: 800, height: 400
    expect(result.width).toBe(800);
    expect(result.height).toBe(400);
  });

  test('result.format is "png"', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'simple.tsx'));
    expect(result.format).toBe('png');
  });

  test('render() with options.props passes props to the composition', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'with-props.tsx'), {
      props: { title: 'Integration Test' },
    });
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer.length).toBeGreaterThan(0);
  });

  test('render() with options.width and options.height overrides produce matching RenderResult', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'simple.tsx'), {
      width: 1024,
      height: 512,
    });
    expect(result.width).toBe(1024);
    expect(result.height).toBe(512);
  });

  test('render() with scale: 2 returns result.scale of 2', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'simple.tsx'), { scale: 2 });
    expect(result.scale).toBe(2);
  });

  test('render() with scale: 2 produces physical pixel dimensions double the CSS dimensions', async () => {
    const { render } = await import('../../src/index.js');
    // simple.tsx config: width 800, height 400
    const result = await render(resolve(fixturesDir, 'simple.tsx'), { scale: 2 });
    expect(result.width).toBe(1600);
    expect(result.height).toBe(800);
  });

  test('render() with scale: 1 produces same dimensions as default (no scale)', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'simple.tsx'), { scale: 1 });
    expect(result.width).toBe(800);
    expect(result.height).toBe(400);
    expect(result.scale).toBe(1);
  });

  test('two sequential render() calls both succeed (browser reuse)', async () => {
    const { render } = await import('../../src/index.js');
    const result1 = await render(resolve(fixturesDir, 'simple.tsx'));
    const result2 = await render(resolve(fixturesDir, 'simple.tsx'));
    expect(result1.buffer.length).toBeGreaterThan(0);
    expect(result2.buffer.length).toBeGreaterThan(0);
  });

  test('rendering with-components.tsx succeeds (sub-component resolution)', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'with-components.tsx'));
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer.length).toBeGreaterThan(0);
  });
});

// --- JPEG format tests ---

describe('render() — JPEG format', () => {
  test('rendering with format "jpeg" produces a valid JPEG (magic bytes FF D8 FF)', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'simple.tsx'), { format: 'jpeg' });
    expect(result.buffer[0]).toBe(0xff);
    expect(result.buffer[1]).toBe(0xd8);
    expect(result.buffer[2]).toBe(0xff);
  });

  test('rendering with format "jpeg" sets result.format to "jpeg"', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'simple.tsx'), { format: 'jpeg' });
    expect(result.format).toBe('jpeg');
  });

  test('rendering with-jpeg.tsx fixture (config.format jpeg) produces valid JPEG', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'with-jpeg.tsx'));
    expect(result.buffer[0]).toBe(0xff);
    expect(result.buffer[1]).toBe(0xd8);
    expect(result.buffer[2]).toBe(0xff);
    expect(result.format).toBe('jpeg');
  });

  test('JPEG at quality 50 produces a smaller buffer than quality 100', async () => {
    const { render } = await import('../../src/index.js');
    const [low, high] = await Promise.all([
      render(resolve(fixturesDir, 'simple.tsx'), { format: 'jpeg', quality: 50 }),
      render(resolve(fixturesDir, 'simple.tsx'), { format: 'jpeg', quality: 100 }),
    ]);
    expect(low.buffer.length).toBeLessThan(high.buffer.length);
  });
});

// --- Timing tests (isolated BrowserManager) ---

describe('render() — timing', () => {
  test('cold start timing for simple.tsx is under 3000ms', async () => {
    const { pipeline } = await import('../../src/render.js');
    const manager = new BrowserManager();
    try {
      const start = Date.now();
      await pipeline(resolve(fixturesDir, 'simple.tsx'), undefined, manager);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(3000);
    } finally {
      await manager.close();
    }
  });

  test('warm render timing for simple.tsx is under 500ms', async () => {
    const { pipeline } = await import('../../src/render.js');
    const manager = new BrowserManager();
    try {
      // First render warms the browser
      await pipeline(resolve(fixturesDir, 'simple.tsx'), undefined, manager);
      const start = Date.now();
      await pipeline(resolve(fixturesDir, 'simple.tsx'), undefined, manager);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(500);
    } finally {
      await manager.close();
    }
  });
});

// --- State-mutation tests (isolated BrowserManager) ---

describe('render() — close and re-launch', () => {
  test('close() after rendering does not throw', async () => {
    const { pipeline } = await import('../../src/render.js');
    const manager = new BrowserManager();
    await pipeline(resolve(fixturesDir, 'simple.tsx'), undefined, manager);
    await expect(manager.close()).resolves.not.toThrow();
  });

  test('render() after close() succeeds (re-launch)', async () => {
    const { pipeline } = await import('../../src/render.js');
    const manager = new BrowserManager();
    try {
      await pipeline(resolve(fixturesDir, 'simple.tsx'), undefined, manager);
      await manager.close();
      const result = await pipeline(resolve(fixturesDir, 'simple.tsx'), undefined, manager);
      expect(Buffer.isBuffer(result.buffer)).toBe(true);
      expect(result.buffer[0]).toBe(0x89);
      expect(result.buffer[1]).toBe(0x50);
      expect(result.buffer[2]).toBe(0x4e);
      expect(result.buffer[3]).toBe(0x47);
    } finally {
      await manager.close();
    }
  });

  test('scale switch on same manager produces correct physical dimensions (context recreation)', async () => {
    const { pipeline } = await import('../../src/render.js');
    const manager = new BrowserManager();
    try {
      // simple.tsx: width 800, height 400
      const result1 = await pipeline(resolve(fixturesDir, 'simple.tsx'), { scale: 1 }, manager);
      expect(result1.width).toBe(800);
      expect(result1.height).toBe(400);
      expect(result1.scale).toBe(1);

      const result2 = await pipeline(resolve(fixturesDir, 'simple.tsx'), { scale: 2 }, manager);
      expect(result2.width).toBe(1600);
      expect(result2.height).toBe(800);
      expect(result2.scale).toBe(2);
    } finally {
      await manager.close();
    }
  });
});
