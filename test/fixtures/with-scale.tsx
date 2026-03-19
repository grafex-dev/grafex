import type { CompositionConfig } from '../../src/types.js';

export const config: CompositionConfig = {
  width: 800,
  height: 400,
  scale: 2,
};

export default function WithScale() {
  return (
    <div
      style={{
        width: '800px',
        height: '400px',
        backgroundColor: '#10B981',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1 style={{ color: 'white', fontSize: '48px' }}>Scale Test</h1>
    </div>
  );
}
