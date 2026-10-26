import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@vaidicsanskar.com');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const res = await login(email, password);
    setBusy(false);
    if (res.ok) nav('/'); else setErr(res.message || 'Login failed');
  };

  return (
    <div className="login">
      <form className="loginCard" onSubmit={submit}>
        <div className="mark">🕉️</div>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Admin Login</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '4px 0 20px' }}>Vaidic Sanskar — manage both apps</p>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" />
        </div>
        {err && <div style={{ color: 'var(--crit)', fontSize: 12.5, marginBottom: 12 }}>{err}</div>}
        <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
        <p style={{ color: 'var(--muted)', fontSize: 11.5, marginTop: 14, textAlign: 'center' }}>
          Dev mode: any credentials work until the backend is connected.
        </p>
      </form>
    </div>
  );
}
