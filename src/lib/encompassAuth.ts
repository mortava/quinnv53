/**
 * Client helper for Encompass user authentication.
 *
 * Tokens are stored in sessionStorage so they live for the tab's lifetime
 * and disappear when the tab closes — never written to localStorage.
 *
 * The user's password never touches sessionStorage; we POST it once to
 * /api/encompass/login, get the access_token + expiresAt back, and forget
 * the password client-side.
 */

const TOKEN_KEY = 'quinn_encompass_token';
const TOKEN_EMAIL_KEY = 'quinn_encompass_email';
const TOKEN_EXPIRES_KEY = 'quinn_encompass_expires';

export interface EncompassSession {
  accessToken: string;
  email: string;
  expiresAt: number;
}

export interface LoginResult {
  ok: boolean;
  session?: EncompassSession;
  error?: string;
}

export function getEncompassSession(): EncompassSession | null {
  if (typeof window === 'undefined') return null;
  const accessToken = window.sessionStorage.getItem(TOKEN_KEY);
  const email = window.sessionStorage.getItem(TOKEN_EMAIL_KEY);
  const expiresAt = Number(window.sessionStorage.getItem(TOKEN_EXPIRES_KEY) || 0);
  if (!accessToken || !email || !expiresAt) return null;
  if (Date.now() >= expiresAt) {
    clearEncompassSession();
    return null;
  }
  return { accessToken, email, expiresAt };
}

export function clearEncompassSession(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_EMAIL_KEY);
  window.sessionStorage.removeItem(TOKEN_EXPIRES_KEY);
}

export async function loginToEncompass(email: string, password: string): Promise<LoginResult> {
  try {
    const res = await fetch('/api/encompass/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = (await res.json()) as {
      ok: boolean;
      accessToken?: string;
      expiresAt?: number;
      email?: string;
      error?: string;
    };
    if (!json.ok || !json.accessToken || !json.expiresAt) {
      return { ok: false, error: json.error || 'Login failed' };
    }
    const session: EncompassSession = {
      accessToken: json.accessToken,
      email: json.email || email,
      expiresAt: json.expiresAt,
    };
    window.sessionStorage.setItem(TOKEN_KEY, session.accessToken);
    window.sessionStorage.setItem(TOKEN_EMAIL_KEY, session.email);
    window.sessionStorage.setItem(TOKEN_EXPIRES_KEY, String(session.expiresAt));
    return { ok: true, session };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Network error during login',
    };
  }
}
