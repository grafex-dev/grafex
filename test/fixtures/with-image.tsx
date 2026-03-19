import type { CompositionConfig } from '../../src/types.js';

export const config: CompositionConfig = {
  width: 800,
  height: 400,
};

export default function WithImage() {
  return (
    <div
      style={{
        width: '800px',
        height: '400px',
        backgroundColor: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img src="./test-image.png" alt="test" width="100" height="100" />
    </div>
  );
}
