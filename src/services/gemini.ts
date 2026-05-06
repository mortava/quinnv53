import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Message, GenerativeUIData, SourceRef } from "../types";
import { getRagContext } from "./ragService";
import { getActiveOverrides } from "../overlay";
import { findChunkBySection } from "../lib/knowledge_base";
import { classifyIntent, callTool, renderResultForPrompt } from "./agentRouter";

async function validateSourceRef(sourceRef: any): Promise<boolean> {
  if (!sourceRef || !sourceRef.docId || !sourceRef.sectionTitle) return false;
  const chunk = findChunkBySection(sourceRef.docId, sourceRef.sectionTitle);
  return !!chunk;
}

const systemInstruction = `
You are Quinn, the AI deal desk specialist at Total Quality Lending (TQL).

ABSOLUTE RULES (non-negotiable):
1. ONLY answer the exact question the user asked. Do not add adjacent topics, related programs, or "you might also want to know" content.
2. STAY 100% inside the provided KNOWLEDGE BASE CONTEXT. Never use outside knowledge or web facts.
3. If the answer is not in the KB context: say exactly "I don't see that in the guidelines — check with the AE." Stop there.
4. Do NOT mention Foreign National, ITIN, Smart Equity, Condotel, or any program type unless the user explicitly asks about it.
5. Do NOT output any of these symbols: asterisks (* or **), pound signs (#), dashes used as separators (-- or ---), pipes (|), or any other markdown punctuation. Write plain prose only.
6. Do NOT output JSON, code, function-call shapes, sourceRef, docId, or any metadata.

OUTPUT STYLE:
- Plain conversational English. Short sentences.
- One paragraph, then a short follow-up question. That is it.
- 60-120 words total.
- Numbers and limits stated inline as words: "80 percent LTV", "740 FICO", "12 months".
- Always include a single space between every word — never run words together.
- No tables. No bullets. No headings. No code fences. Plain sentences only.

EXAMPLE — User asks "Max LTV on a DSCR with non-arm's length?":
"Non-arm's length DSCR loans qualify up to 80 percent LTV when the transaction is between family members buying a primary residence or involves a gift of equity. Employer-to-employee transfers are not eligible. Required docs are 12 months of cancelled checks or a signed gift letter. Want me to check a specific scenario?"

If the question is unclear, ask one short clarifying question instead of guessing.
`;

// ─── Function Declarations ────────────────────────────────────────────────────

const sourceRefProperty = {
  type: Type.OBJECT,
  properties: {
    docId: { type: Type.STRING },
    sectionId: { type: Type.STRING },
    sectionTitle: { type: Type.STRING },
    content: { type: Type.STRING, description: "1-2 sentence snippet from the guideline source." },
  },
  required: ["docId", "sectionId", "sectionTitle"],
};

const renderAnswerFunction: FunctionDeclaration = {
  name: "renderAnswer",
  description: "Renders a structured guideline answer with headline, bullet sections, and a next step. Use for ALL factual guideline questions.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      headline: { type: Type.STRING, description: "One sentence (max 15 words) — the bottom line answer." },
      sections: {
        type: Type.ARRAY,
        description: "Sections with real content only. Max 3 bullets each. Labels: Key Details | Eligible | Not Eligible | Required Docs",
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            bullets: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Each bullet max 12 words." },
          },
          required: ["label", "bullets"],
        },
      },
      nextStep: { type: Type.STRING, description: "One short sentence — next action or clarifying question." },
      sourceRef: sourceRefProperty,
    },
    required: ["headline", "sections", "nextStep"],
  },
};

const renderChartFunction: FunctionDeclaration = {
  name: "renderChart",
  description: "Renders a bar, line, or pie chart from guideline data (LTV tiers, DSCR thresholds, rate comparisons).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      chartType: { type: Type.STRING, description: "bar | line | pie" },
      title: { type: Type.STRING },
      data: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } },
          required: ["name", "value"],
        },
      },
      sourceRef: sourceRefProperty,
    },
    required: ["chartType", "title", "data"],
  },
};

const renderCardFunction: FunctionDeclaration = {
  name: "renderCard",
  description: "Renders a guideline summary card with title, description, and key metrics. Use for any factual guideline answer.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      metrics: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { label: { type: Type.STRING }, value: { type: Type.STRING } },
          required: ["label", "value"],
        },
      },
      sourceRef: sourceRefProperty,
    },
    required: ["title", "description"],
  },
};

const renderDealFunction: FunctionDeclaration = {
  name: "renderDeal",
  description: "Renders a deal pipeline or list of loan deals.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      deals: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            clientName: { type: Type.STRING },
            value: { type: Type.NUMBER },
            stage: { type: Type.STRING },
            probability: { type: Type.NUMBER },
          },
          required: ["clientName", "value", "stage"],
        },
      },
      sourceRef: sourceRefProperty,
    },
    required: ["deals"],
  },
};

const renderEmailFunction: FunctionDeclaration = {
  name: "renderEmail",
  description: "Renders an email draft for broker or client communication.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      subject: { type: Type.STRING },
      body: { type: Type.STRING },
      to: { type: Type.STRING },
      sourceRef: sourceRefProperty,
    },
    required: ["subject", "body"],
  },
};

const renderLeaderboardFunction: FunctionDeclaration = {
  name: "renderLeaderboard",
  description: "Renders a performance leaderboard.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      entries: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { name: { type: Type.STRING }, score: { type: Type.NUMBER }, rank: { type: Type.NUMBER } },
          required: ["name", "score", "rank"],
        },
      },
      sourceRef: sourceRefProperty,
    },
    required: ["title", "entries"],
  },
};

const renderIdeasFunction: FunctionDeclaration = {
  name: "renderIdeas",
  description: "Renders a list of ideas or brainstorming results.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      ideas: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["title", "description"],
        },
      },
      sourceRef: sourceRefProperty,
    },
    required: ["title", "ideas"],
  },
};

const renderQuoteBuilderFunction: FunctionDeclaration = {
  name: "renderQuoteBuilder",
  description: "Renders a loan quote builder.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      clientName: { type: Type.STRING },
      propertyAddress: { type: Type.STRING },
      estimatedValue: { type: Type.NUMBER },
      loanAmount: { type: Type.NUMBER },
      interestRate: { type: Type.NUMBER },
      monthlyPayment: { type: Type.NUMBER },
      sourceRef: sourceRefProperty,
    },
    required: ["clientName", "propertyAddress", "estimatedValue", "loanAmount", "interestRate", "monthlyPayment"],
  },
};

const renderDocumentAnalysisFunction: FunctionDeclaration = {
  name: "renderDocumentAnalysis",
  description: "Renders analysis of an uploaded document.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      fileName: { type: Type.STRING },
      summary: { type: Type.STRING },
      keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
      insights: { type: Type.ARRAY, items: { type: Type.STRING } },
      documentType: { type: Type.STRING },
      confidenceScore: { type: Type.NUMBER },
    },
    required: ["fileName", "summary", "keyPoints", "documentType"],
  },
};

const renderPricingFunction: FunctionDeclaration = {
  name: "renderPricing",
  description: "Opens the TQL Pricing Engine for detailed loan pricing.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      message: { type: Type.STRING },
    },
  },
};

const ALL_FUNCTIONS: FunctionDeclaration[] = [
  renderAnswerFunction,
  renderChartFunction,
  renderCardFunction,
  renderDealFunction,
  renderEmailFunction,
  renderLeaderboardFunction,
  renderIdeasFunction,
  renderQuoteBuilderFunction,
  renderDocumentAnalysisFunction,
  renderPricingFunction,
];

// ─── Gemini→OpenAI schema converter (Type.OBJECT→"object" etc.) ──────────────

function toOpenAISchema(schema: any): any {
  if (!schema || typeof schema !== 'object') return schema;
  const out: any = Array.isArray(schema) ? [] : {};
  for (const [k, v] of Object.entries(schema)) {
    if (k === 'type' && typeof v === 'string') {
      out[k] = v.toLowerCase();
    } else if (typeof v === 'object' && v !== null) {
      out[k] = toOpenAISchema(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ─── Shared UI mapper ─────────────────────────────────────────────────────────

/**
 * Cerebras llama3.1-8b sometimes double-stringifies array/object fields in
 * tool-call arguments — e.g. it returns {"data": "[{\"name\":...}]"} instead
 * of {"data": [{"name":...}]}. The downstream UI then tries `data.map(...)`
 * and throws TypeError. This walks the args and parses any string that looks
 * like JSON, recursively, so the UI always sees real arrays/objects.
 */
function coerceJsonStrings(value: unknown): unknown {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      try {
        return coerceJsonStrings(JSON.parse(trimmed));
      } catch {
        return value;
      }
    }
    return value;
  }
  if (Array.isArray(value)) return value.map(coerceJsonStrings);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = coerceJsonStrings(v);
    }
    return out;
  }
  return value;
}

function mapToGenerativeUI(name: string, rawArgs: unknown, sourceRef?: SourceRef): GenerativeUIData | undefined {
  const args = coerceJsonStrings(rawArgs) as any;
  switch (name) {
    case 'renderAnswer':   return { type: 'answer', data: args, sourceRef };
    case 'renderChart':    return { type: 'chart', data: args, sourceRef };
    case 'renderCard':     return { type: 'card', data: args, sourceRef };
    case 'renderDeal':     return { type: 'deal', data: args, sourceRef };
    case 'renderEmail':    return { type: 'email', data: args, sourceRef };
    case 'renderLeaderboard': return { type: 'leaderboard', data: args, sourceRef };
    case 'renderIdeas':    return { type: 'ideas', data: args, sourceRef };
    case 'renderQuoteBuilder': return { type: 'quoteBuilder', data: args, sourceRef };
    case 'renderDocumentAnalysis': return { type: 'document', data: args };
    case 'renderPricing':  return { type: 'pricing', data: args };
    default:               return undefined;
  }
}

// ─── Text sanitizer — strips any leaked scaffold labels ───────────────────────

/**
 * Light-weight per-chunk cleaner. Strips markdown symbols inline but PRESERVES
 * leading/trailing whitespace inside each streamed chunk — Cerebras encodes
 * word boundaries as a leading space on the next token (e.g. " can"), and any
 * .trim() here would collapse that into "Youcan".
 *
 * Heavy run-on-word repair lives in finalizeText() and only runs once on the
 * accumulated reply (after the stream finishes) so it can match across the
 * full word.
 */
function sanitizeText(text: string): string {
  return text
    // Strip bold/italic asterisks (keep the word)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1$2')
    // Strip leading heading hashes (markdown #)
    .replace(/^#{1,4}\s+/gm, '')
    // Strip raw markdown table delimiters and the alignment row
    .replace(/^\s*\|?\s*:?-{2,}\s*\|.*$/gm, '')
    .replace(/\|/g, ' ')
    // Strip stray standalone hashes
    .replace(/(^|\s)#{1,4}(\s|$)/g, '$1$2');
  // NO .trim() — would erase the leading space Cerebras uses to separate tokens.
}

/**
 * Final cleanup applied once to the full assistant reply after the stream
 * completes. Safe to do dictionary repair + cross-word regex here.
 */
export function finalizeText(text: string): string {
  return text
    // Legacy scaffold labels (kept from earlier system prompt)
    .replace(/✅\s*\*\*What Works:\*\*\s*/g, '')
    .replace(/❌\s*\*\*Watch Out:\*\*\s*/g, '')
    .replace(/\*\*→\s*Next:\*\*\s*/g, '')
    .replace(/\*Source:[^*\n]*\*/g, '')
    .replace(/Source:\s*\[[^\]]*\][^\n]*/g, '')
    // Repair common run-on words observed in Cerebras output
    .replace(/\bborrowercontribution\b/gi, 'borrower contribution')
    .replace(/\brefiallowed\b/gi, 'refi allowed')
    .replace(/\bloanupto\b/gi, 'loan up to')
    .replace(/\bDSCRloan\b/gi, 'DSCR loan')
    .replace(/\bMaxLTV\b/g, 'Max LTV')
    .replace(/\bRequiredDocs\b/g, 'Required Docs')
    .replace(/\bFora\b/g, 'For a')
    .replace(/\btorun\b/g, 'to run')
    .replace(/\btocheck\b/g, 'to check')
    .replace(/\bisabove\b/g, 'is above')
    .replace(/\bisabovethe\b/g, 'is above the')
    .replace(/\bWantme\b/g, 'Want me')
    .replace(/\btheDSCR\b/g, 'the DSCR')
    .replace(/\btheLTV\b/g, 'the LTV')
    .replace(/\btheFICO\b/g, 'the FICO')
    .replace(/\bYoucan\b/g, 'You can')
    .replace(/\bthereis\b/g, 'there is')
    .replace(/\bforPurchase\b/g, 'for Purchase')
    .replace(/\bforRate\b/g, 'for Rate')
    .replace(/\bforCash\b/g, 'for Cash')
    // Cross-word streaming-merge patterns
    // (a) lowercase → uppercase-followed-by-lowercase (camelCase: "LTVMatrix" → "LTV Matrix")
    .replace(/([a-z])([A-Z][a-z]{2,})/g, '$1 $2')
    // (b) lowercase → 2+ uppercase (acronym: "scoreLTV" → "score LTV")
    .replace(/([a-z])([A-Z]{2,})/g, '$1 $2')
    // (c) lowercase → digit (e.g. "at80%" → "at 80%")
    .replace(/([a-z])(\d)/g, '$1 $2')
    // (d) digit → 2+ uppercase (acronym: "740FICO" → "740 FICO")
    .replace(/(\d)([A-Z]{2,})/g, '$1 $2')
    // (e) digit → 3+ lowercase (e.g. "70percent" → "70 percent")
    .replace(/(\d)([a-z]{3,})/g, '$1 $2')
    // (f) lowercase → $ (e.g. "to$2.5M" → "to $2.5M")
    .replace(/([a-z])\$/g, '$1 $')
    // Collapse 3+ newlines, trim final whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Model config ─────────────────────────────────────────────────────────────

const CHAT_MODEL = (process.env.VITE_GEMINI_CHAT_MODEL as string) || 'gemini-2.0-flash';
const CEREBRAS_MODEL = (process.env.VITE_CEREBRAS_MODEL as string) || 'llama3.1-8b';
const OPENROUTER_MODEL = (process.env.VITE_OPENROUTER_MODEL as string) || 'google/gemma-3-27b-it:free';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const CEREBRAS_URL = 'https://api.cerebras.ai/v1/chat/completions';

function is429(err: any): boolean {
  return (
    err?.status === 429 ||
    String(err).includes('RESOURCE_EXHAUSTED') ||
    String(err).includes('quota') ||
    String(err).includes('QUOTA_EXCEEDED') ||
    String(err).includes('rate_limit')
  );
}

// ─── Cerebras streaming path (primary) ──────────────────────────────────────

async function* runCerebrasStream(
  messages: Message[],
  ragContext: string,
  overlayContext: string,
  query: string
): AsyncGenerator<{ text: string; generativeUI?: GenerativeUIData }> {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) throw new Error('CEREBRAS_API_KEY not configured');

  const chatMessages = [
    { role: 'system', content: systemInstruction },
    ...messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
    {
      role: 'user',
      content: [
        overlayContext,
        `KNOWLEDGE BASE CONTEXT:\n${ragContext}`,
        `USER QUERY: ${query}`,
      ].filter(Boolean).join('\n\n'),
    },
  ];

  // Cerebras llama3.1-8b is too small to reliably do OpenAI function calling —
  // it emits malformed JSON tool-call shapes inside the text channel instead of
  // delta.tool_calls. The model writes great markdown though, so we drop the
  // tools schema and rely on the qp-prose markdown renderer (tables, lists,
  // headings, code blocks) for visual responses.
  const requestBody = JSON.stringify({
    model: CEREBRAS_MODEL,
    messages: chatMessages,
    stream: true,
    max_tokens: 1500,
  });

  // Auto-retry once on 429 with backoff. Surface real upstream error otherwise.
  let res: Response | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    res = await fetch(CEREBRAS_URL, {
      method: 'POST',
      signal: AbortSignal.timeout(25000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });
    if (res.ok) break;
    if (res.status === 429 && attempt === 0) {
      // Honor Retry-After if present, else 3s
      const ra = Number(res.headers.get('retry-after') || '3');
      await new Promise((r) => setTimeout(r, Math.min(8000, Math.max(1000, ra * 1000))));
      continue;
    }
    break;
  }
  if (!res || !res.ok) {
    const status = res?.status ?? 0;
    const body = res ? await res.text() : 'no response';
    // Strip JSON wrapping so the user sees a useful message
    let detail = body;
    try {
      const j = JSON.parse(body) as { error?: { message?: string } | string };
      const m = typeof j.error === 'string' ? j.error : j.error?.message;
      if (m) detail = m;
    } catch {
      // body wasn't JSON; use raw text
    }
    throw new Error(`Cerebras ${status}: ${detail.slice(0, 240)}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  const pendingCalls: Record<number, { name: string; arguments: string }> = {};

  outer: while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') break outer;

      let parsed: any;
      try { parsed = JSON.parse(raw); } catch { continue; }

      const delta = parsed?.choices?.[0]?.delta;
      if (!delta) continue;

      if (delta.content) yield { text: delta.content };

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx: number = tc.index ?? 0;
          if (!pendingCalls[idx]) pendingCalls[idx] = { name: '', arguments: '' };
          if (tc.function?.name) pendingCalls[idx].name += tc.function.name;
          if (tc.function?.arguments) pendingCalls[idx].arguments += tc.function.arguments;
        }
      }
    }
  }

  for (const tc of Object.values(pendingCalls)) {
    if (!tc.name) continue;
    try {
      const args = JSON.parse(tc.arguments);
      const sourceRef = args.sourceRef as SourceRef | undefined;
      delete args.sourceRef;
      const ui = mapToGenerativeUI(tc.name, args, sourceRef);
      if (ui) yield { text: '', generativeUI: ui };
    } catch {
      // malformed JSON — skip
    }
  }
}

// ─── OpenRouter streaming path (text fallback when Cerebras fails) ────────────

async function* runOpenRouterStream(
  messages: Message[],
  ragContext: string,
  overlayContext: string,
  query: string
): AsyncGenerator<{ text: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

  const chatMessages = [
    { role: 'system', content: systemInstruction },
    ...messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
    {
      role: 'user',
      content: [
        overlayContext,
        ragContext ? `KNOWLEDGE BASE CONTEXT:\n${ragContext}` : '',
        `USER QUERY: ${query}`,
      ]
        .filter(Boolean)
        .join('\n\n'),
    },
  ];

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    signal: AbortSignal.timeout(30000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      // OpenRouter wants these for free-tier rate-limit attribution
      'HTTP-Referer': 'https://quinnv5.tqltpo.com',
      'X-Title': 'Quinn AI Deal Desk',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: chatMessages,
      stream: true,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 200)}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  outer: while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') break outer;
      try {
        const parsed = JSON.parse(raw);
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (typeof delta === 'string' && delta.length > 0) yield { text: delta };
      } catch {
        // ignore malformed SSE chunks
      }
    }
  }
}

// ─── Gemini streaming path (fallback) ────────────────────────────────────────

// ─── OpenAI vision path (primary for document processing) ────────────────────

const OPENAI_VISION_MODEL =
  (process.env.VITE_OPENAI_VISION_MODEL as string) || 'gpt-4o-mini';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

async function* runOpenAIDocStream(
  messages: Message[],
  ragContext: string,
  overlayContext: string,
  query: string,
  fileData: { mimeType: string; data: string }
): AsyncGenerator<{ text: string; generativeUI?: GenerativeUIData }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const isImage = fileData.mimeType.startsWith('image/');
  const dataUrl = `data:${fileData.mimeType};base64,${fileData.data}`;

  // Compose the final user turn with text + image (image_url part).
  // PDF and other non-image MIME types fall back to a text-only note since
  // OpenAI chat completions only accept image_url here; PDF→image conversion
  // can be layered in later if needed.
  const userParts: Array<Record<string, unknown>> = [
    {
      type: 'text',
      text: [
        overlayContext,
        ragContext ? `KNOWLEDGE BASE CONTEXT:\n${ragContext}` : '',
        `USER QUERY: ${query}`,
        isImage ? '' : `(Attached file mime-type: ${fileData.mimeType} — text content only.)`,
      ]
        .filter(Boolean)
        .join('\n\n'),
    },
  ];
  if (isImage) {
    userParts.push({
      type: 'image_url',
      image_url: { url: dataUrl, detail: 'auto' },
    });
  }

  const chatMessages = [
    { role: 'system', content: systemInstruction },
    ...messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userParts },
  ];

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    signal: AbortSignal.timeout(45000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_VISION_MODEL,
      messages: chatMessages,
      stream: true,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI ${res.status}: ${body.slice(0, 200)}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') return;
      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (typeof delta === 'string' && delta.length > 0) {
          yield { text: delta };
        }
      } catch {
        // ignore malformed SSE chunks
      }
    }
  }
}

// ─── Gemini multimodal path (kept available, used by direct call sites) ──────

async function* runGeminiStream(
  contents: any[],
  query: string,
  fileData?: { mimeType: string; data: string }
): AsyncGenerator<{ text: string; generativeUI?: GenerativeUIData }> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  if (fileData) {
    const last = contents[contents.length - 1];
    last.parts.push({ inlineData: { mimeType: fileData.mimeType, data: fileData.data } });
  }

  const useMaps =
    query.toLowerCase().includes("nearby") ||
    query.toLowerCase().includes("location") ||
    query.toLowerCase().includes("map");

  const stream = await ai.models.generateContentStream({
    model: CHAT_MODEL,
    contents,
    config: {
      systemInstruction,
      tools: [
        { functionDeclarations: ALL_FUNCTIONS },
        useMaps ? { googleMaps: {} } : { googleSearch: {} },
      ],
      toolConfig: { includeServerSideToolInvocations: true },
    },
  });

  for await (const chunk of stream) {
    if (chunk.text) yield { text: chunk.text };

    if (chunk.functionCalls && chunk.functionCalls.length > 0) {
      const call = chunk.functionCalls[0];
      const args = { ...call.args } as any;
      const sourceRef = args.sourceRef as SourceRef | undefined;
      delete args.sourceRef;
      const ui = mapToGenerativeUI(call.name!, args, sourceRef);
      if (ui) yield { text: "", generativeUI: ui };
    }
  }
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function* generateContentStream(
  messages: Message[],
  fileData?: { mimeType: string; data: string }
): AsyncGenerator<{ text: string; generativeUI?: GenerativeUIData } | { text: string }> {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const query = lastUserMessage?.content || "";

  // Agentic step: classify intent. If the question is a non-guideline data
  // fetch (Encompass deal, AirDNA, FUB, etc.), call the matching server tool
  // first and inject the result into the prompt context. Guideline lookups
  // skip this and go straight to the RAG path.
  let agentContext = '';
  const dispatch = classifyIntent(query);
  if (dispatch && !fileData) {
    try {
      const result = await callTool(dispatch);
      agentContext = `AGENT TOOL CONTEXT (${dispatch.tool}):\n${renderResultForPrompt(dispatch, result)}`;
    } catch {
      // never block the chat on tool failures
    }
  }

  const ragContext = await getRagContext(query);
  const overrides = getActiveOverrides();
  const overlayContext = overrides.length > 0
    ? `OVERLAY GUIDELINES (FINAL SOURCE OF TRUTH):\n${JSON.stringify(overrides, null, 2)}\n\n${agentContext}`
    : agentContext;

  // Document analysis: route to OpenAI vision (gpt-4o-mini) by default.
  // runGeminiStream is kept available in this module for direct use as an
  // alternate path or future fallback.
  if (fileData) {
    try {
      for await (const chunk of runOpenAIDocStream(messages, ragContext, overlayContext, query, fileData)) {
        if ('text' in chunk && chunk.text) yield { text: sanitizeText(chunk.text) };
        else yield chunk;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Document analysis failed: ${msg.slice(0, 120)}`);
    }
    return;
  }

  // All text queries → Cerebras primary (llama3.1-8b, ~2000 tok/s)
  // → OpenRouter fallback (Gemma-3-27B free) when Cerebras errors out
  let cerebrasError: string | null = null;
  try {
    const cerebrasStream = runCerebrasStream(messages, ragContext, overlayContext, query);
    for await (const chunk of cerebrasStream) {
      if ('text' in chunk && chunk.text) {
        yield { text: sanitizeText(chunk.text) };
      } else {
        yield chunk;
      }
    }
    return;
  } catch (err: unknown) {
    cerebrasError = err instanceof Error ? err.message : String(err);
  }

  // Fallback: OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const orStream = runOpenRouterStream(messages, ragContext, overlayContext, query);
      for await (const chunk of orStream) {
        yield { text: sanitizeText(chunk.text) };
      }
      return;
    } catch (err: unknown) {
      const orMsg = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Quinn primary + fallback both failed. Primary: ${cerebrasError?.slice(0, 120)}; OpenRouter: ${orMsg.slice(0, 120)}`,
      );
    }
  }

  // No fallback configured — surface the original error.
  if (cerebrasError) {
    if (cerebrasError.includes('AbortError') || cerebrasError.includes('timeout')) {
      throw new Error('Request timed out — try again.');
    }
    throw new Error(cerebrasError.slice(0, 240));
  }
}
