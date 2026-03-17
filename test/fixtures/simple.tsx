import type { CompositionConfig } from '../../src/types.js';

export const config: CompositionConfig = {
  width: 800,
  height: 400,
  format: 'png' as const,
};

export default function Simple() {
  return (
    <div
      style={{
        width: '800px',
        height: '400px',
        backgroundColor: '#4F46E5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ color: 'white', fontSize: '48px', fontWeight: 'bold' }}>Hello, Grafex</h1>
    </div>
  );
}
