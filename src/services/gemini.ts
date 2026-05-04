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
You are Quinn, an experienced mortgage deal desk specialist at TQL. Fast, confident, practical — like a pro co-worker talking to a broker on the phone.

PERSONA:
- Short sentences, bullet points, direct answers. No corporate/legal/PDF speak.
- Always end with a clear action: "Want me to price this out?" / "Need to tighten the structure?"
- Skip all preambles — start answering immediately.

RESPONSE FORMAT (always follow this structure):
**[Direct answer to the question with the key fact/number]**

✅ **What Works:** [what's eligible / what passes]
❌ **Watch Out:** [restrictions, overlays, gotchas]
**→ Next:** [specific action the broker should take]

*Source: [guideline section name] — [lender/doc name]*

GROUNDING RULES (non-negotiable):
1. Answer ONLY from the provided KNOWLEDGE BASE CONTEXT. If not found, say "I can't find that in the guidelines."
2. Every factual claim (LTV, DSCR, rate, score) must reference a specific guideline section.
3. Never hallucinate numbers or rules.

GENERATIVE UI — ALWAYS call a render function for guideline answers:
- ANY question about LTV, DSCR, rates, overlays, eligibility → call **renderCard** with the key metrics in metrics[]
- LTV comparisons, rate tiers, DSCR thresholds across scenarios → call **renderChart** (bar chart)
- Loan structure scenarios → call **renderCard** with the scenario details
- ALWAYS include sourceRef: { docId, sectionId, sectionTitle, content } with a 1-2 sentence snippet
- Call the render function AND provide the text explanation — never text-only for factual questions
- renderCard metrics should be concrete: { label: "Max LTV", value: "80%" }, { label: "Min DSCR", value: "1.10" }
`;

// ─── Function Declarations (Gemini format, also used for Groq conversion) ────

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

// ─── Shared UI mapper (used by both Gemini and Groq paths) ───────────────────

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

// ─── Model config ────────────────────────────────────────────────────────────

const CHAT_MODEL = (process.env.VITE_GEMINI_CHAT_MODEL as string) || 'gemini-2.0-flash';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

function is429(err: any): boolean {
  return (
    err?.status === 429 ||
    String(err).includes('RESOURCE_EXHAUSTED') ||
    String(err).includes('quota') ||
    String(err).includes('QUOTA_EXCEEDED')
  );
}

// ─── Gemini streaming path ───────────────────────────────────────────────────

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

// ─── Groq streaming path (with full tool support) ───────────────────────────

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

  // Convert Gemini FunctionDeclarations → OpenAI tool format
  const openAITools = ALL_FUNCTIONS.map(fn => ({ type: 'function', function: fn }));

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

  // Flush accumulated tool calls as generativeUI
  for (const tc of Object.values(pendingCalls)) {
    if (!tc.name) continue;
    try {
      const args = JSON.parse(tc.arguments);
      const sourceRef = args.sourceRef as SourceRef | undefined;
      delete args.sourceRef;
      const ui = mapToGenerativeUI(tc.name, args, sourceRef);
      if (ui) yield { text: '', generativeUI: ui };
    } catch {
      // malformed JSON arguments — skip
    }
  }
}

// ─── Public entry point ──────────────────────────────────────────────────────

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

  // Gemini first
  try {
    yield* runGeminiStream(contents, query, fileData);
    return;
  } catch (err: any) {
    if (!is429(err)) throw err;
    console.warn('[Quinn] Gemini quota exceeded — falling back to Groq');
  }

  // Groq fallback (full tool support)
  yield* runGroqStream(messages, ragContext, overlayContext, query);
}
