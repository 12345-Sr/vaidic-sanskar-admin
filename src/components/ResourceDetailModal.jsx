import React, { useState } from 'react';
import { Pill, RoleChip, Stars, inr, initials, roleColor } from './common';
import { toast } from './toast';

export default function ResourceDetailModal({ resource, item, onClose, onPatch }) {
  const [showRaw, setShowRaw] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (!item) return null;

  const copyToClipboard = (text, label) => {
    if (!text || text === '—') return;
    try {
      navigator.clipboard.writeText(String(text));
      toast(`Copied ${label} to clipboard!`);
    } catch {
      toast(`Copied: ${text}`);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      if (onPatch) {
        await onPatch(item.id, { status: newStatus });
        toast(`✅ Status updated to "${newStatus}"!`);
      }
    } catch (e) {
      toast(`Failed to update status`);
    } finally {
      setUpdating(false);
    }
  };

  const ORDER_FLOW = ['New', 'Packed', 'Ready for Courier', 'Delivered'];

  // Specific renderers for different sidebar entities
  const renderBookingDetails = () => {
    const isCompleted = item.status === 'Completed';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Verification OTP Alert */}
        {(item.startOtp || item.completeOtp || item.otps) && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(234, 168, 56, 0.15), rgba(212, 136, 23, 0.08))',
              border: '1.5px solid #EAA838',
              borderRadius: 12,
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#965C0A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                🔐 Sacred Ceremony Verification OTPs
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg)', marginTop: 4 }}>
                Shared between Devotee (User App) and Verified Pandit (Partner App)
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {(item.startOtp || item.otps?.startOtp) && (
                <div
                  onClick={() => copyToClipboard(item.startOtp || item.otps?.startOtp, 'Start OTP')}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid #EAA838',
                    borderRadius: 8,
                    padding: '6px 12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                  title="Click to copy Start OTP"
                >
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>START OTP</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#D48817', letterSpacing: 1.5 }}>
                    {item.startOtp || item.otps?.startOtp}
                  </div>
                </div>
              )}
              {(item.completeOtp || item.otps?.completeOtp) && (
                <div
                  onClick={() => copyToClipboard(item.completeOtp || item.otps?.completeOtp, 'Complete OTP')}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid #1C9A5E',
                    borderRadius: 8,
                    padding: '6px 12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                  title="Click to copy Complete OTP"
                >
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>COMPLETE OTP</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1C9A5E', letterSpacing: 1.5 }}>
                    {item.completeOtp || item.otps?.completeOtp}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Devotee Info */}
          <div style={{ background: 'var(--surface2)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>👤 DEVOTEE (USER APP)</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--fg)' }}>{item.yajmanName || item.user || 'Devotee'}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>
              📞 {item.phone || item.userPhone || '—'}
            </div>
            {item.gotra && <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginTop: 4 }}>Gotra: {item.gotra}</div>}
            <div style={{ fontSize: 12, color: 'var(--fg)', marginTop: 8, lineHeight: 1.4 }}>
              📍 {item.serviceAddress || item.address || 'Address provided during booking'}
            </div>
          </div>

          {/* Assigned Pandit / Vendor Info */}
          <div style={{ background: 'var(--surface2)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>🪔 ASSIGNED PANDIT (PARTNER APP)</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--fg)' }}>
              {item.assignedVendor?.name || item.pandit?.name || item.pandit || 'Unassigned'}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>
              ID: {item.assignedVendorId || item.assignedVendor?.id || '—'}
            </div>
            {(item.assignedVendor?.gurukul || item.pandit?.gurukul) && (
              <div style={{ fontSize: 11.5, color: '#8B1A1A', fontWeight: 600, marginTop: 4 }}>
                🏛️ {item.assignedVendor?.gurukul || item.pandit?.gurukul}
              </div>
            )}
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
              Samagri: <strong style={{ color: 'var(--fg)' }}>{item.samagriPreference || 'Arranged by Devotee'}</strong>
            </div>
          </div>
        </div>

        {/* Schedule & Timing */}
        <div style={{ background: 'var(--surface2)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>📅 RITUAL SCHEDULE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Puja</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{item.ritualName || item.puja}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Date</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{item.scheduledDate || item.date}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Time Slot</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{item.scheduledTime || 'Morning Muhurat'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Total Amount</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)' }}>{inr(item.totalAmount || item.amt)}</div>
            </div>
          </div>
        </div>

        {/* Quick Booking Actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>Change Status:</div>
          {['ACCEPTED', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              disabled={updating || item.status === st}
              onClick={() => handleStatusChange(st)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: item.status === st ? 'default' : 'pointer',
                background: item.status === st ? 'var(--accent)' : 'var(--surface2)',
                color: item.status === st ? '#fff' : 'var(--fg)',
                border: '1px solid var(--border)',
                opacity: item.status === st ? 1 : 0.85,
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderOrderDetails = () => {
    const items = item.items || (item.item ? [{ name: item.item, price: item.amt, quantity: 1 }] : []);
    const nextStatus = ORDER_FLOW[ORDER_FLOW.indexOf(item.status) + 1];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Status Lifecycle Progress */}
        <div style={{ background: 'var(--surface2)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
            Order Flow Progress
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {ORDER_FLOW.map((st, i) => {
              const currIdx = ORDER_FLOW.indexOf(item.status);
              const isPastOrCurr = currIdx >= i;
              const isCurrent = item.status === st;
              return (
                <React.Fragment key={st}>
                  <div
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: 8,
                      textAlign: 'center',
                      background: isCurrent ? 'var(--accent)' : isPastOrCurr ? 'rgba(28, 154, 94, 0.15)' : 'var(--surface)',
                      border: `1.5px solid ${isCurrent ? 'var(--accent)' : isPastOrCurr ? '#1C9A5E' : 'var(--border)'}`,
                      color: isCurrent ? '#fff' : isPastOrCurr ? '#1C9A5E' : 'var(--muted)',
                      fontWeight: 700,
                      fontSize: 11.5,
                    }}
                  >
                    {isPastOrCurr && !isCurrent ? '✓ ' : ''}{st}
                  </div>
                  {i < ORDER_FLOW.length - 1 && <span style={{ color: 'var(--muted)', fontSize: 12 }}>→</span>}
                </React.Fragment>
              );
            })}
          </div>

          {nextStatus && (
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                disabled={updating}
                onClick={() => handleStatusChange(nextStatus)}
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '7px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Advance to "{nextStatus}" →
              </button>
            </div>
          )}
        </div>

        {/* Buyer & Shipping Address */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ background: 'var(--surface2)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>👤 CUSTOMER</div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{item.buyer || item.shippingAddress?.name || 'Customer'}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>
              📞 {item.shippingAddress?.phone || item.phone || '—'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              Payment: <strong style={{ color: 'var(--fg)', textTransform: 'uppercase' }}>{item.paymentMethod || 'COD'}</strong>
            </div>
          </div>

          <div style={{ background: 'var(--surface2)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>📦 SHIPPING DESTINATION</div>
            <div style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.4 }}>
              {item.shippingAddress?.line1 || item.address || 'Standard Address'}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--fg)', marginTop: 4 }}>
              {item.shippingAddress?.city || item.city || ''} {item.shippingAddress?.pincode ? `• PIN: ${item.shippingAddress.pincode}` : ''}
            </div>
          </div>
        </div>

        {/* Ordered Samagri Items */}
        <div style={{ background: 'var(--surface2)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 10 }}>🛍️ ORDERED SAMAGRI ITEMS ({items.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((prod, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'var(--surface)',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📦</span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--fg)' }}>{prod.name || 'Sacred Item'}</div>
                    {prod.variant && <div style={{ fontSize: 11, color: 'var(--muted)' }}>Variant: {prod.variant}</div>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--accent)' }}>{inr(prod.price || item.amt)}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Qty: {prod.quantity || 1}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Total Order Value</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>{inr(item.amt || item.amount || item.total)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderUserDetails = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ background: 'var(--surface2)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>PROFILE INFORMATION</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg)' }}>{item.name}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>📞 {item.phone || '—'}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>✉️ {item.email || '—'}</div>
            {item.gotra && <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, marginTop: 4 }}>Gotra: {item.gotra}</div>}
          </div>

          <div style={{ background: 'var(--surface2)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>ACTIVITY & WALLET</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Wallet Balance:</span>
              <strong style={{ fontSize: 15, color: '#1C9A5E' }}>{inr(item.wallet || 0)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Total E-Store Orders:</span>
              <strong style={{ fontSize: 14 }}>{item.orders ?? '—'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>City:</span>
              <strong style={{ fontSize: 13 }}>{item.city || '—'}</strong>
            </div>
          </div>
        </div>

        {item.address && (
          <div style={{ background: 'var(--surface2)', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>SAVED ADDRESS</div>
            <div style={{ fontSize: 13, color: 'var(--fg)' }}>{item.address}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => handleStatusChange(item.status === 'Blocked' ? 'Active' : 'Blocked')}
            style={{
              background: item.status === 'Blocked' ? '#1C9A5E' : '#D14343',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {item.status === 'Blocked' ? '✓ Unblock User' : '🚫 Block User'}
          </button>
        </div>
      </div>
    );
  };

  const renderJobDetails = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: 'var(--surface2)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>📡 LIVE BROADCAST DETAILS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Ritual / Puja</div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{item.puja}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Area / Location</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{item.area}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Vendor Earning</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1C9A5E' }}>{inr(item.earn)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Broadcast Timer</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#D48817' }}>⏱️ {item.timer}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {['Broadcasting', 'Accepted', 'Completed'].map((st) => (
          <button
            key={st}
            onClick={() => handleStatusChange(st)}
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              background: item.status === st ? 'var(--accent)' : 'var(--surface2)',
              color: item.status === st ? '#fff' : 'var(--fg)',
              border: '1px solid var(--border)',
            }}
          >
            Set {st}
          </button>
        ))}
      </div>
    </div>
  );

  const renderGenericDetails = () => {
    const keys = Object.keys(item).filter((k) => typeof item[k] !== 'object' || item[k] === null);
    return (
      <div style={{ background: 'var(--surface2)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {keys.map((k) => (
            <div key={k} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'capitalize' }}>
                {k.replace(/([A-Z])/g, ' $1')}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginTop: 2 }}>
                {String(item[k] ?? '—')}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getTitle = () => {
    if (resource === 'bookings') return `🔥 Puja Booking Details`;
    if (resource === 'orders') return `📦 E-Store Order Details`;
    if (resource === 'users') return `👥 Devotee Profile`;
    if (resource === 'jobs') return `📡 Live Job Dispatch Details`;
    if (resource === 'sessions') return `🔮 Astrologer Consultation`;
    if (resource === 'subs') return `📅 Daily Pandit Subscription`;
    if (resource === 'temples') return `🛕 Temple & Darshan`;
    if (resource === 'donations') return `🎁 Daan & Donation Details`;
    if (resource === 'events') return `🎉 Bhajan Mandali Inquiry`;
    if (resource === 'payouts') return `💸 Partner Settlement Details`;
    if (resource === 'reviews') return `⭐ Devotee Rating & Review`;
    if (resource === 'library') return `📖 Content / Sahitya Sangrah`;
    if (resource === 'banners') return `📢 Promotion Banner Details`;
    return `Details for ${resource}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface2)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--fg)' }}>{getTitle()}</h2>
              {item.status && <Pill s={item.status} />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span
                onClick={() => copyToClipboard(item.id, 'Record ID')}
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  background: 'var(--accent-soft)',
                  padding: '2px 8px',
                  borderRadius: 6,
                }}
                title="Click to copy ID"
              >
                #{item.id} 📋
              </span>
              {item.createdAt && (
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  Created: {new Date(item.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              border: 'none',
              background: 'var(--surface)',
              color: 'var(--muted)',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {resource === 'bookings' && renderBookingDetails()}
          {resource === 'orders' && renderOrderDetails()}
          {resource === 'users' && renderUserDetails()}
          {resource === 'jobs' && renderJobDetails()}
          {resource !== 'bookings' && resource !== 'orders' && resource !== 'users' && resource !== 'jobs' && renderGenericDetails()}

          {/* Raw JSON Debug Toggle */}
          <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
            <button
              onClick={() => setShowRaw((s) => !s)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {showRaw ? '▲ Hide Full Connected Payload' : '▼ View Full Connected Payload (JSON)'}
            </button>
            {showRaw && (
              <pre
                style={{
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 8,
                  background: 'var(--surface2)',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  border: '1px solid var(--border)',
                  maxHeight: 200,
                }}
              >
                {JSON.stringify(item, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            background: 'var(--surface2)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--fg)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
