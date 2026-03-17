export const config = {
  width: 1200,
  height: 630,
  format: 'png' as const,
};

export default function OGCard() {
  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: 'white',
        padding: '60px',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '60px 80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <h1
          style={{
            fontSize: '72px',
            fontWeight: '800',
            margin: '0 0 20px 0',
            textAlign: 'center',
            letterSpacing: '-2px',
          }}
        >
          Grafex
        </h1>
        <p
          style={{
            fontSize: '32px',
            opacity: '0.85',
            margin: '0 0 40px 0',
            textAlign: 'center',
            fontWeight: '300',
          }}
        >
          Images as Code
        </p>
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          <span
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '999px',
              padding: '8px 24px',
              fontSize: '20px',
              fontWeight: '500',
            }}
          >
            JSX
          </span>
          <span
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '999px',
              padding: '8px 24px',
              fontSize: '20px',
              fontWeight: '500',
            }}
          >
            PNG
          </span>
          <span
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '999px',
              padding: '8px 24px',
              fontSize: '20px',
              fontWeight: '500',
            }}
          >
            SVG
          </span>
        </div>
      </div>
    </div>
  );
}
