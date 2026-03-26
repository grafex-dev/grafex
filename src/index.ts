import {
  pipeline,
  pipelineAll,
  hasVariants,
  loadCompositionConfig,
  browserManager as defaultBrowserManager,
} from './render.js';
import { BrowserManager } from './browser.js';
import type { RenderOptions, RenderResult, VariantConfig } from './types.js';

export { h, Fragment, renderToHTML } from './runtime.js';
export type { HtmlString } from './runtime.js';
export { BrowserManager } from './browser.js';
export type { RenderOptions, RenderResult, CompositionConfig, VariantConfig } from './types.js';

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

export async function renderAll(
  compositionPath: string,
  options?: Omit<RenderOptions, 'variant'>,
): Promise<Map<string, RenderResult>> {
  if (currentManager === null) {
    currentManager = new BrowserManager();
  }
  return pipelineAll(compositionPath, options, currentManager);
}

export async function close(): Promise<void> {
  if (currentManager !== null) {
    await currentManager.close();
    currentManager = null;
  }
}

export { hasVariants } from './render.js';

export async function getCompositionConfig(
  compositionPath: string,
): Promise<import('./types.js').CompositionConfig> {
  return loadCompositionConfig(compositionPath);
}
