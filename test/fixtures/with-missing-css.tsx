import type { CompositionConfig } from '../../src/types.js';

export const config: CompositionConfig = {
  width: 800,
  height: 400,
  css: ['./nonexistent.css'],
};

export default function WithMissingCss() {
  return <div style={{ width: '800px', height: '400px' }}>Missing CSS</div>;
}
