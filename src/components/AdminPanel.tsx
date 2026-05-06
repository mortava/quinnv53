/**
 * Admin Panel — passcode-gated live activity feed.
 * Mounted at #/admin (or whenever the user clicks "Login" then enters the code).
 *
 * Reads from Supabase: quinn_chat_logs, quinn_pricing_logs, quinn_search_logs.
 * Polls every 5s for live monitoring. Allows CSV export of the current view.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AdminFeedRow,
  exportFeedAsCSV,
  fetchAdminFeed,
  getSupabase,
} from '../lib/supabase';

const ADMIN_PASSCODE = process.env.VITE_ADMIN_PASSCODE || 'Winner26!';
const ADMIN_AUTH_KEY = 'quinn_admin_authed';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [authed, setAuthed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(ADMIN_AUTH_KEY) === '1';
  });
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');

  const submitCode = (): void => {
    if (code === ADMIN_PASSCODE) {
      window.sessionStorage.setItem(ADMIN_AUTH_KEY, '1');
      setAuthed(true);
      setError('');
    } else {
      setError('Incorrect passcode.');
      setCode('');
    }
  };

  if (!authed) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#fafafa',
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
            padding: 32,
            borderRadius: 16,
            border: '1px solid #e5e5e5',
            width: '100%',
            maxWidth: 360,
          }}
        >
          <div
            style={{
              fontFamily: '"SF Pro Rounded","Nunito",system-ui,sans-serif',
              fontSize: 20,
              fontWeight: 600,
              color: '#000',
              marginBottom: 6,
            }}
          >
            Admin
          </div>
          <div style={{ fontSize: 13, color: '#737373', marginBottom: 16 }}>
            Enter the admin passcode to view live activity.
          </div>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitCode();
            }}
            placeholder="Passcode"
            autoFocus
            style={{
              width: '100%',
              height: 40,
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
            <div style={{ fontSize: 12, color: '#b91c1c', marginBottom: 12 }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={submitCode}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 9999,
                background: '#000',
                color: '#fff',
                border: 0,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                height: 40,
                padding: '0 20px',
                borderRadius: 9999,
                background: 'transparent',
                color: '#525252',
                border: '1px solid #d4d4d4',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminFeed onClose={onClose} />;
}

/* ---------- Live activity feed ---------- */

interface AdminFeedProps {
  onClose: () => void;
}

function AdminFeed({ onClose }: AdminFeedProps) {
  const [rows, setRows] = useState<AdminFeedRow[]>([]);
  const [filter, setFilter] = useState<'all' | 'chat' | 'pricing' | 'search'>('all');
  const [search, setSearch] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const load = useCallback(async (): Promise<void> => {
    try {
      const fresh = await fetchAdminFeed(300);
      setRows(fresh);
      setError('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getSupabase()) {
      setError('Supabase not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing).');
      setLoading(false);
      return;
    }
    void load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  const filtered = useMemo<AdminFeedRow[]>(() => {
    return rows
      .filter((r) => filter === 'all' || r.table === filter)
      .filter((r) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          r.session_id.toLowerCase().includes(q) ||
          r.preview.toLowerCase().includes(q)
        );
      });
  }, [rows, filter, search]);

  const exportCsv = (): void => {
    const csv = exportFeedAsCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quinn-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const signOut = (): void => {
    window.sessionStorage.removeItem(ADMIN_AUTH_KEY);
    onClose();
  };

  const sessionCounts = useMemo<Map<string, number>>(() => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.session_id, (m.get(r.session_id) || 0) + 1);
    return m;
  }, [rows]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#fafafa',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: 60,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          borderBottom: '1px solid #e5e5e5',
          background: '#fff',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: '"SF Pro Rounded","Nunito",system-ui,sans-serif',
            fontSize: 17,
            fontWeight: 600,
          }}
        >
          Quinn · Admin
        </div>
        <span
          style={{
            padding: '3px 10px',
            borderRadius: 9999,
            background: '#fafafa',
            fontSize: 11,
            color: '#525252',
            fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
          }}
        >
          live · 5s poll
        </span>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={exportCsv}
          style={{
            height: 32,
            padding: '0 16px',
            borderRadius: 9999,
            background: '#fff',
            border: '1px solid #d4d4d4',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={signOut}
          style={{
            height: 32,
            padding: '0 16px',
            borderRadius: 9999,
            background: '#000',
            color: '#fff',
            border: 0,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>

      <div
        style={{
          padding: '16px 24px',
          background: '#fff',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        {(['all', 'chat', 'pricing', 'search'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            style={{
              height: 30,
              padding: '0 14px',
              borderRadius: 9999,
              background: filter === k ? '#000' : '#fff',
              color: filter === k ? '#fff' : '#525252',
              border: '1px solid #d4d4d4',
              fontSize: 13,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {k}
          </button>
        ))}
        <input
          type="search"
          placeholder="Search session id or content"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 220,
            height: 32,
            padding: '0 14px',
            borderRadius: 9999,
            border: '1px solid #d4d4d4',
            outline: 'none',
            fontSize: 13,
            background: '#fafafa',
          }}
        />
        <span style={{ fontSize: 12, color: '#737373' }}>
          {filtered.length} of {rows.length} rows · {sessionCounts.size} sessions
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {error && (
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}
        {loading && rows.length === 0 && (
          <div style={{ color: '#737373', fontSize: 13 }}>Loading…</div>
        )}
        {!loading && filtered.length === 0 && !error && (
          <div style={{ color: '#737373', fontSize: 13 }}>
            No activity yet. Make sure the SQL schema (supabase-schema.sql) has been run and that
            chat traffic is hitting the app.
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((r, i) => (
            <div
              key={i}
              style={{
                padding: '12px 16px',
                background: '#fff',
                border: '1px solid #e5e5e5',
                borderRadius: 12,
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  padding: '2px 10px',
                  borderRadius: 9999,
                  background: tableColor(r.table).bg,
                  color: tableColor(r.table).fg,
                  fontSize: 11,
                  fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                {r.table}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    color: '#171717',
                    wordBreak: 'break-word',
                  }}
                >
                  {r.preview}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#a3a3a3',
                    marginTop: 4,
                    fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
                  }}
                >
                  {new Date(r.created_at).toLocaleString()} · {r.session_id}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function tableColor(t: 'chat' | 'pricing' | 'search'): { bg: string; fg: string } {
  switch (t) {
    case 'chat':
      return { bg: '#eff6ff', fg: '#1d4ed8' };
    case 'pricing':
      return { bg: '#ecfdf5', fg: '#047857' };
    case 'search':
      return { bg: '#fef3c7', fg: '#92400e' };
  }
}
