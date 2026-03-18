export const config = {
  width: 600,
  height: 400,
};

export default function Thumbnail() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '32px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(163,230,53,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Top row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1,
        }}
      >
        {/* Episode badge */}
        <div
          style={{
            background: '#A3E635',
            borderRadius: '6px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              color: '#0F172A',
              fontSize: '13px',
              fontWeight: '800',
              letterSpacing: '0.05em',
            }}
          >
            EP 42
          </span>
        </div>

        {/* Channel tag */}
        <div
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px',
            padding: '6px 14px',
          }}
        >
          <span style={{ color: '#94A3B8', fontSize: '13px', fontWeight: '500' }}>CodeCraft</span>
        </div>
      </div>

      {/* Main title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 1 }}>
        <div
          style={{
            color: '#F1F5F9',
            fontSize: '46px',
            fontWeight: '900',
            lineHeight: '1.05',
            letterSpacing: '-1.5px',
          }}
        >
          I Built an App
          <br />
          <span
            style={{
              background: 'linear-gradient(90deg, #A3E635, #38BDF8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            With AI in 1 Hour
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#64748B',
              fontSize: '14px',
            }}
          >
            <div
              style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#A3E635' }}
            />
            TypeScript
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#64748B',
              fontSize: '14px',
            }}
          >
            <div
              style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8' }}
            />
            Full Stack
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F472B6, #FB923C)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              flexShrink: 0,
            }}
          >
            CC
          </div>
          <span style={{ color: '#94A3B8', fontSize: '14px', fontWeight: '500' }}>
            CodeCraft · 128K views
          </span>
        </div>
        <div
          style={{
            background: 'rgba(244,114,182,0.15)',
            border: '1px solid rgba(244,114,182,0.3)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '0',
              height: '0',
              borderStyle: 'solid',
              borderWidth: '7px 0 7px 14px',
              borderColor: 'transparent transparent transparent #F472B6',
              marginLeft: '3px',
            }}
          />
        </div>
      </div>
    </div>
  );
}
