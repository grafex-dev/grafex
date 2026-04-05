import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { get } from 'node:http';
import { writeFile, unlink, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { copyFile } from 'node:fs/promises';
import { startDevServer } from '../../src/commands/dev.js';
import { BrowserManager } from '../../src/browser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(__dirname, '../fixtures/simple.tsx');

let devServer: Awaited<ReturnType<typeof startDevServer>>;
let manager: BrowserManager;

function httpGet(url: string): Promise<{
  status: number;
  headers: Record<string, string | string[] | undefined>;
  body: Buffer;
}> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const req = get(url, (res) => {
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode ?? 0,
          headers: res.headers as Record<string, string | string[] | undefined>,
          body: Buffer.concat(chunks),
        });
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy(new Error('Request timed out'));
    });
  });
}

function httpGetStream(
  url: string,
  timeout: number,
): Promise<{ status: number; headers: Record<string, string | string[] | undefined> }> {
  return new Promise((resolve, reject) => {
    const req = get(url, (res) => {
      // Immediately resolve once headers arrive — don't wait for body (SSE stream is long-lived)
      resolve({
        status: res.statusCode ?? 0,
        headers: res.headers as Record<string, string | string[] | undefined>,
      });
      res.resume(); // drain to avoid memory buildup
    });
    req.on('error', reject);
    req.setTimeout(timeout, () => {
      req.destroy(new Error('Request timed out'));
    });
  });
}

function waitForSSEEvent(url: string, eventName: string, timeout: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = get(url, (res) => {
      let buf = '';
      const timer = setTimeout(() => {
        req.destroy();
        reject(new Error(`Timed out waiting for SSE event "${eventName}"`));
      }, timeout);

      res.setEncoding('utf-8');
      res.on('data', (chunk: string) => {
        buf += chunk;
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('event: ') && line.slice(7).trim() === eventName) {
            clearTimeout(timer);
            req.destroy();
            resolve();
            return;
          }
        }
      });
      res.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
    req.on('error', (err) => {
      // req.destroy() triggers an error — ignore it if we already resolved
      if ((err as NodeJS.ErrnoException).code !== 'ECONNRESET') {
        reject(err);
      }
    });
  });
}

beforeAll(async () => {
  manager = new BrowserManager();
  devServer = await startDevServer(fixturePath, { port: 0, manager });

  // Wait for initial render to complete (up to 30s)
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const res = await httpGet(`http://localhost:${devServer.port}/image`);
      if (res.status === 200) break;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
}, 60_000);

afterAll(async () => {
  await devServer.close();
  await manager.close();
}, 15_000);

describe('dev server — HTTP endpoints', () => {
  test('GET / returns 200 with HTML containing <img>', async () => {
    const res = await httpGet(`http://localhost:${devServer.port}/`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    const body = res.body.toString('utf-8');
    expect(body).toContain('<img');
  }, 10_000);

  test('GET /image returns 200 with PNG buffer', async () => {
    const res = await httpGet(`http://localhost:${devServer.port}/image`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/png');
    // PNG magic bytes: 0x89 0x50 0x4E 0x47
    expect(res.body[0]).toBe(0x89);
    expect(res.body[1]).toBe(0x50);
    expect(res.body[2]).toBe(0x4e);
    expect(res.body[3]).toBe(0x47);
  }, 10_000);

  test('GET /events returns 200 with SSE content-type', async () => {
    const res = await httpGetStream(`http://localhost:${devServer.port}/events`, 5000);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/event-stream');
  }, 10_000);

  test('GET /unknown returns 404', async () => {
    const res = await httpGet(`http://localhost:${devServer.port}/unknown`);
    expect(res.status).toBe(404);
  }, 10_000);
});

describe('dev server — cleanup', () => {
  test('close() resolves without throwing', async () => {
    // We create a separate server to test close() in isolation
    const m2 = new BrowserManager();
    const s = await startDevServer(fixturePath, { port: 0, manager: m2 });
    await expect(s.close()).resolves.not.toThrow();
    await m2.close();
  }, 30_000);
});

describe('dev server — missing CSS tolerance', () => {
  let cleanupServer: (() => Promise<void>) | null = null;
  let cleanupTmpDir: string | null = null;

  afterEach(async () => {
    if (cleanupServer) {
      await cleanupServer();
      cleanupServer = null;
    }
    if (cleanupTmpDir) {
      await rm(cleanupTmpDir, { recursive: true, force: true });
      cleanupTmpDir = null;
    }
  }, 15_000);

  test('renders successfully when a CSS file from config.css does not exist yet', async () => {
    const missingCssFixture = resolve(__dirname, '../fixtures/with-missing-css.tsx');
    const m = new BrowserManager();
    const s = await startDevServer(missingCssFixture, { port: 0, manager: m });
    cleanupServer = async () => {
      await s.close();
      await m.close();
    };

    // Wait for initial render to complete (up to 30s)
    const deadline = Date.now() + 30_000;
    let imageServed = false;
    while (Date.now() < deadline) {
      try {
        const res = await httpGet(`http://localhost:${s.port}/image`);
        if (res.status === 200) {
          imageServed = true;
          break;
        }
      } catch {
        // not ready yet
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    expect(imageServed).toBe(true);

    const res = await httpGet(`http://localhost:${s.port}/image`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/png');
    // PNG magic bytes
    expect(res.body[0]).toBe(0x89);
    expect(res.body[1]).toBe(0x50);
    expect(res.body[2]).toBe(0x4e);
    expect(res.body[3]).toBe(0x47);
  }, 60_000);

  test('re-renders when a missing CSS file is created after startup', async () => {
    // Create a temp dir with a fixture pointing to a CSS file we control
    const tmpDir = await mkdtemp(resolve(tmpdir(), 'grafex-test-'));
    cleanupTmpDir = tmpDir;
    const tmpFixture = resolve(tmpDir, 'composition.tsx');

    // Write a fixture that references a CSS file in the temp dir
    await writeFile(
      tmpFixture,
      `import type { CompositionConfig } from '../../src/types.js';
export const config: CompositionConfig = {
  width: 800,
  height: 400,
  css: ['./late.css'],
};
export default function Late() {
  return <div style={{ width: '800px', height: '400px' }}>Late CSS</div>;
}`,
    );

    const m = new BrowserManager();
    const s = await startDevServer(tmpFixture, { port: 0, manager: m });
    cleanupServer = async () => {
      await s.close();
      await m.close();
    };

    // Wait for the initial render (CSS missing — should still render)
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      try {
        const res = await httpGet(`http://localhost:${s.port}/image`);
        if (res.status === 200) break;
      } catch {
        // not ready yet
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    // Connect to SSE before creating the CSS file so we don't miss the event
    const renderEventPromise = waitForSSEEvent(
      `http://localhost:${s.port}/events`,
      'render',
      10_000,
    );

    // Now create the CSS file — dev server should detect it and re-render
    const cssPath = resolve(tmpDir, 'late.css');
    await writeFile(cssPath, 'body { background: red; }');

    // Wait for the render SSE event — proves re-render actually happened
    await renderEventPromise;
  }, 90_000);
});
