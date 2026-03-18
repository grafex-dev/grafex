import { describe, test, expect, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { pipeline } from '../../src/render.js';
import { BrowserManager } from '../../src/browser.js';
import { renderToHTML } from '../../src/runtime.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '../fixtures');

const manager = new BrowserManager({ idleTimeoutMs: 5000 });

afterAll(async () => {
  await manager.close();
});

describe('custom fonts — integration', () => {
  test('with-fonts.tsx renders without error', async () => {
    const result = await pipeline(resolve(fixturesDir, 'with-fonts.tsx'), {}, manager);
    expect(result.format).toBe('png');
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer.length).toBeGreaterThan(0);
  });

  test('with-fonts.tsx produces HTML with Google Fonts link tag', async () => {
    const fonts = ['https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap'];
    const html = renderToHTML('<div>hello</div>', { width: 800, height: 400 }, fonts);
    expect(html).toContain(
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&amp;display=swap" crossorigin>',
    );
    expect(html).toContain('</head>');
    const headClose = html.indexOf('</head>');
    const linkPos = html.indexOf('<link rel="stylesheet"');
    expect(linkPos).toBeLessThan(headClose);
  });
});
