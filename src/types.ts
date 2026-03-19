export interface RenderOptions {
  props?: Record<string, unknown>;
  width?: number;
  height?: number;
  scale?: number;
  format?: 'png' | 'jpeg';
  quality?: number;
  browser?: 'webkit' | 'chromium';
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
}
