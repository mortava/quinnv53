/**
 * Direct Context Injection Service
 *
 * Replaces the embedding-based RAG with a deterministic keyword router that
 * injects the full relevant TQL guideline document into the LLM context per
 * query. No Gemini Embed API calls, no JSON cache, no stale-vector problem.
 *
 * Used by services/gemini.ts via `getRagContext(query)`.
 */

import {
  dscrInvestorSolutions,
  fullAltDocMatrix,
  tqlSmartEquity2ndLien,
  foreignNationalDscr,
  tqlFullUWGuidelines,
} from "../lib/knowledge_base";
import type { KnowledgeDocument } from "../lib/knowledge_types";

/**
 * Max chars of guideline text we'll inject per query.
 * Smaller context = faster time-to-first-token. Cerebras processes prompts
 * at ~2000 tok/s on llama3.1-8b, so 8k chars (~2k tokens) of guideline +
 * ~1k of system+history = ~3k input tokens = ~1.5 s prompt processing time
 * before the model starts streaming (vs ~4.5 s at the old 18k cap).
 */
const MAX_CONTEXT_CHARS = 8_000;

interface DocRoute {
  /** Document to load when this rule matches. */
  doc: KnowledgeDocument;
  /** Regex tested against the lowercased query. */
  match: RegExp;
}

/** Ordered routing rules — first match wins. */
const ROUTES: DocRoute[] = [
  {
    doc: foreignNationalDscr,
    match: /foreign\s*national|non[-\s]?resident|itin|no[-\s]?ssn|visa\s*holder/,
  },
  {
    doc: tqlSmartEquity2ndLien,
    match: /smart\s*equity|2nd\s*lien|second\s*lien|heloan|helo[ac]n|closed[-\s]end\s*second/,
  },
  {
    doc: fullAltDocMatrix,
    match:
      /alt[-\s]?doc|bank\s*statement|p&?l\s*only|1099|wvoe|asset\s*(?:depletion|utilization)|prime\s*time|full\s*doc/,
  },
  {
    doc: dscrInvestorSolutions,
    match:
      /dscr|debt[-\s]service|rental|investment\s*property|investor\s*solutions|short[-\s]term\s*rental|str|long[-\s]term\s*rental|ltr|airbnb/,
  },
  {
    doc: tqlFullUWGuidelines,
    match:
      /condotel|non[-\s]?warrantable|2nd\s*home|second\s*home|underwriting|guideline|ltv|fico|reserve|matrix|condo|multi[-\s]?unit|self[-\s]?employed|term\s*sheet|quote|prequal|qualif|eligib/,
  },
];

/** Fallback doc when nothing matches — the master UW guideline covers most asks. */
const DEFAULT_DOC: KnowledgeDocument = tqlFullUWGuidelines;

/** Pick the doc whose route matches first; fall back to the master UW guide. */
function routeQuery(query: string): KnowledgeDocument {
  const q = query.toLowerCase();
  for (const route of ROUTES) {
    if (route.match.test(q)) return route.doc;
  }
  return DEFAULT_DOC;
}

/**
 * Render a document's chunks as a flat text block, capped at MAX_CONTEXT_CHARS.
 * Truncates at chunk boundaries so we never inject a half-sentence.
 */
function renderDoc(doc: KnowledgeDocument): string {
  const header = `# ${doc.metadata.title}\n` +
    `Program: ${doc.metadata.program || doc.metadata.productLine}\n` +
    `Lender: ${doc.metadata.lender}\n` +
    `Version: ${doc.metadata.version}\n\n`;

  const parts: string[] = [header];
  let used = header.length;

  for (const chunk of doc.chunks) {
    const block =
      `## ${chunk.section}\n[Source: ${chunk.sourceDocId}, Section: ${chunk.section}]\n${chunk.content}\n\n`;
    if (used + block.length > MAX_CONTEXT_CHARS) break;
    parts.push(block);
    used += block.length;
  }
  return parts.join("");
}

/**
 * Returns the full relevant guideline document as a single text block ready
 * to drop into the LLM system or user message.
 *
 * Always returns a string (never throws) — gemini.ts can prepend it to the
 * user query verbatim.
 */
export async function getRagContext(query: string): Promise<string> {
  const doc = routeQuery(query);
  return renderDoc(doc);
}
