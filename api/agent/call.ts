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
  /** User's Encompass access token (from /api/encompass/login). Required for
   *  encompass-* tools unless useAdminCreds is true. */
  accessToken?: string;
  /** Admin override — falls back to the static ENCOMPASS_USER / ENCOMPASS_PASS
   *  (Jbeach). Only set this from the admin panel. */
  useAdminCreds?: boolean;
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

/**
 * Resolve an Encompass access token for the request.
 * - If the body carried a user `accessToken`, use it.
 * - Else if `useAdminCreds` was true, fall back to the static admin user/pass.
 * - Else return null → caller responds with "please log in".
 */
async function resolveEncompassToken(
  body: CallBody,
): Promise<{ token: string; base: string } | { error: string; status: number }> {
  const base = process.env.ENCOMPASS_API_BASE_URL || 'https://api.elliemae.com';

  if (body.accessToken) {
    return { token: body.accessToken, base };
  }

  if (body.useAdminCreds) {
    const clientId = process.env.ENCOMPASS_CLIENT_ID;
    const clientSecret = process.env.ENCOMPASS_CLIENT_SECRET;
    const instanceId = process.env.ENCOMPASS_INSTANCE_ID;
    const user = process.env.ENCOMPASS_USER;
    const pass = process.env.ENCOMPASS_PASS;
    if (!clientId || !clientSecret || !instanceId || !user || !pass) {
      return { error: 'Admin Encompass credentials not configured.', status: 503 };
    }
    const tokenBody = new URLSearchParams({
      grant_type: 'password',
      username: `${user}@encompass:${instanceId}`,
      password: pass,
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'lp',
    });
    const res = await fetch(`${base}/oauth2/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody,
    });
    if (!res.ok) {
      return {
        error: `Admin Encompass auth ${res.status}: ${(await res.text()).slice(0, 160)}`,
        status: 502,
      };
    }
    const json = (await res.json()) as { access_token?: string };
    if (!json.access_token) {
      return { error: 'Admin Encompass auth: no access_token', status: 502 };
    }
    return { token: json.access_token, base };
  }

  return {
    error:
      'Not signed in to Encompass. Click Login and enter your Encompass email + password to view your pipeline.',
    status: 401,
  };
}

async function toolEncompassDeal(
  args: Record<string, unknown>,
  body: CallBody,
): Promise<Response> {
  const loanNumber = String(args.loanNumber || args.loan_number || '').trim();
  const borrowerLastName = String(args.borrowerLastName || args.lastName || '').trim();
  if (!loanNumber && !borrowerLastName) {
    return jsonResponse(400, { ok: false, error: 'Provide loanNumber or borrowerLastName' });
  }

  const auth = await resolveEncompassToken(body);
  if ('error' in auth) {
    return jsonResponse(auth.status, { ok: false, error: auth.error });
  }

  try {
    const filter: Record<string, unknown> = loanNumber
      ? { canonicalName: 'Loan.LoanNumber', value: loanNumber, matchType: 'exact' }
      : { canonicalName: 'Loan.BorrowerLastName', value: borrowerLastName, matchType: 'startsWith' };
    const res = await fetch(`${auth.base}/encompass/v3/loanPipeline?limit=5`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
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
    if (!res.ok) {
      const text = await res.text();
      // 401 from Encompass means the user's token expired
      if (res.status === 401) {
        return jsonResponse(401, {
          ok: false,
          error: 'Your Encompass session expired. Please log in again.',
        });
      }
      throw new Error(`Encompass pipeline ${res.status}: ${text.slice(0, 160)}`);
    }
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

/* ---------- Tool: rentcast-property ---------- */
/**
 * Looks up RentCast property data for an address. Pulls the three core
 * endpoints in parallel and returns a combined block:
 *   - /properties        (basics: type, beds/baths, sqft, year built, owner)
 *   - /avm/value         (current valuation + comps)
 *   - /avm/rent/long-term (LTR rent estimate + comps)
 *
 * Auth: X-Api-Key header. Free tier rate-limit: 50 requests/month/endpoint
 * (per RentCast docs); we do 3 per call so plan budget accordingly.
 */
async function toolRentcastProperty(args: Record<string, unknown>): Promise<Response> {
  const apiKey = process.env.RENTCAST_API_KEY;
  if (!apiKey) return missingCreds('RentCast');
  const address = String(args.address || '').trim();
  if (!address) {
    return jsonResponse(400, { ok: false, error: 'Provide an address' });
  }
  const enc = encodeURIComponent(address);
  const headers = { 'X-Api-Key': apiKey, Accept: 'application/json' };
  const base = 'https://api.rentcast.io/v1';

  const fetchSafe = async (url: string): Promise<unknown> => {
    try {
      const r = await fetch(url, { headers });
      if (!r.ok) return { error: `${r.status}: ${(await r.text()).slice(0, 120)}` };
      return await r.json();
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  };

  const [property, value, rent] = await Promise.all([
    fetchSafe(`${base}/properties?address=${enc}`),
    fetchSafe(`${base}/avm/value?address=${enc}&compCount=5`),
    fetchSafe(`${base}/avm/rent/long-term?address=${enc}&compCount=5`),
  ]);

  return jsonResponse(200, {
    ok: true,
    data: { address, property, value, rent },
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

/**
 * Tool handlers. Each receives the raw args plus the full body so it can read
 * accessToken / useAdminCreds when needed.
 */
type ToolHandler = (args: Record<string, unknown>, body: CallBody) => Promise<Response>;

const TOOLS: Record<string, ToolHandler> = {
  'encompass-deal': toolEncompassDeal,
  'fub-notes': (args) => toolFubNotes(args),
  airdna: (args) => toolAirdna(args),
  steadily: (args) => toolSteadily(args),
  'stewart-fee': (args) => toolStewartFee(args),
  'rentcast-property': (args) => toolRentcastProperty(args),
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
  return handler(body.args || {}, body);
}
