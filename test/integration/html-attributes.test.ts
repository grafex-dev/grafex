import { describe, test, expect, afterAll } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '../fixtures');

afterAll(async () => {
  const { close } = await import('../../src/index.js');
  await close();
});

describe('render() — htmlAttributes integration', () => {
  // Buffer-only assertions are intentional here: the unit tests in
  // test/unit/render.test.ts and test/unit/runtime.test.ts verify that
  // htmlAttributes are correctly serialized into the HTML string passed to the
  // browser. These integration tests confirm the full render pipeline completes
  // without error and produces a valid PNG — the HTML content is covered at the
  // unit level where it can be inspected directly via mock.render.mock.calls.

  test('renders with-html-attributes.tsx and produces a non-empty PNG buffer', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'with-html-attributes.tsx'));
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer.length).toBeGreaterThan(0);
    expect(result.buffer[0]).toBe(0x89);
    expect(result.buffer[1]).toBe(0x50);
    expect(result.buffer[2]).toBe(0x4e);
    expect(result.buffer[3]).toBe(0x47);
  });

  test('renders with-html-attributes-variant.tsx dark variant without error', async () => {
    const { render } = await import('../../src/index.js');
    const result = await render(resolve(fixturesDir, 'with-html-attributes-variant.tsx'), {
      variant: 'dark',
    });
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer.length).toBeGreaterThan(0);
  });
});
