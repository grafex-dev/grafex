/**
 * A complex SVG output demo: a stats dashboard card.
 *
 * Run:
 *   npx tsx src/cli.ts export \
 *     --file test/fixtures/svg-dashboard.tsx \
 *     --format svg \
 *     --out dashboard.svg
 *
 * Because format is "svg", no browser is needed — the output is
 * produced entirely from the JSX runtime, wrapped in a <foreignObject>.
 */
import type { CompositionConfig } from '../../src/types.js';

export const config: CompositionConfig = {
  width: 900,
  height: 540,
  format: 'svg',
};

// ── tiny helpers ──────────────────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        backgroundColor: color,
        color: '#fff',
      }}
    >
      {label}
    </span>
  );
}

function StatCard({
  value,
  label,
  delta,
  positive,
}: {
  value: string;
  label: string;
  delta: string;
  positive: boolean;
}) {
  return (
    <div
      style={{
        flex: '1',
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        border: '1px solid #334155',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9', lineHeight: '1' }}>
        {value}
      </span>
      <span
        style={{ fontSize: '12px', color: positive ? '#34d399' : '#f87171', fontWeight: '500' }}
      >
        {positive ? '▲' : '▼'} {delta}
      </span>
    </div>
  );
}

function BarChart({ bars }: { bars: Array<{ label: string; pct: number; color: string }> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {bars.map((b) => (
        <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '60px', fontSize: '12px', color: '#94a3b8', textAlign: 'right' }}>
            {b.label}
          </span>
          <div
            style={{
              flex: '1',
              height: '14px',
              backgroundColor: '#1e293b',
              borderRadius: '7px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${b.pct}%`,
                height: '100%',
                backgroundColor: b.color,
                borderRadius: '7px',
              }}
            />
          </div>
          <span style={{ width: '34px', fontSize: '12px', color: '#cbd5e1', textAlign: 'right' }}>
            {b.pct}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ── main composition ──────────────────────────────────────────────────────────

export default function SVGDashboard() {
  const bars = [
    { label: 'Mon', pct: 72, color: '#6366f1' },
    { label: 'Tue', pct: 58, color: '#6366f1' },
    { label: 'Wed', pct: 91, color: '#818cf8' },
    { label: 'Thu', pct: 44, color: '#6366f1' },
    { label: 'Fri', pct: 83, color: '#818cf8' },
    { label: 'Sat', pct: 27, color: '#4f46e5' },
    { label: 'Sun', pct: 15, color: '#4f46e5' },
  ];

  return (
    <div
      style={{
        width: '900px',
        height: '540px',
        backgroundColor: '#0f172a',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        color: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        padding: '36px 40px',
        gap: '24px',
        boxSizing: 'border-box',
      }}
    >
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px' }}>
            Weekly Overview
          </span>
          <span style={{ fontSize: '13px', color: '#64748b' }}>March 13 – 19, 2026</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Badge label="Live" color="#059669" />
          <Badge label="Q1 2026" color="#4f46e5" />
        </div>
      </div>

      {/* stat row */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <StatCard value="48 291" label="Page views" delta="12.4% vs last week" positive={true} />
        <StatCard value="3 872" label="Unique users" delta="4.1% vs last week" positive={true} />
        <StatCard value="1.8s" label="Avg load time" delta="0.3s slower" positive={false} />
        <StatCard value="2.6%" label="Bounce rate" delta="0.5% improvement" positive={true} />
      </div>

      {/* chart + legend */}
      <div style={{ display: 'flex', gap: '32px', flex: '1', alignItems: 'stretch' }}>
        {/* bar chart */}
        <div
          style={{
            flex: '1',
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            border: '1px solid #334155',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              color: '#94a3b8',
              marginBottom: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}
          >
            Daily sessions
          </span>
          <BarChart bars={bars} />
        </div>

        {/* top pages */}
        <div
          style={{
            width: '220px',
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            border: '1px solid #334155',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}
          >
            Top pages
          </span>
          {[
            { path: '/', views: '14 820' },
            { path: '/docs', views: '9 340' },
            { path: '/examples', views: '6 110' },
            { path: '/blog', views: '4 880' },
            { path: '/changelog', views: '2 040' },
          ].map((p, i) => (
            <div
              key={p.path}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                borderBottom: i < 4 ? '1px solid #1e3a5f22' : 'none',
              }}
            >
              <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{p.path}</span>
              <span
                style={{ fontSize: '12px', color: '#64748b', fontVariantNumeric: 'tabular-nums' }}
              >
                {p.views}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#334155' }}>
          Generated by <span style={{ color: '#6366f1', fontWeight: '600' }}>grafex</span> · SVG
          format · no browser required
        </span>
        <span style={{ fontSize: '11px', color: '#334155' }}>grafex.dev</span>
      </div>
    </div>
  );
}
