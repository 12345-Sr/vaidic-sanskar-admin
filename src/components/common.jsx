import React from 'react';

export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const initials = (s = '') => s.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const PILL = {
  Active: 'good', Verified: 'good', Completed: 'good', COMPLETED: 'good', Confirmed: 'good', Delivered: 'good', Paid: 'good', Received: 'good', Published: 'good', Visible: 'good', Live: 'good',
  Pending: 'warn', Review: 'warn', Assigning: 'warn', PENDING_ACCEPTANCE: 'warn', Packed: 'warn', Low: 'warn', Expiring: 'warn', Requested: 'warn', Broadcasting: 'warn', POOJA_STARTED: 'warn',
  Draft: 'mut', Ended: 'mut', Paused: 'mut', Hidden: 'mut',
  Scheduled: 'info', 'Ready for Courier': 'info', New: 'info', Accepted: 'info', ACCEPTED: 'info', EN_ROUTE: 'info', ARRIVED: 'info',
  Blocked: 'crit', Rejected: 'crit', Suspended: 'crit', Out: 'crit', Flagged: 'crit', CANCELLED: 'crit', Cancelled: 'crit',
};
export const Pill = ({ s }) => <span className={`pill p-${PILL[s] || 'mut'}`}>{s}</span>;

export const roleColor = { pandit: '#8B1A1A', merchant: '#AD1457', mandali: '#0277BD', astro: '#6A1B9A' };
export const roleLabel = { pandit: 'Pandit', merchant: 'Merchant', mandali: 'Mandali', astro: 'Astrologer' };
export const RoleChip = ({ r }) => (
  <span className="rolechip" style={{ background: (roleColor[r] || '#888') + '1a', color: roleColor[r] || '#888' }}>{roleLabel[r] || r}</span>
);

export const Stars = ({ n }) => (
  <span className="num">{'★'.repeat(n)}<span style={{ color: 'var(--border)' }}>{'★'.repeat(5 - n)}</span></span>
);
