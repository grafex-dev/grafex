import { pipeline, browserManager as defaultBrowserManager } from './render.js';
import { BrowserManager } from './browser.js';
import type { RenderOptions, RenderResult } from './types.js';

export { h, Fragment, renderToHTML } from './runtime.js';
export { BrowserManager } from './browser.js';
export type { RenderOptions, RenderResult } from './types.js';

let currentManager: BrowserManager | null = defaultBrowserManager;

export async function render(
  compositionPath: string,
  options?: RenderOptions,
): Promise<RenderResult> {
  if (currentManager === null) {
    currentManager = new BrowserManager();
  }
  return pipeline(compositionPath, options, currentManager);
}

export async function close(): Promise<void> {
  if (currentManager !== null) {
    await currentManager.close();
    currentManager = null;
  }
}
