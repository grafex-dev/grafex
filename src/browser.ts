import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium, webkit } from 'playwright-core';
import type { Browser, BrowserType, Page } from 'playwright-core';

type Engine = 'webkit' | 'chromium';

interface BrowserManagerOptions {
  engine?: Engine;
  idleTimeoutMs?: number;
}

const DEFAULT_IDLE_TIMEOUT_MS = 30_000;

const CHROMIUM_ARGS = [
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--no-sandbox',
  '--disable-setuid-sandbox',
];

function findBrowserBinary(engine: Engine): string | undefined {
  const browsersPath = process.env['PLAYWRIGHT_BROWSERS_PATH'];

  const baseDirs: string[] = browsersPath
    ? [browsersPath]
    : [
        join(homedir(), 'Library', 'Caches', 'ms-playwright'),
        join(homedir(), '.cache', 'ms-playwright'),
        join(process.env['LOCALAPPDATA'] ?? '', 'ms-playwright'),
      ];

  const prefix = engine === 'webkit' ? 'webkit-' : 'chromium_headless_shell-';

  for (const base of baseDirs) {
    if (!base) continue;
    try {
      const dirs = readdirSync(base).filter((d) => d.startsWith(prefix));

      for (const dir of dirs) {
        const candidates =
          engine === 'webkit'
            ? [
                join(
                  base,
                  dir,
                  'webkit-mac-15',
                  'Playwright.app',
                  'Contents',
                  'MacOS',
                  'Playwright',
                ),
                join(
                  base,
                  dir,
                  'webkit-mac-14',
                  'Playwright.app',
                  'Contents',
                  'MacOS',
                  'Playwright',
                ),
                join(
                  base,
                  dir,
                  'webkit-mac-13',
                  'Playwright.app',
                  'Contents',
                  'MacOS',
                  'Playwright',
                ),
                join(base, dir, 'minibrowser-gtk', 'MiniBrowser'),
                join(base, dir, 'minibrowser-gtk-wpe', 'MiniBrowser'),
                join(base, dir, 'pw_run.sh'),
              ]
            : [
                join(base, dir, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell'),
                join(base, dir, 'chrome-headless-shell-mac-x64', 'chrome-headless-shell'),
                join(base, dir, 'chrome-headless-shell-linux-x64', 'chrome-headless-shell'),
                join(base, dir, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'),
              ];

        for (const candidate of candidates) {
          if (existsSync(candidate)) return candidate;
        }
      }
    } catch {
      // ignore errors (e.g. base dir does not exist)
    }
  }

  return undefined;
}

export class BrowserManager {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private launchPromise: Promise<void> | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly engine: Engine;
  private readonly idleTimeoutMs: number;
  private readonly exitHandler: () => void;
  private readonly sigintHandler: () => void;
  private readonly sigtermHandler: () => void;

  constructor(options: BrowserManagerOptions = {}) {
    this.engine = options.engine ?? 'webkit';
    this.idleTimeoutMs = options.idleTimeoutMs ?? DEFAULT_IDLE_TIMEOUT_MS;

    this.exitHandler = () => void this.close();
    this.sigintHandler = () => void this.close();
    this.sigtermHandler = () => void this.close();
    process.on('exit', this.exitHandler);
    process.on('SIGINT', this.sigintHandler);
    process.on('SIGTERM', this.sigtermHandler);
  }

  async render(html: string, viewport: { width: number; height: number }): Promise<Buffer> {
    if (findBrowserBinary(this.engine) === undefined) {
      throw new Error(`WebKit browser not found. Run: npx playwright install webkit`);
    }

    if (!this.browser) {
      if (!this.launchPromise) {
        this.launchPromise = this.launch();
      }
      await this.launchPromise;
      this.launchPromise = null;
    }

    const page = this.page!;
    await page.setViewportSize(viewport);
    await page.setContent(html, { waitUntil: 'load' });

    const screenshotOptions =
      this.engine === 'chromium'
        ? { type: 'png' as const, omitBackground: true, optimizeForSpeed: true }
        : { type: 'png' as const, omitBackground: true };

    const buffer = await page.screenshot(screenshotOptions);
    this.resetIdleTimer();
    return Buffer.from(buffer);
  }

  async close(): Promise<void> {
    this.clearIdleTimer();
    process.removeListener('exit', this.exitHandler);
    process.removeListener('SIGINT', this.sigintHandler);
    process.removeListener('SIGTERM', this.sigtermHandler);
    if (this.browser) {
      const browser = this.browser;
      this.browser = null;
      this.page = null;
      await browser.close();
    }
  }

  private async launch(): Promise<void> {
    const bt: BrowserType = this.engine === 'chromium' ? chromium : webkit;

    const launchOptions: Parameters<BrowserType['launch']>[0] = {};

    if (this.engine === 'chromium') {
      launchOptions.args = CHROMIUM_ARGS;
    }

    this.browser = await bt.launch(launchOptions);
    this.page = await this.browser.newPage();
  }

  private resetIdleTimer(): void {
    this.clearIdleTimer();
    this.idleTimer = setTimeout(() => {
      void this.close();
    }, this.idleTimeoutMs);
  }

  private clearIdleTimer(): void {
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }
}
