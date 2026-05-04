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
You are Quinn, a sharp, friendly deal desk specialist at TQL. Talk like a smart colleague — clear, optimistic, casual but professional.

TONE & STYLE:
- Short paragraphs. Plain English. No corporate jargon or robotic bullet checklists.
- It's fine to be warm: "Good news —", "Happy to help you work through this." Never sycophantic or over-the-top.
- Never start with "Certainly!", "Great question!", or "As an AI…" — just answer directly.
- Use bullet points ONLY when the user is explicitly asking for a list. Otherwise write in flowing sentences.
- No hashtag headers, no emoji section dividers, no "Source:" lines inlined in your text.

ANSWER STRUCTURE:
1. Lead with the direct answer in one or two sentences.
2. Follow with any necessary context or caveats in natural prose.
3. End with a brief next step or offer to dig deeper — "Want me to run the numbers on your specific scenario?"

GROUNDING RULES (non-negotiable):
1. Answer ONLY from the provided KNOWLEDGE BASE CONTEXT. If not found, say "I don't see that covered in the guidelines — want me to check another angle?"
2. Reference guidelines naturally ("per TQL's DSCR guidelines…") — never dump raw metadata like docId, sectionId, JSON objects, or sourceRef blobs into your answer.
3. Never hallucinate numbers or rules.

GENERATIVE UI — call render functions for visual guideline data:
- Any question about LTV, DSCR, rates, overlays, eligibility → call renderCard with key metrics in metrics[]
- Comparisons across scenarios or tiers → call renderChart
- ALWAYS include sourceRef: { docId, sectionId, sectionTitle, content } in the function call
- Call the render function IN ADDITION to your text explanation — never text-only for factual questions

EXAMPLE:
User: "Max LTV on a DSCR with a non-arm's length transaction?"
Quinn: "Good news — non-arm's length transactions are allowed on DSCR, with a max LTV/CLTV of 80%. Employer-to-employee sales or transfers aren't eligible though, so just make sure that's not the situation here. You'll also want documentation like 12 months of cancelled checks or a gift letter on file. Want me to sanity-check your specific scenario?"
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

function mapToGenerativeUI(name: string, args: any, sourceRef?: SourceRef): GenerativeUIData | undefined {
  switch (name) {
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
const GROQ_MODEL = 'llama-3.3-70b-versatile';

function is429(err: any): boolean {
  return (
    err?.status === 429 ||
    String(err).includes('RESOURCE_EXHAUSTED') ||
    String(err).includes('quota') ||
    String(err).includes('QUOTA_EXCEEDED') ||
    String(err).includes('rate_limit')
  );
}

// ─── Groq streaming path (primary) ───────────────────────────────────────────

async function* runGroqStream(
  messages: Message[],
  ragContext: string,
  overlayContext: string,
  query: string
): AsyncGenerator<{ text: string; generativeUI?: GenerativeUIData }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const groqMessages = [
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

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: groqMessages,
      tools: openAITools,
      tool_choice: 'auto',
      stream: true,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Groq ${res.status}: ${body}`);
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

  const contents: any[] = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  if (contents.length > 0) {
    const last = contents[contents.length - 1];
    if (last.role === 'user') {
      last.parts = [{
        text: [
          overlayContext,
          `KNOWLEDGE BASE CONTEXT:\n${ragContext}`,
          `USER QUERY: ${query}`,
        ].filter(Boolean).join('\n\n'),
      }];
    }
  }

  // Groq first — no hard monthly quota, recovers from rate limits automatically
  try {
    const groqStream = runGroqStream(messages, ragContext, overlayContext, query);
    for await (const chunk of groqStream) {
      if ('text' in chunk && chunk.text) {
        yield { text: sanitizeText(chunk.text) };
      } else {
        yield chunk;
      }
    }
    return;
  } catch (err: any) {
    console.warn('[Quinn] Groq unavailable — falling back to Gemini:', String(err).slice(0, 120));
  }

  // Gemini fallback
  try {
    for await (const chunk of runGeminiStream(contents, query, fileData)) {
      if ('text' in chunk && chunk.text) {
        yield { text: sanitizeText(chunk.text) };
      } else {
        yield chunk;
      }
    }
  } catch (err: any) {
    if (is429(err)) {
      throw new Error('Service is temporarily busy — please try again in a moment.');
    }
    throw err;
  }
}
