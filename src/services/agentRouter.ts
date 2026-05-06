/**
 * Agentic intent classifier + tool dispatcher.
 *
 * Pre-processes a user query before it hits the LLM. If the question is NOT a
 * guideline lookup (e.g. it's a deal status, an STR-rent question, an FUB note
 * pull), routes to the matching `/api/agent/call?tool=...` server function and
 * returns the data so it can be injected into the LLM context.
 *
 * Guideline lookups stay on the existing RAG/Cerebras path untouched.
 */

export type AgentToolName =
  | 'encompass-deal'
  | 'airdna'
  | 'fub-notes'
  | 'steadily'
  | 'stewart-fee';

export interface AgentDispatch {
  tool: AgentToolName;
  args: Record<string, unknown>;
  /** Human label shown in the chat tool-step indicator */
  label: string;
  detail?: string;
}

/* ---------- Intent classifier (deterministic regex first, LLM later) ---------- */

/**
 * Classify a user query. Returns a tool dispatch if the question is non-
 * guideline, or null to fall through to the normal RAG path.
 */
export function classifyIntent(query: string): AgentDispatch | null {
  const q = query.toLowerCase();

  /* Encompass deal lookup —
     "status of loan 12345", "pull deal Hernandez", "where is loan 700123" */
  const loanNumMatch = query.match(/\b(\d{6,12})\b/);
  if (
    /\b(status|pull|where is|find|lookup|look up|track)\b.*\b(loan|deal|file|pipeline)\b/.test(q) ||
    (/\bloan\s*(?:number\s*)?(?:#|no\.?|num\.?)?\s*\d{6,}/i.test(query)) ||
    (/\bdeal\b/.test(q) && loanNumMatch)
  ) {
    const lastNameMatch = query.match(/\b(?:for|of)\s+([A-Z][a-z]+)\b/);
    const args: Record<string, unknown> = {};
    if (loanNumMatch) args.loanNumber = loanNumMatch[1];
    if (lastNameMatch && !loanNumMatch) args.borrowerLastName = lastNameMatch[1];
    if (!args.loanNumber && !args.borrowerLastName) return null;
    return {
      tool: 'encompass-deal',
      args,
      label: 'Querying Encompass pipeline',
      detail: (args.loanNumber as string) || (args.borrowerLastName as string),
    };
  }

  /* AirDNA short-term rental estimate — "STR rent for 123 main st" */
  if (/\b(str|short[-\s]?term\s*rental|airdna|airbnb\s*rent|nightly\s*rate|adr)\b/.test(q)) {
    const addr = extractAddress(query);
    if (addr) {
      return {
        tool: 'airdna',
        args: { address: addr },
        label: 'Pulling AirDNA estimate',
        detail: addr,
      };
    }
  }

  /* Steadily landlord insurance quote — "insurance quote for [address]" */
  if (/\b(insurance|steadily|landlord\s*policy|rental\s*policy|hoi)\b/.test(q)) {
    const addr = extractAddress(query);
    return {
      tool: 'steadily',
      args: { address: addr || '', coverageType: 'landlord' },
      label: 'Requesting Steadily quote',
      detail: addr || 'no address',
    };
  }

  /* Stewart Title fee — "title fee for $400k loan in TX" */
  if (/\b(title\s*fee|stewart|escrow\s*fee|closing\s*cost\s*estimate)\b/.test(q)) {
    const amount = (query.match(/\$\s*([\d,]+(?:\.\d+)?[kKmM]?)/) || [])[1];
    const stateMatch = query.match(/\b(?:in|state)\s+([A-Z]{2})\b/);
    return {
      tool: 'stewart-fee',
      args: { loanAmount: amount || '', state: stateMatch?.[1] || '' },
      label: 'Pulling Stewart Title estimate',
      detail: amount || 'no amount',
    };
  }

  /* FUB notes — "notes for person 123" or "FUB notes [name]" */
  if (/\b(fub|follow\s*up\s*boss|crm)\b.*\b(note|notes|history|contact)\b/.test(q)) {
    const personId = (query.match(/\b(?:person|contact|id)\s*[#:]?\s*(\d+)\b/) || [])[1];
    return {
      tool: 'fub-notes',
      args: personId ? { personId } : {},
      label: 'Pulling Follow Up Boss notes',
      detail: personId || 'all',
    };
  }

  return null;
}

function extractAddress(query: string): string {
  // crude: capture everything after "for" / "at" up to end of sentence
  const m = query.match(/\b(?:for|at|@)\s+(.{6,80}?)(?:[?.!]|$)/i);
  return m ? m[1].trim() : '';
}

/* ---------- Dispatcher ---------- */

export interface AgentResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

import { getEncompassSession } from '../lib/encompassAuth';

export async function callTool(dispatch: AgentDispatch): Promise<AgentResult> {
  try {
    // For Encompass tools, include the user's access token from sessionStorage
    // so the lookup runs as the signed-in LO (not the static admin).
    const body: Record<string, unknown> = {
      tool: dispatch.tool,
      args: dispatch.args,
    };
    if (dispatch.tool === 'encompass-deal') {
      const session = getEncompassSession();
      if (session) body.accessToken = session.accessToken;
    }
    const res = await fetch('/api/agent/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as AgentResult;
    return json;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Network error calling agent',
    };
  }
}

/**
 * Render the agent result as a markdown context block to inject into the LLM
 * prompt under "AGENT TOOL CONTEXT".
 */
export function renderResultForPrompt(dispatch: AgentDispatch, result: AgentResult): string {
  if (!result.ok) {
    return `Tool ${dispatch.tool} failed: ${result.error}`;
  }
  return `Tool ${dispatch.tool} returned:\n${JSON.stringify(result.data, null, 2).slice(0, 3000)}`;
}
