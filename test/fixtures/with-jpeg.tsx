import type { CompositionConfig } from '../../src/types.js';

export const config: CompositionConfig = {
  width: 800,
  height: 400,
  format: 'jpeg',
};

export default function WithJpeg() {
  return (
    <div
      style={{
        width: '800px',
        height: '400px',
        backgroundColor: '#1e293b',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ color: 'white', fontSize: '48px', fontWeight: 'bold' }}>JPEG Output</h1>
    </div>
  );
}
