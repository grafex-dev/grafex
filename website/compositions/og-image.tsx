export const config = {
  width: 1200,
  height: 630,
};

export default function OgImage() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0B0E14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-200px',
          left: '-100px',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(244,114,182,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-200px',
          right: '200px',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Left side: text + code snippet */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '540px',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(163,230,53,0.12)',
            border: '1px solid rgba(163,230,53,0.25)',
            borderRadius: '100px',
            padding: '6px 16px',
            width: 'fit-content',
          }}
        >
          <span
            style={{
              color: '#A3E635',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '0.05em',
            }}
          >
            OPEN SOURCE
          </span>
        </div>

        <div
          style={{
            color: '#F472B6',
            fontSize: '120px',
            fontWeight: '800',
            lineHeight: '1',
            letterSpacing: '-4px',
          }}
        >
          Grafex
        </div>
        <div
          style={{ color: '#64748B', fontSize: '42px', fontWeight: '400', letterSpacing: '-0.5px' }}
        >
          Images as Code.
        </div>

        {/* Mini code snippet */}
        <div
          style={{
            marginTop: '20px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ fontFamily: 'monospace', fontSize: '18px', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#F472B6' }}>export</span>
            <span style={{ color: '#F472B6' }}>default</span>
            <span style={{ color: '#F472B6' }}>function</span>
            <span style={{ color: '#38BDF8' }}>Card</span>
            <span style={{ color: '#94A3B8' }}>() {'{'}</span>
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '18px',
              paddingLeft: '20px',
              display: 'flex',
              gap: '8px',
            }}
          >
            <span>
              <span style={{ color: '#F472B6' }}>{'return <div '}</span>
              <span style={{ color: '#38BDF8' }}>style</span>
              <span style={{ color: '#94A3B8' }}>{'={{ '}</span>
              <span style={{ color: '#A3E635' }}>...</span>
              <span style={{ color: '#94A3B8' }}>{' }}>'}</span>
            </span>
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '18px',
              paddingLeft: '40px',
              color: '#94A3B8',
            }}
          >
            Hello, Grafex!
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '18px',
              paddingLeft: '20px',
              color: '#F472B6',
            }}
          >
            &lt;/div&gt;
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '18px', color: '#94A3B8' }}>{'}'}</div>
        </div>
      </div>

      {/* Right side: rendered card preview */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '480px',
            height: '290px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 24px 60px rgba(102,126,234,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span style={{ color: 'white', fontSize: '44px', fontWeight: '700' }}>
            Hello, Grafex!
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#38BDF8',
            fontSize: '14px',
            fontFamily: 'monospace',
          }}
        >
          <span style={{ color: '#64748B' }}>$</span>
          <span style={{ color: '#A3E635' }}>grafex export</span>
          <span style={{ color: '#94A3B8' }}>-f card.tsx -o</span>
          <span style={{ color: '#F472B6' }}>card.png</span>
        </div>
      </div>

      {/* Corner accent */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          width: '4px',
          height: '80px',
          background: 'linear-gradient(to top, #F472B6, transparent)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          width: '80px',
          height: '4px',
          background: 'linear-gradient(to left, #F472B6, transparent)',
        }}
      />
    </div>
  );
}
