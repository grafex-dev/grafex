export const config = {
  width: 600,
  height: 400,
};

export default function OgCard() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '52px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent glow */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(244,114,182,0.2) 0%, transparent 70%)',
        }}
      />

      {/* Top: tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
        <div
          style={{
            background: 'rgba(163,230,53,0.15)',
            border: '1px solid rgba(163,230,53,0.3)',
            borderRadius: '6px',
            padding: '4px 12px',
            color: '#A3E635',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Tutorial
        </div>
        <span style={{ color: '#475569', fontSize: '13px' }}>5 min read</span>
      </div>

      {/* Middle: title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 1 }}>
        <div
          style={{
            color: '#F1F5F9',
            fontSize: '36px',
            fontWeight: '700',
            lineHeight: '1.2',
            letterSpacing: '-0.5px',
          }}
        >
          Building Modern APIs
        </div>
        <div style={{ color: '#94A3B8', fontSize: '16px', lineHeight: '1.5' }}>
          Best practices for REST and GraphQL in 2026
        </div>
      </div>

      {/* Bottom: author + meta */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F472B6, #38BDF8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              flexShrink: 0,
            }}
          >
            JS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ color: '#E2E8F0', fontSize: '14px', fontWeight: '600' }}>
              Jane Smith
            </span>
            <span style={{ color: '#64748B', fontSize: '12px' }}>March 15, 2026</span>
          </div>
        </div>
        <div
          style={{
            color: '#475569',
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '0.05em',
          }}
        >
          dev.blog
        </div>
      </div>

      {/* Bottom-left accent stripe */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '3px',
          background: 'linear-gradient(90deg, #F472B6, #38BDF8, #A3E635)',
        }}
      />
    </div>
  );
}
