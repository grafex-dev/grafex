import type { CompositionConfig } from '../../src/types.js';

export const config: CompositionConfig = {
  width: 800,
  height: 400,
  htmlAttributes: {
    lang: 'en',
    'data-theme': 'light',
  },
  variants: {
    default: {},
    dark: {
      htmlAttributes: {
        'data-theme': 'dark',
      },
    },
  },
};

export default function WithHtmlAttributesVariant() {
  return (
    <div
      style={{
        width: '800px',
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      Variant HTML Attributes
    </div>
  );
}
