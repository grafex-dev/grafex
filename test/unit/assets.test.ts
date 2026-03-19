import { describe, test, expect } from 'vitest';
import { resolve } from 'node:path';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { embedLocalAssets, embedCssAssets } from '../../src/assets.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '../fixtures');
const tmpDir = resolve(__dirname, '../tmp-assets');

// Minimal valid 1x1 red PNG bytes
const TINY_PNG = Buffer.from([
  0x89,
  0x50,
  0x4e,
  0x47,
  0x0d,
  0x0a,
  0x1a,
  0x0a, // PNG signature
  0x00,
  0x00,
  0x00,
  0x0d,
  0x49,
  0x48,
  0x44,
  0x52, // IHDR length + type
  0x00,
  0x00,
  0x00,
  0x01,
  0x00,
  0x00,
  0x00,
  0x01, // width=1, height=1
  0x08,
  0x02,
  0x00,
  0x00,
  0x00,
  0x90,
  0x77,
  0x53, // bit depth, color type, etc.
  0xde,
  0x00,
  0x00,
  0x00,
  0x0c,
  0x49,
  0x44,
  0x41, // IDAT length + type
  0x54,
  0x08,
  0xd7,
  0x63,
  0xf8,
  0xcf,
  0xc0,
  0x00, // IDAT data
  0x00,
  0x00,
  0x02,
  0x00,
  0x01,
  0xe2,
  0x21,
  0xbc, // IDAT data + CRC
  0x33,
  0x00,
  0x00,
  0x00,
  0x00,
  0x49,
  0x45,
  0x4e, // IEND length + type
  0x44,
  0xae,
  0x42,
  0x60,
  0x82, // IEND CRC
]);

async function setupTmp() {
  await mkdir(tmpDir, { recursive: true });
}

async function teardownTmp() {
  await rm(tmpDir, { recursive: true, force: true });
}

describe('embedLocalAssets — <img src>', () => {
  test('replaces local img src with base64 data URL', async () => {
    await setupTmp();
    const imgPath = resolve(tmpDir, 'photo.png');
    await writeFile(imgPath, TINY_PNG);

    const html = `<img src="./photo.png" alt="x">`;
    const result = await embedLocalAssets(html, tmpDir);

    expect(result).toContain('data:image/png;base64,');
    expect(result).not.toContain('src="./photo.png"');

    await teardownTmp();
  });

  test('skips http:// URLs', async () => {
    const html = `<img src="http://example.com/photo.png" alt="x">`;
    const result = await embedLocalAssets(html, tmpDir);
    expect(result).toBe(html);
  });

  test('skips https:// URLs', async () => {
    const html = `<img src="https://example.com/photo.png" alt="x">`;
    const result = await embedLocalAssets(html, tmpDir);
    expect(result).toBe(html);
  });

  test('skips data: URLs', async () => {
    const html = `<img src="data:image/png;base64,abc123" alt="x">`;
    const result = await embedLocalAssets(html, tmpDir);
    expect(result).toBe(html);
  });

  test('skips // protocol-relative URLs', async () => {
    const html = `<img src="//example.com/photo.png" alt="x">`;
    const result = await embedLocalAssets(html, tmpDir);
    expect(result).toBe(html);
  });

  test('throws descriptive error when file is not found', async () => {
    const html = `<img src="./missing-file.png" alt="x">`;
    await expect(embedLocalAssets(html, tmpDir)).rejects.toThrow('missing-file.png');
  });

  test('resolves path relative to baseDir', async () => {
    await setupTmp();
    const imgPath = resolve(tmpDir, 'test-image.png');
    await writeFile(imgPath, TINY_PNG);

    const html = `<img src="./test-image.png">`;
    const result = await embedLocalAssets(html, tmpDir);
    expect(result).toContain('data:image/png;base64,');

    await teardownTmp();
  });
});

describe('embedLocalAssets — inline style url()', () => {
  test('replaces url() in inline style attribute', async () => {
    await setupTmp();
    const imgPath = resolve(tmpDir, 'bg.png');
    await writeFile(imgPath, TINY_PNG);

    const html = `<div style="background-image: url('./bg.png')"></div>`;
    const result = await embedLocalAssets(html, tmpDir);

    expect(result).toContain('data:image/png;base64,');
    expect(result).not.toContain("url('./bg.png')");

    await teardownTmp();
  });

  test('skips remote url() in inline styles', async () => {
    const html = `<div style="background-image: url('https://example.com/bg.png')"></div>`;
    const result = await embedLocalAssets(html, tmpDir);
    expect(result).toBe(html);
  });
});

describe('embedLocalAssets — <style> block url()', () => {
  test('replaces url() in <style> blocks', async () => {
    await setupTmp();
    const imgPath = resolve(tmpDir, 'bg.png');
    await writeFile(imgPath, TINY_PNG);

    const html = `<style>.foo { background-image: url('./bg.png'); }</style>`;
    const result = await embedLocalAssets(html, tmpDir);

    expect(result).toContain('data:image/png;base64,');
    expect(result).not.toContain("url('./bg.png')");

    await teardownTmp();
  });

  test('skips remote url() in <style> blocks', async () => {
    const html = `<style>.foo { background-image: url('https://example.com/bg.png'); }</style>`;
    const result = await embedLocalAssets(html, tmpDir);
    expect(result).toBe(html);
  });
});

describe('embedCssAssets', () => {
  test('replaces url() in CSS content', async () => {
    await setupTmp();
    const imgPath = resolve(tmpDir, 'icon.png');
    await writeFile(imgPath, TINY_PNG);

    const css = `.foo { background: url('./icon.png'); }`;
    const result = await embedCssAssets(css, tmpDir);

    expect(result).toContain('data:image/png;base64,');
    expect(result).not.toContain("url('./icon.png')");

    await teardownTmp();
  });

  test('skips http:// URLs in CSS', async () => {
    const css = `.foo { background: url('http://example.com/icon.png'); }`;
    const result = await embedCssAssets(css, tmpDir);
    expect(result).toBe(css);
  });

  test('skips https:// URLs in CSS', async () => {
    const css = `.foo { background: url('https://example.com/icon.png'); }`;
    const result = await embedCssAssets(css, tmpDir);
    expect(result).toBe(css);
  });

  test('resolves path relative to cssFileDir', async () => {
    await setupTmp();
    const subDir = resolve(tmpDir, 'sub');
    await mkdir(subDir, { recursive: true });
    const imgPath = resolve(subDir, 'icon.png');
    await writeFile(imgPath, TINY_PNG);

    const css = `.foo { background: url('./icon.png'); }`;
    const result = await embedCssAssets(css, subDir);
    expect(result).toContain('data:image/png;base64,');

    await teardownTmp();
  });
});

describe('MIME type detection', () => {
  test('detects image/png for .png files', async () => {
    await setupTmp();
    await writeFile(resolve(tmpDir, 'a.png'), TINY_PNG);
    const result = await embedLocalAssets(`<img src="./a.png">`, tmpDir);
    expect(result).toContain('data:image/png;base64,');
    await teardownTmp();
  });

  test('detects image/jpeg for .jpg files', async () => {
    await setupTmp();
    await writeFile(resolve(tmpDir, 'a.jpg'), Buffer.from([0xff, 0xd8, 0xff]));
    const result = await embedLocalAssets(`<img src="./a.jpg">`, tmpDir);
    expect(result).toContain('data:image/jpeg;base64,');
    await teardownTmp();
  });

  test('detects image/jpeg for .jpeg files', async () => {
    await setupTmp();
    await writeFile(resolve(tmpDir, 'a.jpeg'), Buffer.from([0xff, 0xd8, 0xff]));
    const result = await embedLocalAssets(`<img src="./a.jpeg">`, tmpDir);
    expect(result).toContain('data:image/jpeg;base64,');
    await teardownTmp();
  });

  test('detects image/gif for .gif files', async () => {
    await setupTmp();
    await writeFile(resolve(tmpDir, 'a.gif'), Buffer.from('GIF89a'));
    const result = await embedLocalAssets(`<img src="./a.gif">`, tmpDir);
    expect(result).toContain('data:image/gif;base64,');
    await teardownTmp();
  });

  test('detects image/webp for .webp files', async () => {
    await setupTmp();
    await writeFile(resolve(tmpDir, 'a.webp'), Buffer.from('RIFF'));
    const result = await embedLocalAssets(`<img src="./a.webp">`, tmpDir);
    expect(result).toContain('data:image/webp;base64,');
    await teardownTmp();
  });

  test('detects image/svg+xml for .svg files', async () => {
    await setupTmp();
    await writeFile(resolve(tmpDir, 'a.svg'), Buffer.from('<svg/>'));
    const result = await embedLocalAssets(`<img src="./a.svg">`, tmpDir);
    expect(result).toContain('data:image/svg+xml;base64,');
    await teardownTmp();
  });

  test('detects image/avif for .avif files', async () => {
    await setupTmp();
    await writeFile(resolve(tmpDir, 'a.avif'), Buffer.from([0x00]));
    const result = await embedLocalAssets(`<img src="./a.avif">`, tmpDir);
    expect(result).toContain('data:image/avif;base64,');
    await teardownTmp();
  });

  test('detects image/x-icon for .ico files', async () => {
    await setupTmp();
    await writeFile(resolve(tmpDir, 'a.ico'), Buffer.from([0x00, 0x00, 0x01, 0x00]));
    const result = await embedLocalAssets(`<img src="./a.ico">`, tmpDir);
    expect(result).toContain('data:image/x-icon;base64,');
    await teardownTmp();
  });

  test('detects image/bmp for .bmp files', async () => {
    await setupTmp();
    await writeFile(resolve(tmpDir, 'a.bmp'), Buffer.from('BM'));
    const result = await embedLocalAssets(`<img src="./a.bmp">`, tmpDir);
    expect(result).toContain('data:image/bmp;base64,');
    await teardownTmp();
  });
});
