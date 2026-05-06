/**
 * POST /api/agent/call
 *
 * Unified server-side tool dispatcher for Quinn's agentic non-guideline data
 * fetches. Each tool reads its own credentials from server env so the browser
 * never sees them.
 *
 * Body:
 *   { tool: 'encompass-deal' | 'airdna' | 'fub-notes' | 'steadily' | 'stewart-fee',
 *     args: Record<string, unknown> }
 *
 * Returns:
 *   { ok: true, data: ... }  on success
 *   { ok: false, error }     on failure (incl. missing creds → 503)
 */

export const config = { runtime: 'edge' };

interface CallBody {
  tool: string;
  args: Record<string, unknown>;
}

interface ToolResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

/* ---------- Shared helpers ---------- */

function jsonResponse(status: number, body: ToolResult): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function missingCreds(name: string): Response {
  return jsonResponse(503, {
    ok: false,
    error: `${name} not configured on server. Set the matching env vars in Vercel.`,
  });
}

/* ---------- Tool: encompass-deal ---------- */

interface EncompassEnv {
  base: string;
  clientId: string;
  clientSecret: string;
  instanceId: string;
  user: string;
  pass: string;
}

function readEncompassEnv(): EncompassEnv | null {
  const base = process.env.ENCOMPASS_API_BASE_URL || 'https://api.elliemae.com';
  const clientId = process.env.ENCOMPASS_CLIENT_ID;
  const clientSecret = process.env.ENCOMPASS_CLIENT_SECRET;
  const instanceId = process.env.ENCOMPASS_INSTANCE_ID;
  const user = process.env.ENCOMPASS_USER;
  const pass = process.env.ENCOMPASS_PASS;
  if (!clientId || !clientSecret || !instanceId || !user || !pass) return null;
  return { base, clientId, clientSecret, instanceId, user, pass };
}

async function getEncompassToken(env: EncompassEnv): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'password',
    username: `${env.user}@encompass:${env.instanceId}`,
    password: env.pass,
    client_id: env.clientId,
    client_secret: env.clientSecret,
    scope: 'lp',
  });
  const res = await fetch(`${env.base}/oauth2/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`Encompass auth ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error('Encompass auth: no access_token');
  return json.access_token;
}

async function toolEncompassDeal(args: Record<string, unknown>): Promise<Response> {
  const env = readEncompassEnv();
  if (!env) return missingCreds('Encompass');
  const loanNumber = String(args.loanNumber || args.loan_number || '').trim();
  const borrowerLastName = String(args.borrowerLastName || args.lastName || '').trim();
  if (!loanNumber && !borrowerLastName) {
    return jsonResponse(400, { ok: false, error: 'Provide loanNumber or borrowerLastName' });
  }
  try {
    const token = await getEncompassToken(env);
    const filter: Record<string, unknown> = loanNumber
      ? { canonicalName: 'Loan.LoanNumber', value: loanNumber, matchType: 'exact' }
      : { canonicalName: 'Loan.BorrowerLastName', value: borrowerLastName, matchType: 'startsWith' };
    const res = await fetch(`${env.base}/encompass/v3/loanPipeline?limit=5`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filter: { terms: [filter] },
        fields: [
          'Loan.GUID',
          'Loan.LoanNumber',
          'Loan.BorrowerFirstName',
          'Loan.BorrowerLastName',
          'Loan.LoanAmount',
          'Loan.LoanProgram',
          'Loan.CurrentMilestoneName',
          'Loan.CurrentRate',
          'Loan.LTV',
          'Loan.SubjectPropertyAddress',
        ],
      }),
    });
    if (!res.ok) throw new Error(`Encompass pipeline ${res.status}`);
    const data = await res.json();
    return jsonResponse(200, { ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return jsonResponse(500, { ok: false, error: msg });
  }
}

/* ---------- Tool: fub-notes (Follow Up Boss) ---------- */

async function toolFubNotes(args: Record<string, unknown>): Promise<Response> {
  const apiKey = process.env.FOLLOWUPBOSS_API_KEY;
  if (!apiKey) return missingCreds('Follow Up Boss');
  const personId = args.personId ? String(args.personId) : '';
  const params = new URLSearchParams();
  if (personId) params.set('personId', personId);
  params.set('limit', '10');
  // FUB uses HTTP Basic with API key as username, blank password
  const auth = btoa(`${apiKey}:`);
  try {
    const res = await fetch(`https://api.followupboss.com/v1/notes?${params}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!res.ok) throw new Error(`FUB ${res.status}: ${(await res.text()).slice(0, 160)}`);
    const data = await res.json();
    return jsonResponse(200, { ok: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return jsonResponse(500, { ok: false, error: msg });
  }
}

/* ---------- Tool: airdna (placeholder — real auth uses session cookie scrape) ---------- */

async function toolAirdna(args: Record<string, unknown>): Promise<Response> {
  const username = process.env.AIRDNA_USERNAME;
  const password = process.env.AIRDNA_PASSWORD;
  if (!username || !password) return missingCreds('AirDNA');
  // AirDNA does not publish a public REST API; full integration requires a
  // session-cookie scraper. For now return a structured stub the caller can
  // surface, plus instructions to upload an AirDNA report PDF for real data.
  return jsonResponse(200, {
    ok: true,
    data: {
      stub: true,
      address: args.address || null,
      message:
        'AirDNA requires session-based scraping. Upload an AirDNA report PDF for real data, or use the AirDNA browser at https://app.airdna.co/',
    },
  });
}

/* ---------- Tool: steadily (insurance quote) ---------- */

async function toolSteadily(args: Record<string, unknown>): Promise<Response> {
  const apiKey = process.env.STEADILY_API_KEY;
  if (!apiKey) return missingCreds('Steadily');
  // Steadily exposes a quote API gated behind their Partner Connect program.
  // We surface a stub here that the caller can use to render an estimate
  // pointer until the real API is wired.
  return jsonResponse(200, {
    ok: true,
    data: {
      stub: true,
      address: args.address || null,
      coverageType: args.coverageType || 'landlord',
      message:
        'Steadily landlord/rental insurance quotes require the Partner Connect API. Direct the borrower to https://www.steadily.com or use the Steadily quote tool in the deal desk.',
    },
  });
}

/* ---------- Tool: stewart-fee (title fee estimate) ---------- */

async function toolStewartFee(args: Record<string, unknown>): Promise<Response> {
  // Stewart Title's calculator is a public web tool, not an API. We surface
  // the URL the LO can click. Future work: headless-browser scraper.
  const loanAmount = args.loanAmount || args.amount || '';
  const state = args.state || '';
  const url = `https://www.stewartratecalculator.com/Quote/LoanEstimate?branded=true&quotetype=3&loanAmount=${loanAmount}&state=${state}`;
  return jsonResponse(200, {
    ok: true,
    data: {
      stub: true,
      url,
      message:
        'Stewart Title quotes are pulled from their public calculator. Open the URL above to view the estimate.',
    },
  });
}

/* ---------- Dispatcher ---------- */

const TOOLS: Record<string, (args: Record<string, unknown>) => Promise<Response>> = {
  'encompass-deal': toolEncompassDeal,
  'fub-notes': toolFubNotes,
  airdna: toolAirdna,
  steadily: toolSteadily,
  'stewart-fee': toolStewartFee,
};

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
  if (req.method !== 'POST') return jsonResponse(405, { ok: false, error: 'Method not allowed' });

  let body: CallBody;
  try {
    body = (await req.json()) as CallBody;
  } catch {
    return jsonResponse(400, { ok: false, error: 'Invalid JSON body' });
  }
  if (!body.tool) return jsonResponse(400, { ok: false, error: 'Missing tool name' });

  const handler = TOOLS[body.tool];
  if (!handler) {
    return jsonResponse(400, {
      ok: false,
      error: `Unknown tool '${body.tool}'. Available: ${Object.keys(TOOLS).join(', ')}`,
    });
  }
  return handler(body.args || {});
}
