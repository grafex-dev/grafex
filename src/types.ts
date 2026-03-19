export interface RenderOptions {
  props?: Record<string, unknown>;
  width?: number;
  height?: number;
  scale?: number;
  format?: 'png';
  browser?: 'webkit' | 'chromium';
}

export interface RenderResult {
  buffer: Buffer;
  width: number;
  height: number;
  scale: number;
  format: 'png';
}

export interface CompositionConfig {
  width?: number;
  height?: number;
  scale?: number;
  format?: 'png';
  fonts?: string[];
}
