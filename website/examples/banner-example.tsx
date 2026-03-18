export const config = {
  width: 600,
  height: 400,
};

export default function Banner() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0B0E14',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Pink top accent stripe */}
      <div
        style={{
          height: '6px',
          background: 'linear-gradient(90deg, #F472B6, #FB923C)',
          flexShrink: 0,
        }}
      />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 60px',
          position: 'relative',
        }}
      >
        {/* Background texture */}
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)',
          }}
        />

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
            width: 'fit-content',
          }}
        >
          <div
            style={{
              background: '#FB923C',
              borderRadius: '4px',
              padding: '4px 10px',
              color: 'white',
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Limited Time
          </div>
          <span style={{ color: '#64748B', fontSize: '14px' }}>Ends March 31</span>
        </div>

        <div
          style={{
            color: '#F1F5F9',
            fontSize: '56px',
            fontWeight: '800',
            lineHeight: '1.05',
            letterSpacing: '-1.5px',
            marginBottom: '8px',
          }}
        >
          Summer Sale
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '12px',
            marginBottom: '28px',
          }}
        >
          <span
            style={{
              fontSize: '48px',
              fontWeight: '800',
              letterSpacing: '-1px',
              background: 'linear-gradient(135deg, #F472B6, #FB923C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            40% Off
          </span>
          <span style={{ color: '#64748B', fontSize: '18px' }}>everything</span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#F472B6',
            borderRadius: '8px',
            padding: '14px 28px',
            width: 'fit-content',
            zIndex: 1,
          }}
        >
          <span style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Shop Now</span>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>→</span>
        </div>
      </div>
    </div>
  );
}
