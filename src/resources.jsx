import React from 'react';
import { api } from './api/services';
import { mock } from './data/mock';
import { Pill, RoleChip, Stars, inr, initials, roleColor } from './components/common';
import { toast } from './components/toast';

/**
 * Central registry. Each entry fully describes a resource screen:
 *   path, title, crumb, nav group/icon, service, mock data,
 *   searchKeys, statusKey + statuses (segmented filter),
 *   columns [{key,label,render,className}], and actions(row, patch).
 *
 * To add a field or column, edit here — no new page file needed.
 */
const ORDER_FLOW = ['New', 'Packed', 'Ready for Courier', 'Delivered'];

export const resources = {
  users: {
    title: 'Users', crumb: 'App customers', icon: '👥', group: 'User App',
    service: api.users, mock: mock.users, searchKeys: ['name', 'id', 'city'],
    statusKey: 'status', statuses: ['Active', 'Blocked'],
    columns: [
      { key: 'name', label: 'User', render: (u) => (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="av" style={{ background: '#6A1B9A' }}>{initials(u.name)}</span>
          <div><div className="cellmain">{u.name}</div><div className="cellsub">{u.id} · joined {u.joined}</div></div>
        </div>) },
      { key: 'phone', label: 'Contact' },
      { key: 'city', label: 'City' },
      { key: 'orders', label: 'Orders', className: 'num' },
      { key: 'wallet', label: 'Wallet', className: 'num', render: (u) => inr(u.wallet) },
      { key: 'status', label: 'Status', render: (u) => <Pill s={u.status} /> },
    ],
    actions: (u, patch, onView, onEdit, onDelete, onDetails) => (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          className="act pri"
          onClick={() => (onDetails || onView)?.(u)}
          title="Inspect Full Devotee Profile & Address"
        >
          👁 Details
        </button>
        <button
          className={`act ${u.status === 'Blocked' ? 'ok' : 'no'}`}
          onClick={() => {
            patch(u.id, { status: u.status === 'Blocked' ? 'Active' : 'Blocked' });
            toast(`${u.name} ${u.status === 'Blocked' ? 'unblocked' : 'blocked'}`);
          }}
        >
          {u.status === 'Blocked' ? 'Unblock' : 'Block'}
        </button>
      </div>
    ),
  },

  vendors: {
    title: 'Vendors / KYC', crumb: 'Approve & manage partners', icon: '🤝', group: 'Partner App',
    service: api.vendors, mock: mock.vendors, searchKeys: ['name', 'id', 'city'],
    statusKey: 'kyc', statuses: ['Pending', 'Verified', 'Rejected'],
    badge: (rows) => rows.filter((v) => v.kyc === 'Pending').length,
    columns: [
      { key: 'name', label: 'Vendor', render: (v) => (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {v.photo ? (
            <img
              src={v.photo}
              alt={v.name}
              style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', border: '1.5px solid var(--accent)' }}
            />
          ) : (
            <span className="av" style={{ background: roleColor[v.role] }}>{initials(v.name)}</span>
          )}
          <div><div className="cellmain">{v.name}</div><div className="cellsub">{v.id}</div></div>
        </div>) },
      { key: 'role', label: 'Role', render: (v) => <RoleChip r={v.role} /> },
      { key: 'city', label: 'City', render: (v) => v.city || '—' },
      { key: 'rating', label: 'Rating', className: 'num', render: (v) => v.rating != null ? `⭐ ${v.rating}` : '⭐ 5.0' },
      { key: 'jobs', label: 'Jobs', className: 'num' },
      { key: 'kyc', label: 'KYC', render: (v) => <Pill s={v.kyc} /> },
    ],
    actions: (v, patch, onView) => (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          className="act pri"
          onClick={() => onView && onView(v)}
          title="Review Full Profile, Qualifications & KYC"
        >
          👁 Review Profile
        </button>
        {v.kyc === 'Pending' ? (
          <>
            <button className="act ok" onClick={() => { patch(v.id, { kyc: 'Verified', status: 'Active' }); toast(`${v.name} approved & verified!`); }}>
              Approve
            </button>
            <button className="act no" onClick={() => { patch(v.id, { kyc: 'Rejected', status: 'Suspended' }); toast(`${v.name} rejected`); }}>
              Reject
            </button>
          </>
        ) : (
          <span className="cellsub" style={{ fontSize: 11, fontWeight: 600 }}>
            {v.kyc === 'Verified' ? '✓ Approved' : '✗ Rejected'}
          </span>
        )}
      </div>
    ),
  },

  bookings: {
    title: 'Puja Bookings', crumb: 'Pandit & pooja bookings', icon: '🔥', group: 'User App',
    service: api.bookings, mock: mock.bookings, searchKeys: ['id', 'user', 'puja', 'ritualName', 'yajmanName', 'bookingId'],
    statusKey: 'status', statuses: ['PENDING_ACCEPTANCE', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'POOJA_STARTED', 'COMPLETED', 'CANCELLED'],
    columns: [
      { key: 'id', label: 'Booking ID', className: 'cellmain', render: (b) => (
        <div>
          <div style={{ fontWeight: 800 }}>{b.bookingId || b.id}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{b.createdAt ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
        </div>
      ) },
      { key: 'user', label: 'Devotee / Yajman', render: (b) => (
        <div>
          <div style={{ fontWeight: 700 }}>{b.yajmanName || b.user || b.userId || 'Devotee'}</div>
          {(b.phone || b.userPhone) && <div style={{ fontSize: 11, color: 'var(--muted)' }}>📞 {b.phone || b.userPhone}</div>}
        </div>
      ) },
      { key: 'puja', label: 'Sacred Ritual', render: (b) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--fg)' }}>{b.ritualName || b.puja || 'Vedic Pooja'}</div>
          {b.samagriPreference && (
            <div style={{ fontSize: 10.5, color: '#D48817', fontWeight: 600 }}>
              {b.samagriPreference === 'USER_ARRANGES' ? '🌾 Devotee Arranged' : '📦 Pandit Samagri Kit'}
            </div>
          )}
        </div>
      ) },
      { key: 'pandit', label: 'Assigned Pandit', render: (b) => {
        const name = b.assignedVendor?.name || b.pandit?.name || (typeof b.pandit === 'string' ? b.pandit : null);
        if (!name || name === 'Unassigned') {
          return b.status === 'PENDING_ACCEPTANCE' ? (
            <span style={{ color: '#D48817', fontWeight: 700, fontSize: 12 }}>🔍 Searching Pandit...</span>
          ) : (
            <span className="cellsub">Unassigned</span>
          );
        }
        return (
          <div>
            <div style={{ fontWeight: 700, color: '#8B1A1A' }}>🪔 {name}</div>
            {b.assignedVendor?.rating && <div style={{ fontSize: 11, color: 'var(--muted)' }}>⭐ {b.assignedVendor.rating} (Verified)</div>}
          </div>
        );
      } },
      { key: 'amt', label: 'Total Amount', className: 'num', render: (b) => (
        <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{inr(b.totalAmount || b.amt || b.serviceCharge || 2500)}</span>
      ) },
      { key: 'date', label: 'Scheduled Date & Time', render: (b) => (
        <div>
          <div style={{ fontWeight: 600 }}>{b.scheduledDate || b.date || 'Today'}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{b.scheduledTime || 'Morning Muhurat'}</div>
        </div>
      ) },
      { key: 'status', label: 'Pooja Status', render: (b) => <Pill s={b.status} /> },
    ],
    actions: (b, patch, onView, onEdit, onDelete, onDetails) => (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          className="act pri"
          onClick={() => (onDetails || onView)?.(b)}
          title="View Puja Booking, Devotee, Pandit & OTPs"
        >
          👁 Details
        </button>
        {b.status === 'PENDING_ACCEPTANCE' && (
          <button
            className="act ok"
            onClick={() => {
              patch(b.id, { status: 'ACCEPTED' });
              toast(`Booking #${b.id} accepted!`);
            }}
          >
            Accept
          </button>
        )}
        {b.status === 'ACCEPTED' && (
          <button
            className="act ok"
            onClick={() => {
              patch(b.id, { status: 'COMPLETED' });
              toast(`Pooja #${b.id} marked Completed!`);
            }}
          >
            Complete
          </button>
        )}
      </div>
    ),
  },

  orders: {
    title: 'E-Store Orders', crumb: 'Order lifecycle', icon: '📦', group: 'User App',
    service: api.orders, mock: mock.orders, searchKeys: ['id', 'buyer', 'item', 'city'],
    statusKey: 'status', statuses: ORDER_FLOW,
    columns: [
      { key: 'id', label: 'Order', className: 'cellmain' },
      { key: 'buyer', label: 'Buyer', render: (o) => (
        <div>
          <div style={{ fontWeight: 700 }}>{o.buyer || 'Customer'}</div>
          {(o.shippingAddress?.phone || o.phone) && (
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>📞 {o.shippingAddress?.phone || o.phone}</div>
          )}
        </div>
      ) },
      { key: 'item', label: 'Item', render: (o) => (
        <div>
          <div style={{ fontWeight: 600 }}>{o.item || (o.items && o.items[0]?.name) || 'Pooja Samagri'}</div>
          {o.items && o.items.length > 1 && (
            <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>+{o.items.length - 1} extra items</div>
          )}
        </div>
      ) },
      { key: 'city', label: 'Delivery City', render: (o) => o.city || o.shippingAddress?.city || '—' },
      { key: 'amt', label: 'Amount', className: 'num', render: (o) => inr(o.amt || o.amount || o.total) },
      { key: 'status', label: 'Status', render: (o) => <Pill s={o.status} /> },
    ],
    actions: (o, patch, onView, onEdit, onDelete, onDetails) => {
      const next = ORDER_FLOW[ORDER_FLOW.indexOf(o.status) + 1];
      return (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            className="act pri"
            onClick={() => (onDetails || onView)?.(o)}
            title="View Full Order Details, Items & Address"
          >
            👁 Details
          </button>
          {next ? (
            <button
              className="act"
              onClick={() => {
                patch(o.id, { status: next });
                toast(`${o.id} → ${next}`);
              }}
            >
              → {next}
            </button>
          ) : (
            <span className="cellsub" style={{ fontSize: 11, fontWeight: 700, color: '#1C9A5E' }}>✓ Done</span>
          )}
        </div>
      );
    },
  },

  sessions: {
    title: 'Astrologer Sessions', crumb: 'Vartalap chat/call logs', icon: '🔮', group: 'User App',
    service: api.sessions, mock: mock.sessions, searchKeys: ['id', 'astro', 'user'],
    statusKey: 'status', statuses: ['Live', 'Ended'],
    columns: [
      { key: 'id', label: 'Session', className: 'cellmain' },
      { key: 'astro', label: 'Astrologer' },
      { key: 'user', label: 'User' },
      { key: 'mode', label: 'Mode' },
      { key: 'mins', label: 'Mins', className: 'num' },
      { key: 'amt', label: 'Billed', className: 'num', render: (s) => inr(s.amt) },
      { key: 'status', label: 'Status', render: (s) => <Pill s={s.status} /> },
    ],
    actions: (s, patch, onView, onEdit, onDelete, onDetails) => (
      <button
        className="act pri"
        onClick={() => (onDetails || onView)?.(s)}
        title="View Astrologer & Devotee Session Details"
      >
        👁 Details
      </button>
    ),
  },

  subs: {
    title: 'Subscriptions', crumb: 'Daily Pandit plans', icon: '📅', group: 'User App',
    service: api.subs, mock: mock.subs, searchKeys: ['id', 'user', 'plan'],
    statusKey: 'status', statuses: ['Active', 'Expiring'],
    columns: [
      { key: 'id', label: 'ID', className: 'cellmain' },
      { key: 'user', label: 'User' }, { key: 'plan', label: 'Plan' },
      { key: 'venue', label: 'Venue' }, { key: 'slot', label: 'Slot' },
      { key: 'amt', label: 'Amount', className: 'num', render: (s) => inr(s.amt) },
      { key: 'status', label: 'Status', render: (s) => <Pill s={s.status} /> },
    ],
    actions: (s, patch, onView, onEdit, onDelete, onDetails) => (
      <button
        className="act pri"
        onClick={() => (onDetails || onView)?.(s)}
        title="View Daily Pandit Subscription Details"
      >
        👁 Details
      </button>
    ),
  },

  temples: {
    title: 'Temples & Darshan', crumb: 'VIP pass & darshan', icon: '🛕', group: 'User App',
    service: api.temples, mock: mock.temples, searchKeys: ['name', 'city'],
    columns: [
      { key: 'name', label: 'Temple', className: 'cellmain' },
      { key: 'city', label: 'City' },
      { key: 'vip', label: 'VIP Pass', render: (t) => <Pill s={t.vip === 'Yes' ? 'Active' : 'Paused'} /> },
      { key: 'darshan', label: 'Darshan/mo', className: 'num' },
      { key: 'status', label: 'Status', render: (t) => <Pill s={t.status} /> },
    ],
    actions: (t, patch, onView, onEdit, onDelete, onDetails) => (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button className="act pri" onClick={() => (onDetails || onView)?.(t)} title="View Temple Details">
          👁 Details
        </button>
        <button
          className="act"
          onClick={() => {
            patch(t.id, { vip: t.vip === 'Yes' ? 'No' : 'Yes' });
            toast(`VIP ${t.vip === 'Yes' ? 'off' : 'on'} · ${t.name}`);
          }}
        >
          Toggle VIP
        </button>
      </div>
    ),
  },

  donations: {
    title: 'Donations', crumb: 'Daan collections', icon: '🎁', group: 'User App',
    service: api.donations, mock: mock.donations, searchKeys: ['id', 'user', 'cause'],
    columns: [
      { key: 'id', label: 'ID', className: 'cellmain' },
      { key: 'user', label: 'Donor' }, { key: 'cause', label: 'Cause' },
      { key: 'amt', label: 'Amount', className: 'num', render: (d) => inr(d.amt) },
      { key: 'date', label: 'Date' },
      { key: 'status', label: 'Status', render: (d) => <Pill s={d.status} /> },
    ],
    actions: (d, patch, onView, onEdit, onDelete, onDetails) => (
      <button className="act pri" onClick={() => (onDetails || onView)?.(d)} title="View Donation Details">
        👁 Details
      </button>
    ),
  },

  jobs: {
    title: 'Live Job Dispatch', crumb: 'Geofenced puja broadcasts', icon: '📡', group: 'Partner App',
    service: api.jobs, mock: mock.jobs, searchKeys: ['id', 'puja', 'area'],
    statusKey: 'status', statuses: ['Broadcasting', 'Accepted', 'Completed'],
    columns: [
      { key: 'id', label: 'Job', className: 'cellmain' },
      { key: 'puja', label: 'Puja' }, { key: 'area', label: 'Area' },
      { key: 'earn', label: 'Vendor earns', className: 'num', render: (j) => inr(j.earn) },
      { key: 'timer', label: 'Timer', className: 'num' },
      { key: 'status', label: 'Status', render: (j) => <Pill s={j.status} /> },
    ],
    actions: (j, patch, onView, onEdit, onDelete, onDetails) => (
      <button className="act pri" onClick={() => (onDetails || onView)?.(j)} title="View Live Job Dispatch Details">
        👁 Details
      </button>
    ),
  },

  products: {
    title: 'E-Store Products',
    crumb: 'Manage catalog, prices, images & stock',
    icon: '🛍️',
    group: 'User App',
    service: api.products,
    mock: mock.products,
    searchKeys: ['name', 'title', 'category', 'categoryName', 'id'],
    statusKey: 'status',
    statuses: ['Live', 'Low', 'Out'],
    columns: [
      {
        key: 'name',
        label: 'Product',
        render: (p) => {
          const img = p.image || p.imageUrl || (Array.isArray(p.images) ? p.images[0] : null);
          return (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {img ? (
                <img
                  src={img}
                  alt={p.name || p.title}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    objectFit: 'cover',
                    border: '1px solid var(--border)',
                  }}
                />
              ) : (
                <span
                  className="av"
                  style={{
                    background: 'var(--accent)',
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    fontSize: 20,
                  }}
                >
                  🛍️
                </span>
              )}
              <div>
                <div className="cellmain">{p.name || p.title || 'Product'}</div>
                <div className="cellsub">{p.id} · {p.merchant || 'Vaidic Sanskar'}</div>
              </div>
            </div>
          );
        },
      },
      {
        key: 'category',
        label: 'Category',
        render: (p) => (
          <span className="rolechip" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', textTransform: 'capitalize' }}>
            {p.categoryName || p.category || p.cat || 'Samagri'}
          </span>
        ),
      },
      {
        key: 'price',
        label: 'Price & MRP',
        className: 'num',
        render: (p) => (
          <div>
            <span style={{ fontWeight: 800 }}>{inr(p.price)}</span>
            {p.mrp && Number(p.mrp) > Number(p.price) && (
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--muted)',
                  textDecoration: 'line-through',
                  marginLeft: 6,
                }}
              >
                {inr(p.mrp)}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'stock',
        label: 'Stock',
        className: 'num',
        render: (p) => (p.stock != null ? `${p.stock} units` : 'In Stock'),
      },
      {
        key: 'status',
        label: 'Status',
        render: (p) => <Pill s={p.status || 'Live'} />,
      },
    ],
    actions: (p, patch, setSelectedVendor, onEdit, onDelete) => (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          className="act pri"
          onClick={() => onEdit && onEdit(p)}
          title="Edit Product Details, Price & Image"
        >
          ✏️ Edit
        </button>
        <button
          className="act no"
          onClick={() => onDelete && onDelete(p)}
          title="Delete from E-Store"
        >
          🗑️
        </button>
      </div>
    ),
  },

  events: {
    title: 'Event Inquiries', crumb: 'Mandali & Bhavya Aayojan', icon: '🎉', group: 'Partner App',
    service: api.events, mock: mock.events, searchKeys: ['id', 'type', 'org'],
    statusKey: 'status', statuses: ['Pending', 'Confirmed'],
    badge: (rows) => rows.filter((e) => e.status === 'Pending').length,
    columns: [
      { key: 'id', label: 'ID', className: 'cellmain' },
      { key: 'type', label: 'Type' }, { key: 'org', label: 'Organiser' },
      { key: 'date', label: 'Date' }, { key: 'venue', label: 'Venue' },
      { key: 'sla', label: 'SLA left', className: 'num' },
      { key: 'status', label: 'Status', render: (e) => <Pill s={e.status} /> },
    ],
    actions: (e, patch, onView, onEdit, onDelete, onDetails) => (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button className="act pri" onClick={() => (onDetails || onView)?.(e)} title="View Event Inquiry Details">
          👁 Details
        </button>
        {e.status === 'Pending' && (
          <button className="act ok" onClick={() => { patch(e.id, { status: 'Confirmed' }); toast(`${e.id} confirmed`); }}>
            Confirm
          </button>
        )}
      </div>
    ),
  },

  payouts: {
    title: 'Payouts', crumb: 'Vendor settlement requests', icon: '💸', group: 'Partner App',
    service: api.payouts, mock: mock.payouts, searchKeys: ['id', 'vendor'],
    statusKey: 'status', statuses: ['Requested', 'Paid'],
    badge: (rows) => rows.filter((p) => p.status === 'Requested').length,
    columns: [
      { key: 'id', label: 'ID', className: 'cellmain' },
      { key: 'vendor', label: 'Vendor' },
      { key: 'role', label: 'Role', render: (p) => <RoleChip r={p.role} /> },
      { key: 'amt', label: 'Amount', className: 'num', render: (p) => inr(p.amt) },
      { key: 'method', label: 'Method' },
      { key: 'status', label: 'Status', render: (p) => <Pill s={p.status} /> },
    ],
    actions: (p, patch, onView, onEdit, onDelete, onDetails) => (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button className="act pri" onClick={() => (onDetails || onView)?.(p)} title="View Settlement & Bank Details">
          👁 Details
        </button>
        {p.status === 'Requested' && (
          <button className="act ok" onClick={() => { patch(p.id, { status: 'Paid' }); toast(`Paid ${inr(p.amt)} to ${p.vendor}`); }}>
            Approve & Pay
          </button>
        )}
      </div>
    ),
  },

  reviews: {
    title: 'Reviews', crumb: 'Ratings & moderation', icon: '⭐', group: 'Platform',
    service: api.reviews, mock: mock.reviews, searchKeys: ['user', 'target', 'text'],
    statusKey: 'status', statuses: ['Visible', 'Flagged', 'Hidden'],
    columns: [
      { key: 'user', label: 'User', className: 'cellmain' },
      { key: 'target', label: 'For' },
      { key: 'stars', label: 'Rating', render: (r) => <Stars n={r.stars} /> },
      { key: 'text', label: 'Review' },
      { key: 'status', label: 'Status', render: (r) => <Pill s={r.status} /> },
    ],
    actions: (r, patch, onView, onEdit, onDelete, onDetails) => (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button className="act pri" onClick={() => (onDetails || onView)?.(r)} title="View Full Review">
          👁 Details
        </button>
        {r.status === 'Flagged' ? (
          <>
            <button className="act no" onClick={() => { patch(r.id, { status: 'Hidden' }); toast('Hidden'); }}>Hide</button>
            <button className="act" onClick={() => { patch(r.id, { status: 'Visible' }); toast('Kept'); }}>Keep</button>
          </>
        ) : null}
      </div>
    ),
  },

  library: {
    title: 'Content / Library', crumb: 'Sahitya Sangrah', icon: '📖', group: 'Platform',
    service: api.library, mock: mock.library, searchKeys: ['title', 'type'],
    statusKey: 'status', statuses: ['Published', 'Draft'],
    columns: [
      { key: 'title', label: 'Title', className: 'cellmain' },
      { key: 'type', label: 'Type' }, { key: 'lang', label: 'Language' },
      { key: 'audio', label: 'Audio' }, { key: 'plays', label: 'Plays', className: 'num' },
      { key: 'status', label: 'Status', render: (l) => <Pill s={l.status} /> },
    ],
    actions: (l, patch, onView, onEdit, onDelete, onDetails) => (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button className="act pri" onClick={() => (onDetails || onView)?.(l)} title="View Content Details">
          👁 Details
        </button>
        <button
          className={`act ${l.status === 'Draft' ? 'ok' : ''}`}
          onClick={() => {
            patch(l.id, { status: l.status === 'Draft' ? 'Published' : 'Draft' });
            toast(l.status === 'Draft' ? 'Published' : 'Unpublished');
          }}
        >
          {l.status === 'Draft' ? 'Publish' : 'Unpublish'}
        </button>
      </div>
    ),
  },

  banners: {
    title: 'Banners & Ads', crumb: 'Promotions', icon: '📢', group: 'Platform',
    service: api.banners, mock: mock.banners, searchKeys: ['title', 'slot'],
    statusKey: 'status', statuses: ['Active', 'Scheduled', 'Paused'],
    columns: [
      { key: 'title', label: 'Title', className: 'cellmain' },
      { key: 'slot', label: 'Slot' },
      { key: 'type', label: 'Type', render: (b) => <span className="rolechip" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>{b.type}</span> },
      { key: 'clicks', label: 'Clicks', className: 'num' },
      { key: 'status', label: 'Status', render: (b) => <Pill s={b.status} /> },
    ],
    actions: (b, patch, onView, onEdit, onDelete, onDetails) => (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button className="act pri" onClick={() => (onDetails || onView)?.(b)} title="View Banner Details">
          👁 Details
        </button>
        <button
          className="act"
          onClick={() => {
            patch(b.id, { status: b.status === 'Active' ? 'Paused' : 'Active' });
            toast('Toggled banner status');
          }}
        >
          {b.status === 'Active' ? 'Pause' : 'Activate'}
        </button>
      </div>
    ),
  },
};

// Sidebar structure (order + grouping)
export const NAV = [
  { group: 'Overview', items: [{ key: 'dash', title: 'Dashboard', icon: '📊' }] },
  { group: 'E-Store & Products', items: ['products', 'orders'].map((k) => ({ key: k, ...resources[k] })) },
  { group: 'User App', items: ['bookings', 'sessions', 'subs', 'temples', 'donations', 'users'].map((k) => ({ key: k, ...resources[k] })) },
  { group: 'Partner App', items: ['vendors', 'jobs', 'events', 'payouts'].map((k) => ({ key: k, ...resources[k] })) },
  { group: 'Platform', items: ['reviews', 'library', 'banners'].map((k) => ({ key: k, ...resources[k] })).concat([{ key: 'settings', title: 'Settings', icon: '⚙️' }]) },
];
