import type { CompositionConfig } from '../../src/types.js';

export const config: CompositionConfig = {
  width: 800,
  height: 400,
  css: ['./styles.css'],
};

export default function WithCss() {
  return (
    <div
      className="grafex-test"
      style={{
        width: '800px',
        height: '400px',
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      CSS Support
    </div>
  );
}
