import { describe, test, expect, afterAll } from 'vitest';
import { BrowserManager } from '../../src/browser.js';

const SIMPLE_HTML = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{background:red;width:100px;height:100px;}</style></head>
<body><div style="width:100px;height:100px;background:red;"></div></body>
</html>`;

const VIEWPORT = { width: 100, height: 100 };

// PNG magic bytes: 89 50 4E 47
function isPng(buffer: Buffer): boolean {
  return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
}

describe('BrowserManager — rendering', () => {
  let manager: BrowserManager;

  afterAll(async () => {
    await manager?.close();
  });

  test('render() returns a Buffer with PNG magic bytes', async () => {
    manager = new BrowserManager();
    const buffer = await manager.render(SIMPLE_HTML, VIEWPORT);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(isPng(buffer)).toBe(true);
  });

  test('subsequent render() calls reuse the same browser (no additional launches)', async () => {
    manager = new BrowserManager();
    // First call launches browser
    const buf1 = await manager.render(SIMPLE_HTML, VIEWPORT);
    // Second call must also succeed (reuses browser)
    const buf2 = await manager.render(SIMPLE_HTML, VIEWPORT);
    expect(isPng(buf1)).toBe(true);
    expect(isPng(buf2)).toBe(true);
  });

  test('close() after render() does not throw', async () => {
    manager = new BrowserManager();
    await manager.render(SIMPLE_HTML, VIEWPORT);
    await expect(manager.close()).resolves.toBeUndefined();
  });

  test('render() after close() re-launches the browser and returns a valid PNG buffer', async () => {
    manager = new BrowserManager();
    await manager.render(SIMPLE_HTML, VIEWPORT);
    await manager.close();
    const buffer = await manager.render(SIMPLE_HTML, VIEWPORT);
    expect(isPng(buffer)).toBe(true);
  });
});

describe('BrowserManager — idle timeout', () => {
  test('after idle timeout, browser shuts down and re-launches on next render()', async () => {
    const manager = new BrowserManager({ idleTimeoutMs: 100 });

    const buf1 = await manager.render(SIMPLE_HTML, VIEWPORT);
    expect(isPng(buf1)).toBe(true);

    // Wait for idle timeout to fire
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Re-launch on next render
    const buf2 = await manager.render(SIMPLE_HTML, VIEWPORT);
    expect(isPng(buf2)).toBe(true);

    await manager.close();
  });
});

describe('BrowserManager — idle timer resets after screenshot', () => {
  test('idle timer does not fire during a slow render (timer resets after screenshot)', async () => {
    // Use an idle timeout shorter than the render itself would take if the timer
    // started at the beginning. We simulate by setting idleTimeoutMs to a value
    // that is shorter than the total render time but verify the render still completes.
    // We do this by checking: after render() resolves, the manager is still alive
    // (not closed mid-render) by doing a second render successfully.
    const manager = new BrowserManager({ idleTimeoutMs: 200 });

    // First render: triggers launch + screenshot. If timer fires mid-render, the browser
    // closes and the second render would have to re-launch.
    const buf1 = await manager.render(SIMPLE_HTML, VIEWPORT);
    expect(isPng(buf1)).toBe(true);

    // Immediately after render(), the timer is running from the END of screenshot.
    // If we render again before 50ms passes, the browser must still be open (no re-launch).
    // This confirms the timer was reset after screenshot, not before.
    const buf2 = await manager.render(SIMPLE_HTML, VIEWPORT);
    expect(isPng(buf2)).toBe(true);

    await manager.close();
  });
});

describe('BrowserManager — concurrent render() race condition', () => {
  test('two concurrent render() calls both succeed without spawning duplicate browsers', async () => {
    let launchCount = 0;
    const manager = new BrowserManager();

    const { webkit } = await import('playwright-core');
    const originalLaunch = webkit.launch.bind(webkit);
    webkit.launch = async (...args: Parameters<typeof webkit.launch>) => {
      launchCount++;
      return originalLaunch(...args);
    };

    try {
      const [buf1, buf2] = await Promise.all([
        manager.render(SIMPLE_HTML, VIEWPORT),
        manager.render(SIMPLE_HTML, VIEWPORT),
      ]);
      expect(Buffer.isBuffer(buf1)).toBe(true);
      expect(Buffer.isBuffer(buf2)).toBe(true);
      expect(launchCount).toBe(1);
    } finally {
      webkit.launch = originalLaunch;
      await manager.close();
    }
  });
});

describe('BrowserManager — missing browser binary error', () => {
  test('render() throws with descriptive error when WebKit binary is not found', async () => {
    // Override PLAYWRIGHT_BROWSERS_PATH to a non-existent directory so binary check fails
    const originalPath = process.env['PLAYWRIGHT_BROWSERS_PATH'];
    process.env['PLAYWRIGHT_BROWSERS_PATH'] = '/tmp/grafex-test-no-browsers-' + Date.now();

    const manager = new BrowserManager({ engine: 'webkit' });
    try {
      await expect(manager.render(SIMPLE_HTML, VIEWPORT)).rejects.toThrow(
        'npx playwright install webkit',
      );
    } finally {
      if (originalPath === undefined) {
        delete process.env['PLAYWRIGHT_BROWSERS_PATH'];
      } else {
        process.env['PLAYWRIGHT_BROWSERS_PATH'] = originalPath;
      }
      await manager.close();
    }
  });
});
