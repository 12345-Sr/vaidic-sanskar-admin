import React from 'react';

export function BarChart({ labels, a, b }) {
  const W = 560, H = 190, pad = 28;
  const max = Math.max(...a, ...b) * 1.15 || 1;
  const bw = (W - pad * 2) / labels.length;
  const y = (v) => H - pad - (v / max) * (H - pad * 2);
  const grid = [0, 1, 2, 3].map((i) => {
    const gy = pad + i * ((H - pad * 2) / 3);
    return <line key={i} x1={pad} y1={gy} x2={W - pad} y2={gy} stroke="var(--border)" />;
  });
  return (
    <div className="tablewrap">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 460, height: 'auto' }}>
        {grid}
        {labels.map((l, i) => {
          const x = pad + i * bw;
          return (
            <g key={l}>
              <rect x={x + bw * 0.18} y={y(a[i])} width={bw * 0.28} height={H - pad - y(a[i])} rx="3" fill="var(--accent)" />
              <rect x={x + bw * 0.5} y={y(b[i])} width={bw * 0.28} height={H - pad - y(b[i])} rx="3" fill="var(--maroon)" />
              <text x={x + bw * 0.44} y={H - 9} fontSize="10" fill="var(--muted)" textAnchor="middle">{l}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.v, 0) || 1;
  const cx = 90, cy = 90, r = 66, rr = 42;
  let a = -Math.PI / 2;
  const segs = data.map((d) => {
    const ang = (d.v / total) * Math.PI * 2, e = a + ang;
    const x1 = cx + r * Math.cos(a), y1 = cy + r * Math.sin(a);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const x3 = cx + rr * Math.cos(e), y3 = cy + rr * Math.sin(e);
    const x4 = cx + rr * Math.cos(a), y4 = cy + rr * Math.sin(a);
    const large = ang > Math.PI ? 1 : 0;
    const path = `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${rr} ${rr} 0 ${large} 0 ${x4} ${y4} Z`;
    a = e;
    return <path key={d.n} d={path} fill={d.c} />;
  });
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg viewBox="0 0 180 180" style={{ width: 150, height: 150 }}>
        {segs}
        <text x="90" y="86" fontSize="20" fontWeight="800" fill="var(--fg)" textAnchor="middle">{total}%</text>
        <text x="90" y="104" fontSize="10" fill="var(--muted)" textAnchor="middle">GMV</text>
      </svg>
      <div className="legend" style={{ flexDirection: 'column', gap: 9, marginTop: 0 }}>
        {data.map((d) => (
          <span key={d.n}><span className="dot" style={{ background: d.c }} />{d.n} · <b style={{ color: 'var(--fg)' }}>{d.v}%</b></span>
        ))}
      </div>
    </div>
  );
}
