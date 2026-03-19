import { resolve, dirname } from 'node:path';
import { readFile } from 'node:fs/promises';
import { transpile } from './transpile.js';
import { renderToHTML } from './runtime.js';
import { BrowserManager } from './browser.js';
import type { RenderOptions, RenderResult, CompositionConfig } from './types.js';

export type { RenderOptions, RenderResult, CompositionConfig };

export const browserManager = new BrowserManager();

export async function pipeline(
  compositionPath: string,
  options: RenderOptions = {},
  manager: Pick<BrowserManager, 'render'> = browserManager,
): Promise<RenderResult> {
  const absolutePath = resolve(compositionPath);

  const js = await transpile(absolutePath);

  const dataUrl = `data:text/javascript;base64,${Buffer.from(js).toString('base64')}#${Date.now()}`;
  const mod = await import(dataUrl);

  const component = mod.default as (props: Record<string, unknown>) => unknown;
  const config: CompositionConfig = mod.config ?? {};

  const width = options.width ?? config.width ?? 1200;
  const height = options.height ?? config.height ?? 630;
  const scale = options.scale ?? config.scale ?? 1;
  const format = options.format ?? config.format ?? 'png';
  const quality = options.quality ?? config.quality ?? (format === 'jpeg' ? 90 : undefined);

  const compositionDir = dirname(absolutePath);
  const cssContents: string[] = [];
  if (config.css && config.css.length > 0) {
    for (const cssPath of config.css) {
      const resolvedCssPath = resolve(compositionDir, cssPath);
      try {
        cssContents.push(await readFile(resolvedCssPath, 'utf-8'));
      } catch {
        throw new Error(`CSS file not found: "${resolvedCssPath}" (referenced in ${absolutePath})`);
      }
    }
  }

  const componentHtml = String(component(options.props ?? {}));
  const html = renderToHTML(componentHtml, { width, height }, config.fonts, cssContents);

  const buffer = await manager.render(html, { width, height }, scale, format, quality);

  return {
    buffer,
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    scale,
    format,
  };
}
