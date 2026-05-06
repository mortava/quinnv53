/**
 * POST /api/encompass/login
 *
 * Exchanges a user's Encompass email + password for an OAuth access token.
 * The token is returned to the client and stored in sessionStorage; every
 * subsequent /api/agent/call or /api/encompass/upload request passes it in
 * the body so the user only sees THEIR own pipeline.
 *
 * Server-only env (read here, never sent to client):
 *   ENCOMPASS_API_BASE_URL
 *   ENCOMPASS_CLIENT_ID
 *   ENCOMPASS_CLIENT_SECRET
 *   ENCOMPASS_INSTANCE_ID
 *
 * The static ENCOMPASS_USER / ENCOMPASS_PASS (Jbeach admin) are NOT used here.
 * Those are only invoked when an admin explicitly triggers a tool with
 * `useAdminCreds: true` from the admin panel.
 */

export const config = { runtime: 'edge' };

interface LoginBody {
  email: string;
  password: string;
}

interface LoginResult {
  ok: boolean;
  accessToken?: string;
  expiresAt?: number;
  email?: string;
  error?: string;
}

function jsonResponse(status: number, body: LoginResult): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  if (req.method !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'Method not allowed' });
  }

  let body: LoginBody;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return jsonResponse(400, { ok: false, error: 'Invalid JSON body' });
  }
  if (!body.email || !body.password) {
    return jsonResponse(400, { ok: false, error: 'email and password are required' });
  }

  const base = process.env.ENCOMPASS_API_BASE_URL || 'https://api.elliemae.com';
  const clientId = process.env.ENCOMPASS_CLIENT_ID;
  const clientSecret = process.env.ENCOMPASS_CLIENT_SECRET;
  const instanceId = process.env.ENCOMPASS_INSTANCE_ID;

  if (!clientId || !clientSecret || !instanceId) {
    return jsonResponse(503, {
      ok: false,
      error:
        'Encompass server config missing. Set ENCOMPASS_CLIENT_ID, ENCOMPASS_CLIENT_SECRET, ENCOMPASS_INSTANCE_ID in Vercel env.',
    });
  }

  // Encompass partner OAuth password grant. The username field combines the
  // user's Encompass login id with the instance via the documented format.
  const tokenBody = new URLSearchParams({
    grant_type: 'password',
    username: `${body.email}@encompass:${instanceId}`,
    password: body.password,
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'lp',
  });

  try {
    const res = await fetch(`${base}/oauth2/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody,
    });
    const text = await res.text();
    if (!res.ok) {
      let detail = text.slice(0, 240);
      try {
        const j = JSON.parse(text) as { error_description?: string; error?: string };
        detail = j.error_description || j.error || detail;
      } catch {
        // raw text
      }
      return jsonResponse(401, {
        ok: false,
        error: `Encompass login failed: ${detail}`,
      });
    }
    const json = JSON.parse(text) as { access_token?: string; expires_in?: number };
    if (!json.access_token) {
      return jsonResponse(500, { ok: false, error: 'Encompass returned no access_token' });
    }
    const expiresAt = Date.now() + (json.expires_in ? json.expires_in * 1000 : 60 * 60 * 1000);
    return jsonResponse(200, {
      ok: true,
      accessToken: json.access_token,
      expiresAt,
      email: body.email,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return jsonResponse(500, { ok: false, error: msg.slice(0, 240) });
  }
}
