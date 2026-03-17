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

  const componentHtml = String(component(options.props ?? {}));
  const html = renderToHTML(componentHtml, { width, height });

  const buffer = await manager.render(html, { width, height });

  return {
    buffer,
    width,
    height,
    format: 'png',
  };
}
