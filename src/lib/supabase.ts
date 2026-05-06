/**
 * Supabase client + activity logger.
 *
 * Tables this module writes to (run the SQL in supabase-schema.sql once via
 * Supabase Studio → SQL editor before traffic hits prod):
 *   - quinn_sessions
 *   - quinn_chat_logs
 *   - quinn_pricing_logs
 *   - quinn_search_logs
 *
 * 3-day retention is enforced by a Postgres TTL policy in the schema.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (cached) return cached;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  cached = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  return cached;
}

/* ---------- Session id (one per browser tab, persisted across reloads) ---------- */
const SESSION_KEY = 'quinn_session_id';

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let id = window.sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      window.crypto?.randomUUID?.() ??
      `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/* ---------- Logger ---------- */
type LogKind = 'chat' | 'pricing' | 'search';

interface ChatLogRow {
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: Array<{ name: string; mimeType: string; size: string }>;
  created_at?: string;
}

interface PricingLogRow {
  session_id: string;
  scenario: Record<string, unknown>;
  result: Record<string, unknown> | null;
  created_at?: string;
}

interface SearchLogRow {
  session_id: string;
  query: string;
  doc_id?: string;
  created_at?: string;
}

export async function logChatTurn(row: ChatLogRow): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from('quinn_chat_logs').insert([{ ...row, created_at: new Date().toISOString() }]);
  } catch {
    // never block the UI on telemetry failures
  }
}

export async function logPricing(row: PricingLogRow): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from('quinn_pricing_logs').insert([{ ...row, created_at: new Date().toISOString() }]);
  } catch {
    /* noop */
  }
}

export async function logSearch(row: SearchLogRow): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from('quinn_search_logs').insert([{ ...row, created_at: new Date().toISOString() }]);
  } catch {
    /* noop */
  }
}

/* ---------- Admin reads (for /admin panel) ---------- */
export interface AdminFeedRow {
  table: LogKind;
  session_id: string;
  created_at: string;
  preview: string;
  raw: Record<string, unknown>;
}

export async function fetchAdminFeed(limit = 200): Promise<AdminFeedRow[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const [chats, pricing, searches] = await Promise.all([
    sb.from('quinn_chat_logs').select('*').order('created_at', { ascending: false }).limit(limit),
    sb.from('quinn_pricing_logs').select('*').order('created_at', { ascending: false }).limit(limit),
    sb.from('quinn_search_logs').select('*').order('created_at', { ascending: false }).limit(limit),
  ]);

  const rows: AdminFeedRow[] = [];
  for (const r of (chats.data || []) as ChatLogRow[]) {
    rows.push({
      table: 'chat',
      session_id: r.session_id,
      created_at: r.created_at || '',
      preview: `[${r.role}] ${r.content.slice(0, 140)}`,
      raw: r as unknown as Record<string, unknown>,
    });
  }
  for (const r of (pricing.data || []) as PricingLogRow[]) {
    rows.push({
      table: 'pricing',
      session_id: r.session_id,
      created_at: r.created_at || '',
      preview: `pricing scenario: ${JSON.stringify(r.scenario).slice(0, 120)}`,
      raw: r as unknown as Record<string, unknown>,
    });
  }
  for (const r of (searches.data || []) as SearchLogRow[]) {
    rows.push({
      table: 'search',
      session_id: r.session_id,
      created_at: r.created_at || '',
      preview: `search: ${r.query.slice(0, 140)}`,
      raw: r as unknown as Record<string, unknown>,
    });
  }
  rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  return rows;
}

export function exportFeedAsCSV(rows: AdminFeedRow[]): string {
  const header = 'created_at,table,session_id,preview\n';
  const escape = (s: string): string => `"${s.replace(/"/g, '""')}"`;
  const lines = rows.map(
    (r) =>
      `${escape(r.created_at)},${escape(r.table)},${escape(r.session_id)},${escape(r.preview)}`,
  );
  return header + lines.join('\n');
}
