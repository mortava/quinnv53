import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Message, GenerativeUIData, SourceRef } from "../types";
import { getRagContext } from "./ragService";
import { getActiveOverrides } from "../overlay";
import { findChunkBySection } from "../lib/knowledge_base";

async function validateSourceRef(sourceRef: any): Promise<boolean> {
  if (!sourceRef || !sourceRef.docId || !sourceRef.sectionTitle) return false;
  const chunk = findChunkBySection(sourceRef.docId, sourceRef.sectionTitle);
  return !!chunk;
}

const systemInstruction = `
You are Quinn, a sharp, friendly deal desk specialist at TQL. Clear, optimistic, casual — like a smart teammate on the deal desk.

TONE:
- Plain English. No filler ("It's important to note that…"), no hedging, no AI disclaimers.
- Numbers and limits should be bolded inline (e.g., **80% LTV**, **12 months**).
- Never start with "Certainly!", "Great question!", or "As an AI…"
- Never include sourceRef, docId, sectionId, JSON objects, or raw metadata in your text.

RESPONSE STRUCTURE — for ALL factual guideline questions:
Call renderAnswer with:
  headline: One sentence (max 15 words) — the bottom line.
  sections: Only sections with real content, max 3 bullets each, each bullet max 12 words.
    Use these labels: "Key Details" | "Eligible" | "Not Eligible" | "Required Docs"
    Skip any section with no real content.
  nextStep: One short sentence offering a next action or clarifying question.
  sourceRef: Always include { docId, sectionId, sectionTitle, content }.

When calling renderAnswer, do NOT also write the same content as text — the card IS the answer.
For visual comparisons (rate tiers, LTV matrices across scenarios) ALSO call renderChart.

GROUNDING RULES (non-negotiable):
1. Answer ONLY from the provided KNOWLEDGE BASE CONTEXT.
2. Never hallucinate numbers or rules.
3. If not found: say so plainly — "I don't see that in the guidelines."

EXAMPLE:
User: "Max LTV on a DSCR with a non-arm's length transaction?"
→ Call renderAnswer:
  headline: "Non-arm's length DSCR loans are allowed up to **80% LTV**."
  sections: [
    { label: "Key Details", bullets: ["Max LTV/CLTV is **80%**", "Applies to all non-arm's length scenarios"] },
    { label: "Eligible", bullets: ["Family-member purchases (primary residence)", "Gift of equity on primary"] },
    { label: "Not Eligible", bullets: ["Employer-to-employee sales or transfers"] },
    { label: "Required Docs", bullets: ["**12 months** cancelled checks or gift letter", "12-month mortgage history if gift of equity"] }
  ]
  nextStep: "Want me to sanity-check your specific scenario?"
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

function sanitizeText(text: string): string {
  return text
    .replace(/✅\s*\*\*What Works:\*\*\s*/g, '')
    .replace(/❌\s*\*\*Watch Out:\*\*\s*/g, '')
    .replace(/\*\*→\s*Next:\*\*\s*/g, '')
    .replace(/\*Source:[^*\n]*\*/g, '')
    .replace(/Source:\s*\[[^\]]*\][^\n]*/g, '')
    .replace(/#{1,3}\s*(What Works|Watch Out|Next Step|Next|WhatWorks|WhatDoesnt|WhatToDoNext):?\s*/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Model config ─────────────────────────────────────────────────────────────

const CHAT_MODEL = (process.env.VITE_GEMINI_CHAT_MODEL as string) || 'gemini-2.0-flash';
const CEREBRAS_MODEL = (process.env.VITE_CEREBRAS_MODEL as string) || 'llama3.1-8b';
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

  const openAITools = ALL_FUNCTIONS.map(fn => ({
    type: 'function',
    function: {
      name: fn.name,
      description: fn.description,
      parameters: toOpenAISchema(fn.parameters),
    },
  }));

  const requestBody = JSON.stringify({
    model: CEREBRAS_MODEL,
    messages: chatMessages,
    tools: openAITools,
    tool_choice: 'auto',
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

  const ragContext = await getRagContext(query);
  const overrides = getActiveOverrides();
  const overlayContext = overrides.length > 0
    ? `OVERLAY GUIDELINES (FINAL SOURCE OF TRUTH):\n${JSON.stringify(overrides, null, 2)}`
    : "";

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

  // All text queries → Cerebras (llama3.1-8b, ~2000 tok/s)
  try {
    const cerebrasStream = runCerebrasStream(messages, ragContext, overlayContext, query);
    for await (const chunk of cerebrasStream) {
      if ('text' in chunk && chunk.text) {
        yield { text: sanitizeText(chunk.text) };
      } else {
        yield chunk;
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('AbortError') || msg.includes('timeout')) {
      throw new Error('Request timed out — try again.');
    }
    // Surface the actual upstream message — prior code masked everything as
    // "Rate limit hit" which was misleading when the real cause was different.
    throw new Error(msg.slice(0, 240));
  }
}
