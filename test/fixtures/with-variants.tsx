import type { CompositionConfig } from '../../src/types.js';

export const config: CompositionConfig = {
  width: 1200,
  height: 630,
  format: 'png' as const,
  variants: {
    og: {},
    twitter: { width: 1200, height: 675 },
    square: { width: 1080, height: 1080, props: { layout: 'square' } },
  },
};

interface Props {
  layout?: string;
}

export default function WithVariants({ layout = 'default' }: Props) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#1e293b',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: 'white',
        fontSize: '48px',
      }}
    >
      {layout}
    </div>
  );
}
