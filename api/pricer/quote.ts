/**
 * POST /api/pricer/quote
 *
 * Authenticates with Optimal Blue Marketplace via Azure AD OAuth and submits
 * a basic scenario for pricing. Returns a normalized rate matrix the inline
 * PricerPanel can render.
 *
 * Required env (server-only):
 *   OB_CLIENT_ID
 *   OB_CLIENT_SECRET
 *   OB_AAD_TOKEN_URL
 *   OB_AAD_RESOURCE
 *   OB_API_BASE_URL
 *   OB_BUSINESS_CHANNEL_ID
 *   OB_ORIGINATOR_ID
 */

export const config = { runtime: 'edge' };

interface QuoteBody {
  // Borrower
  fico?: number;
  selfEmployed?: boolean;
  foreignNational?: boolean;
  // Property
  propertyAddress?: string;
  propertyState?: string;
  propertyType?: string;
  occupancy?: string;
  units?: number;
  // Loan
  loanAmount?: number;
  ltv?: number;
  loanPurpose?: 'Purchase' | 'RateTerm' | 'CashOut';
  docType?: string;
  // Rate lock
  lockPeriod?: number;
  buydown?: string;
}

interface OBEnv {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  resource: string;
  apiBase: string;
  channelId: string;
  originatorId: string;
}

function readEnv(): OBEnv | null {
  const clientId = process.env.OB_CLIENT_ID;
  const clientSecret = process.env.OB_CLIENT_SECRET;
  const tokenUrl = process.env.OB_AAD_TOKEN_URL;
  const resource = process.env.OB_AAD_RESOURCE;
  const apiBase = process.env.OB_API_BASE_URL;
  const channelId = process.env.OB_BUSINESS_CHANNEL_ID;
  const originatorId = process.env.OB_ORIGINATOR_ID;
  if (!clientId || !clientSecret || !tokenUrl || !resource || !apiBase || !channelId || !originatorId)
    return null;
  return { clientId, clientSecret, tokenUrl, resource, apiBase, channelId, originatorId };
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function getOBToken(env: OBEnv): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: env.clientId,
    client_secret: env.clientSecret,
    resource: env.resource,
  });
  const res = await fetch(env.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`OB AAD ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error('OB AAD: no access_token returned');
  return json.access_token;
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
  if (req.method !== 'POST') return jsonResponse(405, { ok: false, error: 'Method not allowed' });

  let body: QuoteBody;
  try {
    body = (await req.json()) as QuoteBody;
  } catch {
    return jsonResponse(400, { ok: false, error: 'Invalid JSON body' });
  }

  const env = readEnv();
  if (!env) {
    return jsonResponse(503, {
      ok: false,
      error:
        'Optimal Blue not configured. Set OB_CLIENT_ID, OB_CLIENT_SECRET, OB_AAD_TOKEN_URL, OB_AAD_RESOURCE, OB_API_BASE_URL, OB_BUSINESS_CHANNEL_ID, OB_ORIGINATOR_ID in Vercel env to enable.',
      fallbackUrl: 'https://submit.tqltpo.com',
    });
  }

  try {
    const token = await getOBToken(env);

    const scenario = {
      businessChannelId: env.channelId,
      originatorId: env.originatorId,
      loan: {
        loanAmount: body.loanAmount ?? 0,
        loanPurpose: body.loanPurpose ?? 'Purchase',
        ltv: body.ltv ?? 0,
        docType: body.docType ?? 'Full',
      },
      borrower: {
        fico: body.fico ?? 720,
        selfEmployed: !!body.selfEmployed,
        foreignNational: !!body.foreignNational,
      },
      property: {
        address: body.propertyAddress ?? '',
        state: body.propertyState ?? '',
        propertyType: body.propertyType ?? 'SingleFamily',
        occupancy: body.occupancy ?? 'Investment',
        units: body.units ?? 1,
      },
      rateLock: {
        lockPeriod: body.lockPeriod ?? 30,
        buydown: body.buydown ?? 'None',
      },
    };

    const res = await fetch(`${env.apiBase}/api/v1/pricing/quote`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(scenario),
    });

    if (!res.ok) {
      const text = await res.text();
      // Surface a graceful fallback when OB returns an error (often the
      // marketplace requires a full borrower scenario beyond our quick form).
      return jsonResponse(res.status, {
        ok: false,
        error: `OB ${res.status}: ${text.slice(0, 240)}`,
        fallbackUrl: 'https://submit.tqltpo.com',
        scenario,
      });
    }

    const data = await res.json();
    return jsonResponse(200, { ok: true, data, scenario });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return jsonResponse(500, {
      ok: false,
      error: msg.slice(0, 240),
      fallbackUrl: 'https://submit.tqltpo.com',
    });
  }
}
