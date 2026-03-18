export const config = {
  width: 600,
  height: 400,
};

export default function Certificate() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#FAFAF7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Georgia, "Times New Roman", serif',
        position: 'relative',
        padding: '32px',
      }}
    >
      {/* Outer border */}
      <div
        style={{
          position: 'absolute',
          inset: '16px',
          border: '2px solid #C9A96E',
          borderRadius: '4px',
        }}
      />
      {/* Inner border */}
      <div
        style={{
          position: 'absolute',
          inset: '22px',
          border: '1px solid rgba(201,169,110,0.4)',
          borderRadius: '2px',
        }}
      />

      {/* Corner ornaments */}
      {[
        { top: '20px', left: '20px' },
        { top: '20px', right: '20px' },
        { bottom: '20px', left: '20px' },
        { bottom: '20px', right: '20px' },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            ...pos,
            width: '24px',
            height: '24px',
            borderTop: i < 2 ? '3px solid #C9A96E' : undefined,
            borderBottom: i >= 2 ? '3px solid #C9A96E' : undefined,
            borderLeft: i % 2 === 0 ? '3px solid #C9A96E' : undefined,
            borderRight: i % 2 === 1 ? '3px solid #C9A96E' : undefined,
          }}
        />
      ))}

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          zIndex: 1,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            color: '#C9A96E',
            fontSize: '11px',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: '600',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
          }}
        >
          — This certifies that —
        </div>

        <div
          style={{
            color: '#1A1A1A',
            fontSize: '38px',
            fontWeight: '700',
            fontStyle: 'italic',
            lineHeight: '1.1',
            letterSpacing: '-0.5px',
          }}
        >
          Certificate of Completion
        </div>

        <div
          style={{
            width: '80px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)',
            margin: '4px 0',
          }}
        />

        <div style={{ color: '#4A4A4A', fontSize: '14px', fontFamily: 'system-ui, sans-serif' }}>
          Proudly awarded to
        </div>

        <div
          style={{
            color: '#1A1A1A',
            fontSize: '30px',
            fontWeight: '700',
            letterSpacing: '-0.5px',
          }}
        >
          Maria Rodriguez
        </div>

        <div
          style={{
            color: '#4A4A4A',
            fontSize: '14px',
            fontFamily: 'system-ui, sans-serif',
            maxWidth: '380px',
            lineHeight: '1.5',
          }}
        >
          for successfully completing
          <span style={{ color: '#1A1A1A', fontStyle: 'italic', fontWeight: '600' }}>
            {' '}
            Advanced TypeScript & Node.js
          </span>
        </div>

        <div
          style={{
            color: '#7A7A7A',
            fontSize: '12px',
            fontFamily: 'system-ui, sans-serif',
            marginTop: '4px',
          }}
        >
          March 2026
        </div>

        <div
          style={{
            display: 'flex',
            gap: '60px',
            marginTop: '8px',
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
          >
            <div
              style={{
                color: '#1A1A1A',
                fontSize: '15px',
                fontStyle: 'italic',
                fontFamily: 'Georgia, serif',
              }}
            >
              Dr. James Chen
            </div>
            <div style={{ width: '120px', height: '1px', background: '#C9A96E' }} />
            <div
              style={{ color: '#7A7A7A', fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}
            >
              Instructor
            </div>
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
          >
            <div
              style={{
                color: '#1A1A1A',
                fontSize: '15px',
                fontStyle: 'italic',
                fontFamily: 'Georgia, serif',
              }}
            >
              Sarah Williams
            </div>
            <div style={{ width: '120px', height: '1px', background: '#C9A96E' }} />
            <div
              style={{ color: '#7A7A7A', fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}
            >
              Director
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
