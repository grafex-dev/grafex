export const config = {
  width: 800,
  height: 400,
  format: 'png' as const,
};

interface BadgeProps {
  label: string;
  color?: string;
}

function Badge({ label, color = 'rgba(255,255,255,0.2)' }: BadgeProps) {
  return (
    <span
      style={{
        backgroundColor: color,
        borderRadius: '999px',
        padding: '8px 24px',
        fontSize: '18px',
        fontWeight: '500',
        color: 'white',
      }}
    >
      {label}
    </span>
  );
}

interface StackProps {
  children: string;
}

function Stack({ children }: StackProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  );
}

export default function WithComponents() {
  return (
    <div
      style={{
        width: '800px',
        height: '400px',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, sans-serif',
        gap: '24px',
      }}
    >
      <h1 style={{ color: 'white', fontSize: '42px', fontWeight: 'bold', margin: '0' }}>
        Grafex Components
      </h1>
      <Stack>
        <Badge label="JSX" color="#6366f1" />
        <Badge label="PNG" color="#8b5cf6" />
        <Badge label="Fast" color="#a855f7" />
      </Stack>
    </div>
  );
}
