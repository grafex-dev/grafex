export const config = {
  width: 1200,
  height: 800,
  format: 'png' as const,
};

export default function Complex() {
  return (
    <div
      style={{
        width: '1200px',
        height: '800px',
        position: 'relative',
        backgroundColor: '#0f0f1a',
        fontFamily: 'system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          right: '-80px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-60px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(118, 75, 162, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '60px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '60px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
              }}
            />
            <span style={{ color: 'white', fontSize: '28px', fontWeight: '700' }}>grafex</span>
          </div>
          <span
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '20px',
              fontWeight: '400',
            }}
          >
            v1.0.0 · Open Source
          </span>
        </div>

        {/* Center content */}
        <div
          style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              backgroundColor: 'rgba(102, 126, 234, 0.2)',
              borderRadius: '999px',
              padding: '6px 20px',
              marginBottom: '24px',
              width: 'fit-content',
            }}
          >
            <span style={{ color: '#a5b4fc', fontSize: '18px', fontWeight: '600' }}>
              Now in Beta
            </span>
          </div>

          <h1
            style={{
              fontSize: '80px',
              fontWeight: '900',
              color: 'white',
              lineHeight: '1.1',
              marginBottom: '24px',
              letterSpacing: '-3px',
            }}
          >
            Turn JSX into
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #667eea, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              perfect images
            </span>
          </h1>

          <p
            style={{
              fontSize: '26px',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: '1.6',
              maxWidth: '700px',
              marginBottom: '48px',
            }}
          >
            Write compositions in JSX. Export to PNG, SVG, or PDF. No browser window required.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {['Full CSS Support', 'TypeScript Native', 'Zero Config', 'Lightning Fast'].map(
              (feature) => (
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '999px',
                    padding: '10px 24px',
                  }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>
                    {feature}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Bottom stats */}
        <div
          style={{
            display: 'flex',
            gap: '48px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '32px',
          }}
        >
          {[
            { label: 'Warm Render', value: '<200ms' },
            { label: 'Bundle Size', value: '~50MB' },
            { label: 'CSS Support', value: '100%' },
          ].map((stat) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: 'white', fontSize: '32px', fontWeight: '700' }}>
                {stat.value}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px' }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
