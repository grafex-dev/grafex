import { resolve } from 'node:path';
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

  const componentHtml = String(component(options.props ?? {}));
  const html = renderToHTML(componentHtml, { width, height }, config.fonts);

  const buffer = await manager.render(html, { width, height }, scale, format, quality);

  return {
    buffer,
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    scale,
    format,
  };
}
