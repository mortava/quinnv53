/**
 * Encompass Login modal — user enters their Encompass email + password to
 * authenticate against api.elliemae.com. The password never persists; only
 * the resulting access token is stored in sessionStorage.
 */

import React, { useState } from 'react';
import { loginToEncompass, EncompassSession } from '../lib/encompassAuth';

interface EncompassLoginModalProps {
  onClose: () => void;
  onSuccess: (session: EncompassSession) => void;
}

export default function EncompassLoginModal({ onClose, onSuccess }: EncompassLoginModalProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);

  const submit = async (): Promise<void> => {
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setBusy(true);
    setError('');
    const result = await loginToEncompass(email.trim(), password);
    setBusy(false);
    if (result.ok && result.session) {
      onSuccess(result.session);
    } else {
      setError(result.error || 'Login failed.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: 28,
          borderRadius: 18,
          border: '1px solid #e5e5e5',
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        <div
          style={{
            fontFamily: '"SF Pro Rounded","Nunito",system-ui,sans-serif',
            fontSize: 22,
            fontWeight: 600,
            color: '#000',
            marginBottom: 18,
          }}
        >
          Sign in to TQL PORTAL
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void submit();
          }}
          placeholder="you@tqlend.com"
          autoComplete="username"
          autoFocus
          style={{
            width: '100%',
            height: 42,
            padding: '0 14px',
            borderRadius: 9999,
            border: '1px solid #d4d4d4',
            outline: 'none',
            fontSize: 14,
            fontFamily: 'inherit',
            marginBottom: 10,
          }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void submit();
          }}
          placeholder="Encompass password"
          autoComplete="current-password"
          style={{
            width: '100%',
            height: 42,
            padding: '0 14px',
            borderRadius: 9999,
            border: '1px solid #d4d4d4',
            outline: 'none',
            fontSize: 14,
            fontFamily: 'inherit',
            marginBottom: 12,
          }}
        />
        {error && (
          <div
            style={{
              fontSize: 12,
              color: '#b91c1c',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '8px 12px',
              borderRadius: 10,
              marginBottom: 12,
              wordBreak: 'break-word',
            }}
          >
            {error}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy}
            style={{
              flex: 1,
              height: 42,
              borderRadius: 9999,
              background: busy ? '#737373' : '#000',
              color: '#fff',
              border: 0,
              fontSize: 14,
              fontWeight: 500,
              cursor: busy ? 'default' : 'pointer',
            }}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              height: 42,
              padding: '0 20px',
              borderRadius: 9999,
              background: 'transparent',
              color: '#525252',
              border: '1px solid #d4d4d4',
              fontSize: 14,
              cursor: busy ? 'default' : 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: '1px solid #e5e5e5',
            fontSize: 11,
            color: '#a3a3a3',
            lineHeight: 1.5,
          }}
        >
          Need admin access? Go to{' '}
          <a href="#/admin" style={{ color: '#000', textDecoration: 'underline' }}>
            /admin
          </a>{' '}
          and enter the admin passcode.
        </div>
      </div>
    </div>
  );
}
