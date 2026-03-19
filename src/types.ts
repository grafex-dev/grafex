export type Format = 'png' | 'svg';

export interface RenderOptions {
  props?: Record<string, unknown>;
  width?: number;
  height?: number;
  scale?: number;
  format?: Format;
  browser?: 'webkit' | 'chromium';
}

export interface RenderResult {
  buffer: Buffer;
  width: number;
  height: number;
  scale: number;
  format: Format;
}

export interface CompositionConfig {
  width?: number;
  height?: number;
  scale?: number;
  format?: Format;
  fonts?: string[];
}
