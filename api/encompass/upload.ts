/**
 * POST /api/encompass/upload
 *
 * Push a base64-encoded document into the Encompass Loan Origination System
 * against a given loan number.
 *
 * Required env vars (set on Vercel):
 *   ENCOMPASS_CLIENT_ID        — partner API client id
 *   ENCOMPASS_CLIENT_SECRET    — partner API client secret
 *   ENCOMPASS_INSTANCE_ID      — your Encompass instance id (e.g. "BE12345678")
 *   ENCOMPASS_USER             — Encompass user login
 *   ENCOMPASS_PASS             — Encompass user password
 *
 * Body (JSON):
 *   { loanNumber: string, name: string, mimeType: string, data: string (base64) }
 *
 * Returns:
 *   200 { ok: true, attachmentId, loanGuid }
 *   400 { ok: false, error }   — bad request
 *   500 { ok: false, error }   — Encompass error or missing creds
 */

interface UploadBody {
  loanNumber: string;
  name: string;
  mimeType: string;
  data: string;
}

interface EncompassEnv {
  clientId: string;
  clientSecret: string;
  instanceId: string;
  user: string;
  pass: string;
}

const ENCOMPASS_BASE = 'https://api.elliemae.com';

function readEnv(): EncompassEnv | null {
  const clientId = process.env.ENCOMPASS_CLIENT_ID;
  const clientSecret = process.env.ENCOMPASS_CLIENT_SECRET;
  const instanceId = process.env.ENCOMPASS_INSTANCE_ID;
  const user = process.env.ENCOMPASS_USER;
  const pass = process.env.ENCOMPASS_PASS;
  if (!clientId || !clientSecret || !instanceId || !user || !pass) return null;
  return { clientId, clientSecret, instanceId, user, pass };
}

async function getAccessToken(env: EncompassEnv): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'password',
    username: `${env.user}@encompass:${env.instanceId}`,
    password: env.pass,
    client_id: env.clientId,
    client_secret: env.clientSecret,
    scope: 'lp',
  });
  const res = await fetch(`${ENCOMPASS_BASE}/oauth2/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Encompass auth failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error('Encompass auth: no access_token returned');
  return json.access_token;
}

async function findLoanGuid(token: string, loanNumber: string): Promise<string> {
  const res = await fetch(`${ENCOMPASS_BASE}/encompass/v3/loanPipeline?limit=1`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filter: {
        terms: [
          { canonicalName: 'Loan.LoanNumber', value: loanNumber, matchType: 'exact' },
        ],
      },
      fields: ['Loan.GUID', 'Loan.LoanNumber'],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Encompass pipeline lookup failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as Array<{ loanGuid?: string; fields?: Record<string, string> }>;
  const guid = json[0]?.loanGuid || json[0]?.fields?.['Loan.GUID'];
  if (!guid) throw new Error(`Loan number ${loanNumber} not found in Encompass`);
  return guid;
}

async function uploadAttachment(
  token: string,
  loanGuid: string,
  body: UploadBody,
): Promise<string> {
  // Step 1: create attachment placeholder, get upload URL
  const create = await fetch(
    `${ENCOMPASS_BASE}/encompass/v1/loans/${loanGuid}/attachmentUploadUrl`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: { contentType: body.mimeType, name: body.name } }),
    },
  );
  if (!create.ok) {
    const text = await create.text();
    throw new Error(`Encompass attachment create failed (${create.status}): ${text.slice(0, 200)}`);
  }
  const placeholder = (await create.json()) as {
    attachmentId?: string;
    mediaUrl?: string;
    authorizationHeader?: string;
  };
  if (!placeholder.mediaUrl) throw new Error('Encompass: no mediaUrl returned');

  // Step 2: PUT file bytes to mediaUrl
  const buf = Buffer.from(body.data, 'base64');
  const put = await fetch(placeholder.mediaUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': body.mimeType,
      ...(placeholder.authorizationHeader
        ? { Authorization: placeholder.authorizationHeader }
        : {}),
    },
    body: buf,
  });
  if (!put.ok) {
    const text = await put.text();
    throw new Error(`Encompass file PUT failed (${put.status}): ${text.slice(0, 200)}`);
  }

  return placeholder.attachmentId || 'unknown';
}

// Edge runtime — required for the (req: Request) => Promise<Response> signature.
// Without this, Vercel uses Node runtime which expects (req, res) and the
// function hangs forever with no response.
export const config = { runtime: 'edge' };

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
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }
  let body: UploadBody;
  try {
    body = (await req.json()) as UploadBody;
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!body.loanNumber || !body.name || !body.mimeType || !body.data) {
    return Response.json(
      { ok: false, error: 'loanNumber, name, mimeType, data are required' },
      { status: 400 },
    );
  }

  const env = readEnv();
  if (!env) {
    return Response.json(
      {
        ok: false,
        error:
          'Encompass credentials not configured. Set ENCOMPASS_CLIENT_ID, ENCOMPASS_CLIENT_SECRET, ENCOMPASS_INSTANCE_ID, ENCOMPASS_USER, ENCOMPASS_PASS in Vercel env to enable.',
      },
      { status: 503 },
    );
  }

  try {
    const token = await getAccessToken(env);
    const loanGuid = await findLoanGuid(token, body.loanNumber);
    const attachmentId = await uploadAttachment(token, loanGuid, body);
    return Response.json({ ok: true, attachmentId, loanGuid });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
