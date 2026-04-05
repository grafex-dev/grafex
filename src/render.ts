import { resolve, dirname } from 'node:path';
import { readFile } from 'node:fs/promises';
import { transpile } from './transpile.js';
import { renderToHTML } from './runtime.js';
import { BrowserManager } from './browser.js';
import { embedLocalAssets, embedCssAssets } from './assets.js';
import type { RenderOptions, RenderResult, CompositionConfig, VariantConfig } from './types.js';

export type { RenderOptions, RenderResult, CompositionConfig, VariantConfig };

export const browserManager = new BrowserManager();

async function loadModule(absolutePath: string): Promise<{ mod: Record<string, unknown> }> {
  const js = await transpile(absolutePath);
  const dataUrl = `data:text/javascript;base64,${Buffer.from(js).toString('base64')}#${Date.now()}`;
  const mod = await import(dataUrl);
  return { mod };
}

async function pipelineWithModule(
  absolutePath: string,
  mod: Record<string, unknown>,
  options: RenderOptions,
  manager: Pick<BrowserManager, 'render'>,
): Promise<RenderResult> {
  const component = mod.default as (props: Record<string, unknown>) => unknown;
  const config: CompositionConfig = (mod.config as CompositionConfig) ?? {};

  let variant: VariantConfig | undefined;
  if (options.variant !== undefined) {
    if (!config.variants) {
      throw new Error(
        `Variant "${options.variant}" requested but this composition has no variants defined.`,
      );
    }
    variant = config.variants[options.variant];
    if (!variant) {
      const available = Object.keys(config.variants).join(', ');
      throw new Error(`Unknown variant "${options.variant}". Available variants: ${available}`);
    }
  }

  const width = options.width ?? variant?.width ?? config.width ?? 1200;
  const height = options.height ?? variant?.height ?? config.height ?? 630;
  const scale = options.scale ?? variant?.scale ?? config.scale ?? 1;
  const format = options.format ?? variant?.format ?? config.format ?? 'png';
  const quality =
    options.quality ?? variant?.quality ?? config.quality ?? (format === 'jpeg' ? 90 : undefined);

  const effectiveCss = variant?.css ?? config.css;
  const effectiveFonts = variant?.fonts ?? config.fonts;
  const effectiveHtmlAttributes =
    variant?.htmlAttributes !== undefined
      ? { ...config.htmlAttributes, ...variant.htmlAttributes }
      : config.htmlAttributes;

  const compositionDir = dirname(absolutePath);
  const cssContents: string[] = [];
  if (effectiveCss && effectiveCss.length > 0) {
    for (const cssPath of effectiveCss) {
      const resolvedCssPath = resolve(compositionDir, cssPath);
      let rawCss: string;
      try {
        rawCss = await readFile(resolvedCssPath, 'utf-8');
      } catch {
        throw new Error(`CSS file not found: "${resolvedCssPath}" (referenced in ${absolutePath})`);
      }
      cssContents.push(await embedCssAssets(rawCss, dirname(resolvedCssPath)));
    }
  }

  const resolvedProps = { ...(variant?.props ?? {}), ...(options.props ?? {}) };
  const componentHtml = String(component(resolvedProps));
  const rawHtml = renderToHTML(
    componentHtml,
    { width, height },
    effectiveFonts,
    cssContents,
    effectiveHtmlAttributes,
  );
  const html = await embedLocalAssets(rawHtml, compositionDir);

  const buffer = await manager.render(html, { width, height }, scale, format, quality);

  return {
    buffer,
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    scale,
    format,
  };
}

export async function pipeline(
  compositionPath: string,
  options: RenderOptions = {},
  manager: Pick<BrowserManager, 'render'> = browserManager,
): Promise<RenderResult> {
  const absolutePath = resolve(compositionPath);
  const { mod } = await loadModule(absolutePath);
  return pipelineWithModule(absolutePath, mod, options, manager);
}

export function hasVariants(config: CompositionConfig): boolean {
  return !!config.variants && Object.keys(config.variants).length > 0;
}

export async function loadCompositionConfig(compositionPath: string): Promise<CompositionConfig> {
  const absolutePath = resolve(compositionPath);
  const { mod } = await loadModule(absolutePath);
  return (mod.config as CompositionConfig) ?? {};
}

export async function pipelineAll(
  compositionPath: string,
  options: Omit<RenderOptions, 'variant'> = {},
  manager: Pick<BrowserManager, 'render'> = browserManager,
): Promise<Map<string, RenderResult>> {
  const absolutePath = resolve(compositionPath);
  const { mod } = await loadModule(absolutePath);

  const config: CompositionConfig = (mod.config as CompositionConfig) ?? {};

  if (!hasVariants(config)) {
    throw new Error('pipelineAll() requires a composition with config.variants defined.');
  }

  const results = new Map<string, RenderResult>();
  for (const variantName of Object.keys(config.variants!)) {
    const result = await pipelineWithModule(
      absolutePath,
      mod,
      { ...options, variant: variantName },
      manager,
    );
    results.set(variantName, result);
  }
  return results;
}
