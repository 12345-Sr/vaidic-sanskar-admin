import React from 'react';
import DataTable from '../components/DataTable';

const SetRow = ({ l, v, good }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
    <span style={{ color: 'var(--muted)' }}>{l}</span>
    {good ? <span className="pill p-good">{v}</span> : <b style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</b>}
  </div>
);

const team = [
  { id: 'A1', n: 'Super Admin', e: 'admin@vaidicsanskar.com', r: 'Owner', a: 'Full' },
  { id: 'A2', n: 'Ops Manager', e: 'ops@vaidicsanskar.com', r: 'Manager', a: 'Bookings, Jobs, Payouts' },
  { id: 'A3', n: 'Content Editor', e: 'content@vaidicsanskar.com', r: 'Editor', a: 'Library, Banners' },
];

export default function Settings() {
  return (
    <div>
      <div className="grid2" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="panel">
          <h3>Commission & Fees</h3><div className="psub">Platform cut per role</div>
          <SetRow l="Pandit / Puja" v="15%" /><SetRow l="E-Store Merchant" v="12%" />
          <SetRow l="Astrologer / Vartalap" v="20%" /><SetRow l="Bhajan Mandali" v="10%" />
          <div className="psub" style={{ marginTop: 12 }}>Payment gateway</div>
          <SetRow l="Razorpay" v="Connected" good /><SetRow l="Instant Payout (RazorpayX)" v="Connected" good />
        </div>
        <div className="panel">
          <h3>Platform config</h3><div className="psub">Operational defaults</div>
          <SetRow l="Job broadcast radius" v="3 km" /><SetRow l="Acceptance timer" v="180 sec" />
          <SetRow l="Event SLA" v="2 hours" /><SetRow l="Freemium audio/day" v="2 min" />
          <div className="psub" style={{ marginTop: 12 }}>Integrations</div>
          <SetRow l="Firebase FCM (push)" v="Connected" good /><SetRow l="Google Maps" v="Connected" good />
          <SetRow l="WebSocket gateway" v="Live" good />
        </div>
      </div>
      <div className="panel">
        <h3>Admin team & roles</h3><div className="psub">Who can access what</div>
        <DataTable
          columns={[
            { key: 'n', label: 'Member', className: 'cellmain' },
            { key: 'e', label: 'Email' },
            { key: 'r', label: 'Role', render: (m) => <span className="rolechip" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>{m.r}</span> },
            { key: 'a', label: 'Access' },
          ]}
          rows={team}
        />
      </div>
    </div>
  );
}
