import React, { useEffect, useState } from 'react';

/**
 * Global toast & on-screen notification trigger for Vaidic Sanskar Admin
 * Usage:
 *   toast('Product updated')
 *   toast({ title: 'New Order', message: '#ORD-8518 received', type: 'order' })
 */
export function toast(input, type = 'info') {
  let detail = {};
  if (typeof input === 'string') {
    detail = { title: input, message: '', type };
  } else if (input && typeof input === 'object') {
    detail = { ...input, type: input.type || type };
  }
  detail.id = 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
  detail.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  window.dispatchEvent(new CustomEvent('vs-toast', { detail }));
  window.dispatchEvent(new CustomEvent('vs-notification', { detail }));
}

export function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const newToast = e.detail;
      setToasts((prev) => [newToast, ...prev.slice(0, 3)]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 5000);
    };

    window.addEventListener('vs-toast', handler);
    return () => window.removeEventListener('vs-toast', handler);
  }, []);

  const getVisual = (type) => {
    switch (type) {
      case 'order':
        return { icon: '📦', color: '#E67E00', bg: '#FFF7ED', border: '#F97316' };
      case 'booking':
        return { icon: '🔥', color: '#8B1A1A', bg: '#FDF2F2', border: '#DC2626' };
      case 'vendor':
      case 'kyc':
        return { icon: '🤝', color: '#2563EB', bg: '#EFF6FF', border: '#3B82F6' };
      case 'success':
        return { icon: '✅', color: '#16A34A', bg: '#F0FDF4', border: '#22C55E' };
      case 'error':
      case 'alert':
        return { icon: '⚠️', color: '#DC2626', bg: '#FEF2F2', border: '#EF4444' };
      default:
        return { icon: '🔔', color: '#E67E00', bg: '#FFF7ED', border: '#F59E0B' };
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 380,
        width: 'calc(100vw - 48px)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => {
        const visual = getVisual(t.type);
        return (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              background: 'var(--surface, #FFFFFF)',
              color: 'var(--fg, #2B1E12)',
              borderRadius: 14,
              padding: '12px 14px',
              border: `1.5px solid ${visual.border}`,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.16)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: visual.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {visual.icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--fg, #2B1E12)' }}>
                  {t.title}
                </div>
                <span style={{ fontSize: 10.5, color: 'var(--muted, #8C7B68)', fontWeight: 600 }}>
                  {t.timestamp}
                </span>
              </div>
              {t.message ? (
                <div style={{ fontSize: 12, color: 'var(--muted, #8C7B68)', marginTop: 2, lineHeight: 1.4 }}>
                  {t.message}
                </div>
              ) : null}
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted, #8C7B68)',
                cursor: 'pointer',
                fontSize: 14,
                padding: '2px 4px',
                lineHeight: 1,
              }}
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
