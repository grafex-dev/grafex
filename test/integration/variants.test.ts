import { describe, test, expect, afterAll } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '../fixtures');

afterAll(async () => {
  const { close } = await import('../../src/index.js');
  await close();
});

describe('render() — variants integration', () => {
  test('render() with variant og uses base config dimensions', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'with-variants.tsx'), {
      variant: 'og',
    });
    expect(result.width).toBe(1200);
    expect(result.height).toBe(630);
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer.length).toBeGreaterThan(0);
  });

  test('render() with variant twitter uses twitter dimensions (1200x675)', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'with-variants.tsx'), {
      variant: 'twitter',
    });
    expect(result.width).toBe(1200);
    expect(result.height).toBe(675);
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
  });

  test('render() with variant square uses square dimensions (1080x1080)', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'with-variants.tsx'), {
      variant: 'square',
    });
    expect(result.width).toBe(1080);
    expect(result.height).toBe(1080);
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
  });

  test('render() with unknown variant rejects with descriptive error', async () => {
    const { render } = await import('../../src/index.js');
    await expect(
      render(resolve(fixturesDir, 'with-variants.tsx'), { variant: 'unknown' }),
    ).rejects.toThrow('Unknown variant "unknown"');
  });
});

describe('renderAll() — integration', () => {
  test('renderAll returns a Map with all variant keys', async () => {
    const { renderAll } = await import('../../src/index.js');
    const results = await renderAll(resolve(fixturesDir, 'with-variants.tsx'));
    expect(results).toBeInstanceOf(Map);
    expect(results.has('og')).toBe(true);
    expect(results.has('twitter')).toBe(true);
    expect(results.has('square')).toBe(true);
    expect(results.size).toBe(3);
  });

  test('renderAll each result has correct dimensions', async () => {
    const { renderAll } = await import('../../src/index.js');
    const results = await renderAll(resolve(fixturesDir, 'with-variants.tsx'));
    expect(results.get('og')!.width).toBe(1200);
    expect(results.get('og')!.height).toBe(630);
    expect(results.get('twitter')!.width).toBe(1200);
    expect(results.get('twitter')!.height).toBe(675);
    expect(results.get('square')!.width).toBe(1080);
    expect(results.get('square')!.height).toBe(1080);
  });

  test('renderAll each result buffer contains valid PNG bytes', async () => {
    const { renderAll } = await import('../../src/index.js');
    const results = await renderAll(resolve(fixturesDir, 'with-variants.tsx'));
    for (const [, result] of results) {
      expect(result.buffer[0]).toBe(0x89);
      expect(result.buffer[1]).toBe(0x50);
      expect(result.buffer[2]).toBe(0x4e);
      expect(result.buffer[3]).toBe(0x47);
    }
  });

  test('renderAll passes shared options to all variants', async () => {
    const { renderAll } = await import('../../src/index.js');
    const results = await renderAll(resolve(fixturesDir, 'with-variants.tsx'), {
      props: { layout: 'shared' },
    });
    // All variants should receive the shared props (CLI props override variant props)
    expect(results.size).toBe(3);
    for (const [, result] of results) {
      expect(Buffer.isBuffer(result.buffer)).toBe(true);
    }
  });

  test('renderAll on composition without variants rejects', async () => {
    const { renderAll } = await import('../../src/index.js');
    await expect(renderAll(resolve(fixturesDir, 'simple.tsx'))).rejects.toThrow('config.variants');
  });
});
