import { execFileSync } from 'child_process';
import type { BrowserEngine } from './types.js';

export class SparticuzEngine implements BrowserEngine {
  readonly name = 'sparticuz';
  private browser: import('puppeteer-core').Browser | null = null;
  private page: import('puppeteer-core').Page | null = null;

  async launch(): Promise<void> {
    const puppeteer = await import('puppeteer-core');
    const chromium = (await import('@sparticuz/chromium')).default;

    const executablePath = await chromium.executablePath();

    // Verify the binary is actually executable on this platform
    try {
      execFileSync(executablePath, ['--version'], { timeout: 5000 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('ENOEXEC') || msg.includes('Exec format error')) {
        throw new Error(
          `@sparticuz/chromium binary is Linux x86-64 only (ELF) and cannot run on this platform (${process.platform}/${process.arch}). ` +
            'This engine is designed for AWS Lambda/serverless Linux environments.',
        );
      }
      // Other errors (exit code from --version) may be fine
    }

    this.browser = await puppeteer.default.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });

    this.page = await this.browser.newPage();
  }

  async render(
    html: string,
    viewport: { width: number; height: number },
  ): Promise<Buffer> {
    if (!this.page) throw new Error('sparticuz: not launched');

    await this.page.setViewport(viewport);
    await this.page.setContent(html, { waitUntil: 'load' });

    const buffer = await this.page.screenshot({
      type: 'png',
      omitBackground: true,
      optimizeForSpeed: true,
    });

    return Buffer.from(buffer as Buffer);
  }

  close(): Promise<void> {
    return this.browser?.close() ?? Promise.resolve();
  }

  getPid(): number | undefined {
    return this.browser?.process()?.pid ?? undefined;
  }
}
