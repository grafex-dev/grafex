export const config = {
  width: 600,
  height: 400,
};

export default function Diagram() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0B1120',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '40px 48px',
      }}
    >
      {/* Title */}
      <div style={{ marginBottom: '36px' }}>
        <div
          style={{
            color: '#94A3B8',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
        >
          Architecture Overview
        </div>
        <div style={{ color: '#E2E8F0', fontSize: '20px', fontWeight: '700' }}>Request Flow</div>
      </div>

      {/* Diagram: Client → API → Database */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0',
        }}
      >
        {/* Client Box */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '120px',
              padding: '16px 20px',
              background: 'rgba(56,189,248,0.08)',
              border: '1.5px solid rgba(56,189,248,0.35)',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '22px' }}>🖥</div>
            <div style={{ color: '#38BDF8', fontSize: '14px', fontWeight: '700' }}>Client</div>
            <div
              style={{ color: '#475569', fontSize: '11px', textAlign: 'center', lineHeight: '1.4' }}
            >
              Browser / Mobile
            </div>
          </div>
          <div
            style={{
              background: 'rgba(56,189,248,0.1)',
              border: '1px solid rgba(56,189,248,0.2)',
              borderRadius: '4px',
              padding: '3px 8px',
              color: '#38BDF8',
              fontSize: '10px',
              fontWeight: '600',
              letterSpacing: '0.05em',
            }}
          >
            HTTPS
          </div>
        </div>

        {/* Arrow 1 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            margin: '0 12px',
            marginBottom: '36px',
          }}
        >
          <div
            style={{
              color: '#64748B',
              fontSize: '10px',
              fontWeight: '600',
              letterSpacing: '0.05em',
            }}
          >
            REST / GraphQL
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            <div
              style={{
                width: '60px',
                height: '2px',
                background: 'linear-gradient(90deg, rgba(56,189,248,0.4), rgba(244,114,182,0.4))',
              }}
            />
            <div
              style={{
                width: '0',
                height: '0',
                borderStyle: 'solid',
                borderWidth: '5px 0 5px 8px',
                borderColor: 'transparent transparent transparent rgba(244,114,182,0.6)',
              }}
            />
          </div>
        </div>

        {/* API Box */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '120px',
              padding: '16px 20px',
              background: 'rgba(244,114,182,0.08)',
              border: '1.5px solid rgba(244,114,182,0.35)',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '22px' }}>⚡</div>
            <div style={{ color: '#F472B6', fontSize: '14px', fontWeight: '700' }}>API</div>
            <div
              style={{ color: '#475569', fontSize: '11px', textAlign: 'center', lineHeight: '1.4' }}
            >
              Node.js Server
            </div>
          </div>
          <div
            style={{
              background: 'rgba(244,114,182,0.1)',
              border: '1px solid rgba(244,114,182,0.2)',
              borderRadius: '4px',
              padding: '3px 8px',
              color: '#F472B6',
              fontSize: '10px',
              fontWeight: '600',
              letterSpacing: '0.05em',
            }}
          >
            Port 3000
          </div>
        </div>

        {/* Arrow 2 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            margin: '0 12px',
            marginBottom: '36px',
          }}
        >
          <div
            style={{
              color: '#64748B',
              fontSize: '10px',
              fontWeight: '600',
              letterSpacing: '0.05em',
            }}
          >
            SQL / ORM
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            <div
              style={{
                width: '60px',
                height: '2px',
                background: 'linear-gradient(90deg, rgba(244,114,182,0.4), rgba(163,230,53,0.4))',
              }}
            />
            <div
              style={{
                width: '0',
                height: '0',
                borderStyle: 'solid',
                borderWidth: '5px 0 5px 8px',
                borderColor: 'transparent transparent transparent rgba(163,230,53,0.6)',
              }}
            />
          </div>
        </div>

        {/* Database Box */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '120px',
              padding: '16px 20px',
              background: 'rgba(163,230,53,0.08)',
              border: '1.5px solid rgba(163,230,53,0.35)',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '22px' }}>🗄</div>
            <div style={{ color: '#A3E635', fontSize: '14px', fontWeight: '700' }}>Database</div>
            <div
              style={{ color: '#475569', fontSize: '11px', textAlign: 'center', lineHeight: '1.4' }}
            >
              PostgreSQL
            </div>
          </div>
          <div
            style={{
              background: 'rgba(163,230,53,0.1)',
              border: '1px solid rgba(163,230,53,0.2)',
              borderRadius: '4px',
              padding: '3px 8px',
              color: '#A3E635',
              fontSize: '10px',
              fontWeight: '600',
              letterSpacing: '0.05em',
            }}
          >
            Port 5432
          </div>
        </div>
      </div>
    </div>
  );
}
