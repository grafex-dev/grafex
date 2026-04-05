import type { CompositionConfig } from '../../src/types.js';

export const config: CompositionConfig = {
  width: 800,
  height: 400,
  htmlAttributes: {
    'data-theme': 'dark',
    lang: 'en',
  },
};

export default function WithHtmlAttributes() {
  return (
    <div
      style={{
        width: '800px',
        height: '400px',
        backgroundColor: '#0f172a',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      HTML Attributes
    </div>
  );
}
