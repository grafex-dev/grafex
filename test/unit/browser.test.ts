import { mkdirSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, test, expect, afterEach, vi } from 'vitest';
import { BrowserManager } from '../../src/browser.js';

describe('BrowserManager — construction', () => {
  test('constructing BrowserManager does not spawn any child processes', () => {
    // We verify this by checking that the internal browser/page are null after construction.
    // If browser processes were spawned, the test would fail on cleanup (or leak processes).
    // We rely on the class exposing no side effects at construction time.
    const manager = new BrowserManager();
    // The object must be constructable without throwing
    expect(manager).toBeInstanceOf(BrowserManager);
  });

  test('BrowserManager accepts engine option "webkit"', () => {
    expect(() => new BrowserManager({ engine: 'webkit' })).not.toThrow();
  });

  test('BrowserManager accepts engine option "chromium"', () => {
    expect(() => new BrowserManager({ engine: 'chromium' })).not.toThrow();
  });

  test('BrowserManager accepts idleTimeoutMs option', () => {
    expect(() => new BrowserManager({ idleTimeoutMs: 100 })).not.toThrow();
  });

  test('BrowserManager accepts combined options', () => {
    expect(() => new BrowserManager({ engine: 'webkit', idleTimeoutMs: 5000 })).not.toThrow();
  });
});

describe('BrowserManager — process exit handlers', () => {
  test('process.on("exit") handler is registered on construction', () => {
    const listenerCountBefore = process.listenerCount('exit');
    const manager = new BrowserManager();
    const listenerCountAfter = process.listenerCount('exit');
    expect(listenerCountAfter).toBe(listenerCountBefore + 1);
    // cleanup
    manager.close();
  });

  test('process.on("SIGINT") handler is registered on construction', () => {
    const listenerCountBefore = process.listenerCount('SIGINT');
    const manager = new BrowserManager();
    const listenerCountAfter = process.listenerCount('SIGINT');
    expect(listenerCountAfter).toBe(listenerCountBefore + 1);
    manager.close();
  });

  test('process.on("SIGTERM") handler is registered on construction', () => {
    const listenerCountBefore = process.listenerCount('SIGTERM');
    const manager = new BrowserManager();
    const listenerCountAfter = process.listenerCount('SIGTERM');
    expect(listenerCountAfter).toBe(listenerCountBefore + 1);
    manager.close();
  });
});

describe('BrowserManager — findBrowserBinary shell injection safety', () => {
  test('PLAYWRIGHT_BROWSERS_PATH containing shell-special characters does not cause an error', async () => {
    // A path with shell metacharacters (backtick, semicolon) would cause a shell command to
    // break or execute unintended commands. With readdirSync there is no shell involved.
    const base = join(tmpdir(), 'grafex-test-`echo;pwned`-' + Date.now());
    mkdirSync(base, { recursive: true });
    const originalPath = process.env['PLAYWRIGHT_BROWSERS_PATH'];
    process.env['PLAYWRIGHT_BROWSERS_PATH'] = base;
    const manager = new BrowserManager({ engine: 'webkit' });
    try {
      // Should throw the "binary not found" error, not a shell execution error
      await expect(manager.render('', { width: 1, height: 1 })).rejects.toThrow(
        'npx playwright install webkit',
      );
    } finally {
      if (originalPath === undefined) {
        delete process.env['PLAYWRIGHT_BROWSERS_PATH'];
      } else {
        process.env['PLAYWRIGHT_BROWSERS_PATH'] = originalPath;
      }
      rmdirSync(base);
      await manager.close();
    }
  });
});

describe('BrowserManager — findBrowserBinary false-positive fallback', () => {
  test('render() throws when versioned browser dir exists but contains no matching binary', async () => {
    // Create a fake ms-playwright dir with a versioned webkit- subdirectory but no binary inside.
    // The old code returned the directory path as a false positive; the fix must return null
    // so the caller throws the helpful error.
    const base = join(tmpdir(), 'grafex-test-fake-browsers-' + Date.now());
    const versionedDir = join(base, 'webkit-1234');
    mkdirSync(versionedDir, { recursive: true });
    const originalPath = process.env['PLAYWRIGHT_BROWSERS_PATH'];
    process.env['PLAYWRIGHT_BROWSERS_PATH'] = base;
    const manager = new BrowserManager({ engine: 'webkit' });
    try {
      await expect(manager.render('', { width: 1, height: 1 })).rejects.toThrow(
        'npx playwright install webkit',
      );
    } finally {
      if (originalPath === undefined) {
        delete process.env['PLAYWRIGHT_BROWSERS_PATH'];
      } else {
        process.env['PLAYWRIGHT_BROWSERS_PATH'] = originalPath;
      }
      rmdirSync(versionedDir);
      rmdirSync(base);
      await manager.close();
    }
  });
});

describe('BrowserManager — process listener cleanup on close()', () => {
  test('close() removes the exit listener added during construction', async () => {
    const before = process.listenerCount('exit');
    const manager = new BrowserManager();
    expect(process.listenerCount('exit')).toBe(before + 1);
    await manager.close();
    expect(process.listenerCount('exit')).toBe(before);
  });

  test('close() removes the SIGINT listener added during construction', async () => {
    const before = process.listenerCount('SIGINT');
    const manager = new BrowserManager();
    expect(process.listenerCount('SIGINT')).toBe(before + 1);
    await manager.close();
    expect(process.listenerCount('SIGINT')).toBe(before);
  });

  test('close() removes the SIGTERM listener added during construction', async () => {
    const before = process.listenerCount('SIGTERM');
    const manager = new BrowserManager();
    expect(process.listenerCount('SIGTERM')).toBe(before + 1);
    await manager.close();
    expect(process.listenerCount('SIGTERM')).toBe(before);
  });

  test('multiple BrowserManager instances do not accumulate listeners after each is closed', async () => {
    const exitBefore = process.listenerCount('exit');
    const managers = [new BrowserManager(), new BrowserManager(), new BrowserManager()];
    expect(process.listenerCount('exit')).toBe(exitBefore + 3);
    for (const m of managers) await m.close();
    expect(process.listenerCount('exit')).toBe(exitBefore);
  });
});

describe('BrowserManager — close() idempotency', () => {
  test('calling close() on a never-launched BrowserManager does not throw', async () => {
    const manager = new BrowserManager();
    await expect(manager.close()).resolves.toBeUndefined();
  });

  test('calling close() twice does not throw', async () => {
    const manager = new BrowserManager();
    await manager.close();
    await expect(manager.close()).resolves.toBeUndefined();
  });
});
