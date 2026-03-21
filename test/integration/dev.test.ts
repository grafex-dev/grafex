import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { get } from 'node:http';
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
