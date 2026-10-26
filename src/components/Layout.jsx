import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { NAV, resources } from '../resources';
import { useAuth } from '../context/AuthContext';
import { Toaster } from './toast';
import NotificationCenter from './NotificationCenter';
import { mock } from '../data/mock';

function useTheme() {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('vs_theme') || ''; } catch { return ''; } });
  useEffect(() => {
    try {
      if (theme) document.documentElement.setAttribute('data-theme', theme);
      else document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('vs_theme', theme);
    } catch {}
  }, [theme]);
  const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme:dark)').matches);
  return { isDark, toggle: () => setTheme(isDark ? 'light' : 'dark') };
}

// static badges from mock (live counts come from API once wired)
const badgeFor = (key) => {
  if (key === 'vendors') return mock.vendors.filter((v) => v.kyc === 'Pending').length;
  if (key === 'payouts') return mock.payouts.filter((p) => p.status === 'Requested').length;
  if (key === 'events') return mock.events.filter((e) => e.status === 'Pending').length;
  return 0;
};

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const { isDark, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  const key = loc.pathname.replace('/', '') || 'dash';
  const meta = key === 'dash' ? { title: 'Dashboard', crumb: 'Overview of both apps' }
    : key === 'settings' ? { title: 'Settings', crumb: 'Commission, roles, config' }
    : resources[key] || { title: '', crumb: '' };

  return (
    <div className="app">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="mark">🕉️</div>
          <div><div className="name">Vaidic Sanskar</div><div className="sub">Admin Console</div></div>
        </div>
        <nav>
          {NAV.map((g) => (
            <div className="navgroup" key={g.group}>
              <div className="lbl">{g.group}</div>
              {g.items.map((it) => {
                const to = it.key === 'dash' ? '/' : `/${it.key}`;
                const b = badgeFor(it.key);
                return (
                  <NavLink key={it.key} to={to} end={it.key === 'dash'}
                    className={({ isActive }) => `nav ${isActive ? 'active' : ''}`}>
                    <span className="ico">{it.icon}</span>{it.title}
                    {b ? <span className="count">{b}</span> : null}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '14px 20px', color: 'var(--sidebar-muted)', fontSize: 11 }}>v1.0 · {user?.role || 'Admin'}</div>
      </aside>
      <div className={`scrim ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />

      <div className="main">
        <header className="topbar">
          <button className="hamburger" onClick={() => setOpen((o) => !o)} aria-label="Menu">☰</button>
          <div style={{ minWidth: 0 }}>
            <h1>{meta.title}</h1>
            <div className="crumb">{meta.crumb}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <NotificationCenter />
            <button className="iconbtn" onClick={toggle} title="Toggle theme">{isDark ? '☀️' : '🌙'}</button>
            <button className="iconbtn" onClick={() => { logout(); nav('/login'); }} title="Logout">⎋</button>
            <div className="avatar">{(user?.name || 'SA').split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
          </div>
        </header>
        <main className="canvas"><Outlet /></main>
      </div>
      <Toaster />
    </div>
  );
}
