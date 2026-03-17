import type { CompositionConfig } from '../../src/types.js';

export const config: CompositionConfig = {
  width: 800,
  height: 400,
  format: 'png' as const,
};

interface Props {
  title: string;
  subtitle?: string;
  backgroundColor?: string;
}

export default function WithProps({
  title,
  subtitle = 'Built with Grafex',
  backgroundColor = '#1e1e2e',
}: Props) {
  return (
    <div
      style={{
        width: '800px',
        height: '400px',
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: 'white',
        gap: '16px',
      }}
    >
      <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0' }}>{title}</h1>
      <p style={{ fontSize: '24px', opacity: '0.7', margin: '0' }}>{subtitle}</p>
    </div>
  );
}
