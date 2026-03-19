import { resolve } from 'node:path';
import { transpile } from './transpile.js';
import { renderToHTML, renderToSVG } from './runtime.js';
import { BrowserManager } from './browser.js';
import type { RenderOptions, RenderResult, CompositionConfig } from './types.js';

export type { RenderOptions, RenderResult, CompositionConfig };

interface FormatContext {
  componentHtml: string;
  width: number;
  height: number;
  scale: number;
  fonts?: string[];
  manager: Pick<BrowserManager, 'render'>;
}

type FormatHandler = (ctx: FormatContext) => Promise<RenderResult>;

const formatHandlers: Record<string, FormatHandler> = {
  png: async ({ componentHtml, width, height, scale, fonts, manager }) => {
    const html = renderToHTML(componentHtml, { width, height }, fonts);
    const buffer = await manager.render(html, { width, height }, scale);
    return {
      buffer,
      width: Math.round(width * scale),
      height: Math.round(height * scale),
      scale,
      format: 'png',
    };
  },

  svg: async ({ componentHtml, width, height, scale, fonts }) => {
    const svgString = renderToSVG(componentHtml, { width, height }, scale, fonts);
    return {
      buffer: Buffer.from(svgString),
      width: Math.round(width * scale),
      height: Math.round(height * scale),
      scale,
      format: 'svg',
    };
  },
};

// ── Pipeline ──────────────────────────────────────────────────────────────────

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

  const handler = formatHandlers[format];
  if (!handler) throw new Error(`Unsupported format: "${format}"`);

  const componentHtml = String(component(options.props ?? {}));
  return handler({ componentHtml, width, height, scale, fonts: config.fonts, manager });
}
