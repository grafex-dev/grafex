export interface VariantConfig {
  width?: number;
  height?: number;
  scale?: number;
  format?: 'png' | 'jpeg';
  quality?: number;
  fonts?: string[];
  css?: string[];
  props?: Record<string, unknown>;
}

export interface RenderOptions {
  props?: Record<string, unknown>;
  width?: number;
  height?: number;
  scale?: number;
  format?: 'png' | 'jpeg';
  quality?: number;
  browser?: 'webkit' | 'chromium';
  variant?: string;
}

export interface RenderResult {
  buffer: Buffer;
  width: number;
  height: number;
  scale: number;
  format: 'png' | 'jpeg';
}

export interface CompositionConfig {
  width?: number;
  height?: number;
  scale?: number;
  format?: 'png' | 'jpeg';
  quality?: number;
  fonts?: string[];
  css?: string[];
  variants?: Record<string, VariantConfig>;
}
