export const config = {
  width: 600,
  height: 400,
};

export default function SocialCard() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Profile row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #38BDF8, #A3E635)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0F172A',
            fontSize: '20px',
            fontWeight: '800',
            flexShrink: 0,
          }}
        >
          AK
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ color: '#F1F5F9', fontSize: '17px', fontWeight: '700' }}>Alex Kim</span>
          <span style={{ color: '#475569', fontSize: '14px' }}>@alexkim_dev</span>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="#38BDF8"
            style={{ display: 'block' }}
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
      </div>

      {/* Quote */}
      <div
        style={{
          color: '#E2E8F0',
          fontSize: '22px',
          lineHeight: '1.5',
          fontWeight: '400',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          padding: '20px 0',
        }}
      >
        "Stop reimplementing CSS layout engines. Use a real browser. Grafex gives you full CSS
        support with zero extra config — it just works."
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <span style={{ color: '#475569', fontSize: '14px' }}>
            <span style={{ color: '#F1F5F9', fontWeight: '600' }}>2.4K</span> Likes
          </span>
          <span style={{ color: '#475569', fontSize: '14px' }}>
            <span style={{ color: '#F1F5F9', fontWeight: '600' }}>847</span> Retweets
          </span>
        </div>
        <div
          style={{
            background: 'rgba(56,189,248,0.1)',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: '6px',
            padding: '6px 16px',
            color: '#38BDF8',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          grafex.dev
        </div>
      </div>
    </div>
  );
}
