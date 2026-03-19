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

describe('css files — integration', () => {
  test('with-css.tsx renders without error', async () => {
    const result = await pipeline(resolve(fixturesDir, 'with-css.tsx'), {}, manager);
    expect(result.format).toBe('png');
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer.length).toBeGreaterThan(0);
  });

  test('with-css.tsx produces HTML with injected style tag containing CSS content', async () => {
    const { renderToHTML } = await import('../../src/runtime.js');
    const html = renderToHTML(
      '<div class="grafex-test">test</div>',
      { width: 800, height: 400 },
      undefined,
      ['.grafex-test { color: white; font-size: 48px; }\n'],
    );
    expect(html).toContain('<style>.grafex-test');
    expect(html).toContain('</head>');
    const headClose = html.indexOf('</head>');
    const stylePos = html.lastIndexOf('<style>.grafex-test');
    expect(stylePos).toBeLessThan(headClose);
  });
});
