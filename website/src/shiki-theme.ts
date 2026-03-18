// Custom Shiki theme matching the Grafex Pixel Pop design system
// Colors from docs/design-system.md
export const grafexTheme = {
  name: 'grafex',
  type: 'dark' as const,
  colors: {
    'editor.background': '#0F1729',
    'editor.foreground': '#94A3B8',
  },
  tokenColors: [
    {
      scope: ['keyword', 'storage.type', 'storage.modifier', 'keyword.control'],
      settings: { foreground: '#F472B6' }, // primary (pink)
    },
    {
      scope: ['entity.name.tag', 'punctuation.definition.tag'],
      settings: { foreground: '#F472B6' }, // primary (pink) — JSX tags
    },
    {
      scope: [
        'entity.name.function',
        'entity.name.type',
        'support.type',
        'entity.other.attribute-name',
      ],
      settings: { foreground: '#38BDF8' }, // secondary (sky)
    },
    {
      scope: ['variable', 'variable.other', 'meta.object-literal.key'],
      settings: { foreground: '#38BDF8' }, // secondary (sky)
    },
    {
      scope: ['string', 'string.quoted'],
      settings: { foreground: '#A3E635' }, // accent-lime
    },
    {
      scope: ['constant.numeric'],
      settings: { foreground: '#FB923C' }, // accent-amber
    },
    {
      scope: ['comment'],
      settings: { foreground: '#475569', fontStyle: 'italic' },
    },
    {
      scope: ['punctuation', 'meta.brace'],
      settings: { foreground: '#94A3B8' }, // text-secondary
    },
    {
      scope: ['constant.language.boolean'],
      settings: { foreground: '#FB923C' }, // accent-amber
    },
  ],
};
