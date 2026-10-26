import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import adminSocket from '../api/socket';
import { toast } from './toast';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vs_admin_notifs') || '[]');
    } catch {
      return [];
    }
  });
  const [unreadCount, setUnreadCount] = useState(() => {
    try {
      const items = JSON.parse(localStorage.getItem('vs_admin_notifs') || '[]');
      return items.filter((n) => !n.read).length;
    } catch {
      return 0;
    }
  });

  const [filter, setFilter] = useState('All');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vs_admin_notifs', JSON.stringify(notifications.slice(0, 50)));
    } catch {}
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Socket event listener for all platform events
  useEffect(() => {
    const addNotif = (notif) => {
      const item = {
        id: notif.id || 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        title: notif.title,
        message: notif.message,
        type: notif.type || 'info',
        targetUrl: notif.targetUrl || '/',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      };

      setNotifications((prev) => [item, ...prev.slice(0, 49)]);
    };

    // 1. Toast events
    const toastHandler = (e) => {
      if (e.detail) {
        addNotif(e.detail);
      }
    };
    window.addEventListener('vs-notification', toastHandler);

    // 2. Real-time socket events from backend suite
    const unsubOrder = adminSocket.on('order:new', (o) => {
      const title = `📦 Naya Order: #${o?.id || ''}`;
      const message = `${o?.buyer || 'यजमान'} • ${o?.item || 'सामग्री'} • ₹${o?.amt || o?.total || ''}`;
      toast({ title, message, type: 'order' });
      addNotif({ title, message, type: 'order', targetUrl: '/orders' });
    });

    const unsubBooking = adminSocket.on('booking:new', (b) => {
      const title = `🔥 Nayi Pooja Booking: #${b?.id || ''}`;
      const message = `${b?.puja || b?.name || 'पूजा'} • यजमान: ${b?.user || b?.yajmanName || 'यजमान'} • ₹${b?.amt || b?.dakshina || ''}`;
      toast({ title, message, type: 'booking' });
      addNotif({ title, message, type: 'booking', targetUrl: '/bookings' });
    });

    const unsubVendor = adminSocket.on('vendor:update', (v) => {
      if (v?.kyc === 'Pending' || v?.status === 'Review') {
        const title = `🤝 Naya Vendor Registration`;
        const message = `${v?.name || 'पंडित जी'} (${v?.role || 'pandit'}) — KYC सत्यापन प्रतीक्षारत`;
        toast({ title, message, type: 'vendor' });
        addNotif({ title, message, type: 'vendor', targetUrl: '/vendors' });
      }
    });

    return () => {
      window.removeEventListener('vs-notification', toastHandler);
      unsubOrder();
      unsubBooking();
      unsubVendor();
    };
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleItemClick = (n) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
    );
    setIsOpen(false);
    if (n.targetUrl) {
      navigate(n.targetUrl);
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'Orders') return n.type === 'order';
    if (filter === 'Bookings') return n.type === 'booking';
    if (filter === 'Vendors') return n.type === 'vendor' || n.type === 'kyc';
    return true;
  });

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        className="iconbtn"
        onClick={() => setIsOpen(!isOpen)}
        title="Live Notifications"
        style={{ position: 'relative' }}
      >
        <span style={{ fontSize: 17 }}>🔔</span>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              background: '#DC2626',
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: 800,
              height: 16,
              minWidth: 16,
              borderRadius: 8,
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 46,
            right: 0,
            width: 360,
            maxWidth: 'calc(100vw - 32px)',
            background: 'var(--surface, #FFFFFF)',
            border: '1px solid var(--border, #ECE1D0)',
            borderRadius: 16,
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.18)',
            zIndex: 9999,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--border, #ECE1D0)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 800, fontSize: 15 }}>Notifications</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: 'rgba(230, 126, 0, 0.12)',
                    color: 'var(--accent, #E67E00)',
                    padding: '2px 8px',
                    borderRadius: 100,
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 11.5,
                    color: 'var(--accent, #E67E00)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Mark read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 11.5,
                    color: 'var(--muted, #8C7B68)',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              padding: '8px 12px',
              background: 'var(--surface2, #F5EFE4)',
              borderBottom: '1px solid var(--border, #ECE1D0)',
            }}
          >
            {['All', 'Orders', 'Bookings', 'Vendors'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  border: 'none',
                  background: filter === f ? 'var(--surface, #FFFFFF)' : 'none',
                  color: filter === f ? 'var(--fg, #2B1E12)' : 'var(--muted, #8C7B68)',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: filter === f ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {filteredNotifs.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted, #8C7B68)', fontSize: 13 }}>
                Koi naya notification nahi hai 🕉️
              </div>
            ) : (
              filteredNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border, #ECE1D0)',
                    cursor: 'pointer',
                    background: n.read ? 'transparent' : 'rgba(230, 126, 0, 0.04)',
                    transition: 'background 0.15s ease',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface2, #F5EFE4)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(230, 126, 0, 0.04)')
                  }
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      background: n.read ? 'transparent' : '#E67E00',
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: n.read ? 600 : 800, fontSize: 13, color: 'var(--fg, #2B1E12)' }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--muted, #8C7B68)' }}>{n.timestamp}</span>
                    </div>
                    {n.message ? (
                      <div style={{ fontSize: 12, color: 'var(--muted, #8C7B68)', marginTop: 2, lineHeight: 1.35 }}>
                        {n.message}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
