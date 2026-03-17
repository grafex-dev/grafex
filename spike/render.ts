import { transpile } from './transpile.js';
import { renderToHTML } from './runtime.js';
import type { BrowserEngine } from './engines/types.js';

export interface CompositionConfig {
  width: number;
  height: number;
}

export interface RenderResult {
  png: Buffer;
  transpileMs: number;
  executeMs: number;
  renderMs: number;
  totalMs: number;
}

export async function renderComposition(
  compositionPath: string,
  engine: BrowserEngine,
): Promise<RenderResult> {
  // Stage 1: Transpile TSX -> JS
  const t0 = process.hrtime.bigint();
  const js = await transpile(compositionPath);
  const t1 = process.hrtime.bigint();

  // Stage 2: Execute JS to get HTML string
  const dataUrl = `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`;
  const mod = await import(dataUrl);

  const component = mod.default as (props: Record<string, unknown>) => string;
  const config: CompositionConfig = mod.config ?? { width: 1200, height: 630 };
  const componentHtml = component({});
  const html = renderToHTML(componentHtml, config);
  const t2 = process.hrtime.bigint();

  // Stage 3: Browser render -> PNG
  const png = await engine.render(html, { width: config.width, height: config.height });
  const t3 = process.hrtime.bigint();

  const transpileMs = Number(t1 - t0) / 1_000_000;
  const executeMs = Number(t2 - t1) / 1_000_000;
  const renderMs = Number(t3 - t2) / 1_000_000;

  return {
    png,
    transpileMs,
    executeMs,
    renderMs,
    totalMs: transpileMs + executeMs + renderMs,
  };
}
