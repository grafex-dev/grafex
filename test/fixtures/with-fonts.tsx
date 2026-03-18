import type { CompositionConfig } from '../../src/types.js';

export const config: CompositionConfig = {
  width: 800,
  height: 400,
  fonts: ['https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap'],
};

export default function WithFonts() {
  return (
    <div
      style={{
        width: '800px',
        height: '400px',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h1>Custom Font Composition</h1>
    </div>
  );
}
