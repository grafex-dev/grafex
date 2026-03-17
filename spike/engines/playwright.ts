import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { chromium, webkit, firefox } from 'playwright-core';
import type { Browser, BrowserServer, BrowserType, Page } from 'playwright-core';
import type { BrowserEngine } from './types.js';

type PlaywrightBrowserType = 'chromium' | 'webkit' | 'firefox';

function findChromiumHeadlessShell(): string | undefined {
  // macOS path
  const macBase = join(homedir(), 'Library', 'Caches', 'ms-playwright');
  // Linux path
  const linuxBase = join(homedir(), '.cache', 'ms-playwright');

  for (const base of [macBase, linuxBase]) {
    try {
      const dirs = execSync(`ls "${base}" 2>/dev/null`, { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter((d) => d.startsWith('chromium_headless_shell-'));
      for (const dir of dirs) {
        // macOS arm64
        const macPath = join(base, dir, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell');
        if (existsSync(macPath)) return macPath;
        // macOS x64
        const macX64 = join(base, dir, 'chrome-headless-shell-mac-x64', 'chrome-headless-shell');
        if (existsSync(macX64)) return macX64;
        // Linux
        const linuxPath = join(
          base,
          dir,
          'chrome-headless-shell-linux-x64',
          'chrome-headless-shell',
        );
        if (existsSync(linuxPath)) return linuxPath;
      }
    } catch {
      // ignore
    }
  }
  return undefined;
}

export class PlaywrightEngine implements BrowserEngine {
  readonly name: string;
  private browserType: PlaywrightBrowserType;
  private server: BrowserServer | null = null;
  private browser: Browser | null = null;
  private page: Page | null = null;

  constructor(browserType: PlaywrightBrowserType) {
    this.browserType = browserType;
    this.name = browserType;
  }

  async launch(): Promise<void> {
    const browserTypeMap: Record<PlaywrightBrowserType, BrowserType> = {
      chromium,
      webkit,
      firefox,
    };

    const bt = browserTypeMap[this.browserType];

    const launchOptions: Parameters<BrowserType['launchServer']>[0] = {};

    if (this.browserType === 'chromium') {
      const executablePath = findChromiumHeadlessShell();
      if (executablePath) {
        launchOptions.executablePath = executablePath;
      }
      launchOptions.args = [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ];
    }

    this.server = await bt.launchServer(launchOptions);
    this.browser = await bt.connect(this.server.wsEndpoint());
    this.page = await this.browser.newPage();
  }

  async render(html: string, viewport: { width: number; height: number }): Promise<Buffer> {
    if (!this.page) throw new Error(`${this.name}: not launched`);

    await this.page.setViewportSize(viewport);
    await this.page.setContent(html, { waitUntil: 'load' });

    // Firefox does not support omitBackground — only use it for Chromium/WebKit
    // optimizeForSpeed is a Chromium-only CDP option; WebKit/Firefox ignore or reject it
    const screenshotOptions =
      this.browserType === 'chromium'
        ? { type: 'png' as const, omitBackground: true, optimizeForSpeed: true }
        : this.browserType === 'firefox'
          ? { type: 'png' as const }
          : { type: 'png' as const, omitBackground: true };
    const buffer = await this.page.screenshot(screenshotOptions);
    return Buffer.from(buffer);
  }

  async close(): Promise<void> {
    await this.browser?.close();
    await this.server?.close();
  }

  getPid(): number | undefined {
    return this.server?.process().pid ?? undefined;
  }
}
