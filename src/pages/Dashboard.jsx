import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Donut } from '../components/charts';
import { dashboardApi, api } from '../api/services';

const KPI = ({ ic, bg, val, lbl }) => (
  <div className="kpi">
    <div className="top">
      <div className="ic" style={{ background: bg + '1a', color: bg }}>{ic}</div>
    </div>
    <div className="val">{val}</div>
    <div className="lbl">{lbl}</div>
  </div>
);

const Att = ({ ic, bg, fg, tx, tag, onClick }) => (
  <div className="act-row" style={{ cursor: 'pointer' }} onClick={onClick}>
    <div className="act-ic" style={{ background: bg, color: fg }}>{ic}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13 }}>{tx}</div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 1 }}>{tag}</div>
    </div>
    <span style={{ color: 'var(--muted)' }}>›</span>
  </div>
);

const Row = ({ ic, bg, fg, tx, tm }) => (
  <div className="act-row">
    <div className="act-ic" style={{ background: bg, color: fg }}>{ic}</div>
    <div>
      <div style={{ fontSize: 13 }}>{tx}</div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 1 }}>{tm}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const nav = useNavigate();
  const [data, setData] = useState({
    kpis: { revenue: '₹0', bookings: 0, vendors: 0, kycPending: 0 },
    queues: { kycPending: 0, payoutsRequested: 0, eventsPending: 0, reviewsFlagged: 0 },
    months: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    revenue: [0, 0, 0, 0, 0, 0],
    bookingsTrend: [0, 0, 0, 0, 0, 0],
    roles: [],
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboard() {
      try {
        const summary = await dashboardApi.summary();
        if (isMounted && summary) {
          setData(summary);
        }
      } catch (err) {
        console.warn('Dashboard summary fetch failed, using live store count:', err);
      }

      // Fetch recent real events / vendors
      try {
        const [vendors, bookings] = await Promise.all([
          api.vendors.list().catch(() => []),
          api.bookings.list().catch(() => []),
        ]);
        if (isMounted) {
          const acts = [];
          if (Array.isArray(vendors)) {
            vendors.slice(0, 3).forEach((v) => {
              acts.push({
                ic: '🤝',
                bg: 'var(--warn-soft)',
                fg: 'var(--warn)',
                tx: `Partner ${v.name} (${v.role}) registered — KYC ${v.kyc || 'Pending'}`,
                tm: v.appliedAt ? new Date(v.appliedAt).toLocaleDateString() : 'Recent',
              });
            });
          }
          if (Array.isArray(bookings)) {
            bookings.slice(0, 3).forEach((b) => {
              acts.push({
                ic: '🔥',
                bg: 'var(--accent-soft)',
                fg: 'var(--accent)',
                tx: `Booking ${b.id || ''} — ${b.puja || b.title || 'Pooja'}`,
                tm: b.date || 'Recent',
              });
            });
          }
          setRecentActivities(acts);
        }
      } catch {}
      if (isMounted) setLoading(false);
    }

    fetchDashboard();
    return () => { isMounted = false; };
  }, []);

  const d = data;
  const kyc = d?.queues?.kycPending || 0;
  const pay = d?.queues?.payoutsRequested || 0;
  const ev = d?.queues?.eventsPending || 0;
  const fl = d?.queues?.reviewsFlagged || 0;

  return (
    <div>
      <div className="kpis">
        <KPI ic="💰" bg="#1C9A5E" val={d?.kpis?.revenue || '₹0'} lbl="Gross Revenue" />
        <KPI ic="🔥" bg="#E67E00" val={Number(d?.kpis?.bookings || 0).toLocaleString('en-IN')} lbl="Puja Bookings" />
        <KPI ic="🤝" bg="#6A1B9A" val={d?.kpis?.vendors || 0} lbl="Active Partners" />
        <KPI ic="🪪" bg="#C9881A" val={kyc} lbl="KYC Pending" />
      </div>

      <div className="grid2">
        <div className="panel">
          <h3>Revenue & Bookings</h3>
          <div className="psub">Live Performance</div>
          <BarChart labels={d.months || []} a={d.revenue || []} b={d.bookingsTrend || []} />
          <div className="legend">
            <span><span className="dot" style={{ background: 'var(--accent)' }} />Revenue (₹)</span>
            <span><span className="dot" style={{ background: 'var(--maroon)' }} />Bookings</span>
          </div>
        </div>
        <div className="panel">
          <h3>Partners by Role</h3>
          <div className="psub">Distribution across Pandit, Merchant, Mandali & Astrologer</div>
          <Donut data={d.roles && d.roles.length > 0 ? d.roles : [{ n: 'Pandits', v: 0, c: '#8B1A1A' }]} />
        </div>
      </div>

      <div className="grid2" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="panel">
          <h3>Needs Attention</h3>
          <div className="psub">Approvals & Verification Queue</div>
          <div className="activity">
            <Att ic="🪪" bg="var(--warn-soft)" fg="var(--warn)" tx={`${kyc} partner KYC awaiting review`} tag="Partner App" onClick={() => nav('/vendors')} />
            <Att ic="💸" bg="var(--good-soft)" fg="var(--good)" tx={`${pay} payout requests pending`} tag="Finance" onClick={() => nav('/payouts')} />
            <Att ic="🎉" bg="var(--info-soft)" fg="var(--info)" tx={`${ev} event inquiries near SLA`} tag="Mandali" onClick={() => nav('/events')} />
            <Att ic="⭐" bg="var(--crit-soft)" fg="var(--crit)" tx={`${fl} flagged reviews to moderate`} tag="Platform" onClick={() => nav('/reviews')} />
          </div>
        </div>
        <div className="panel">
          <h3>Recent Activity</h3>
          <div className="psub">Real-time submissions from Partner & User apps</div>
          <div className="activity">
            {recentActivities.length > 0 ? (
              recentActivities.map((act, i) => (
                <Row key={i} ic={act.ic} bg={act.bg} fg={act.fg} tx={act.tx} tm={act.tm} />
              ))
            ) : (
              <div style={{ color: 'var(--muted)', fontSize: 13, padding: '16px 0', textAlign: 'center' }}>
                No recent activity. New partner registrations and bookings will show here in real time.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
