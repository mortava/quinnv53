import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse, ThinkingLevel } from "@google/genai";
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
You are Quinn, an experienced mortgage deal desk specialist at TQL. You're fast, confident, practical, and casual—like a pro co-worker talking to a broker on the phone.

PERSONA GUIDELINES:
- Keep responses clear, casual, and direct. Avoid corporate/legal/PDF speak ("it should be noted", "outlined below").
- Use short sentences and bullet points.
- Always highlight: #WhatWorks, #WhatDoesnt, #WhatToDoNext (practical actions).
- NEVER end cold. Always keep the user moving with a Call to Action (e.g., "Want me to price this out?", "Need to tighten this structure?").
- Mix up your tone based on the user. Don't be a robot.

STRICT GROUNDING & CITATION RULES (Do NOT break these):
1. **Knowledge Base Only**: Answer ONLY using provided KNOWLEDGE BASE CONTEXT. If not in context, say "I can't find that in the guidelines." Do NOT hallucinate.
2. **Citation Requirement**: For every factual claim (LTV, pricing, rules), you MUST cite one specific guideline section.
3. **Generative UI**:
   - Render UI components ONLY when relevant. Fast and clean.
   - Include \`sourceRef\`: \`{ docId, sectionId, sectionTitle, content }\` for every visual.
   - Content snippet: Keep it 1-2 sentences for highlighting.

CRITICAL: Skip preambles. Dive straight into answering the question.
`;

const sourceRefProperty = {
  type: Type.OBJECT,
  properties: {
    docId: { type: Type.STRING },
    sectionId: { type: Type.STRING },
    sectionTitle: { type: Type.STRING },
    content: { type: Type.STRING, description: "Short snippet from the source for highlighting." },
  },
  required: ["docId", "sectionId", "sectionTitle"],
};

const renderChartFunction: FunctionDeclaration = {
  name: "renderChart",
  description: "Renders a chart (bar, line, or pie) based on the provided data.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      chartType: { type: Type.STRING },
      title: { type: Type.STRING },
      data: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            value: { type: Type.NUMBER },
          },
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
  description: "Renders a display card with a title, description, and optional metrics.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      metrics: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            value: { type: Type.STRING },
          },
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
  description: "Renders a deal pipeline or a list of deals.",
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
  description: "Renders an email draft.",
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
  description: "Renders a leaderboard.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      entries: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            score: { type: Type.NUMBER },
            rank: { type: Type.NUMBER },
          },
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
  description: "Renders a list of fresh ideas or brainstorming results.",
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
  description: "Renders a dynamic quote builder with real-time data from search and maps.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      clientName: { type: Type.STRING },
      propertyAddress: { type: Type.STRING },
      estimatedValue: { type: Type.NUMBER },
      loanAmount: { type: Type.NUMBER },
      interestRate: { type: Type.NUMBER },
      monthlyPayment: { type: Type.NUMBER },
      marketData: {
        type: Type.OBJECT,
        properties: {
          areaAveragePrice: { type: Type.NUMBER },
          nearbySchools: { type: Type.ARRAY, items: { type: Type.STRING } },
          localAmenities: { type: Type.ARRAY, items: { type: Type.STRING } },
          marketTrend: { type: Type.STRING, description: "e.g., 'Rising', 'Stable', 'Falling'" },
        },
      },
      sourceRef: sourceRefProperty,
    },
    required: ["clientName", "propertyAddress", "estimatedValue", "loanAmount", "interestRate", "monthlyPayment"],
  },
};

const renderImageFunction: FunctionDeclaration = {
  name: "renderImage",
  description: "Generates and renders a high-quality image based on a prompt.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: { type: Type.STRING, description: "A detailed prompt for the image generation." },
      title: { type: Type.STRING, description: "A title for the image card." },
      aspectRatio: { type: Type.STRING, enum: ["1:1", "16:9", "9:16"], description: "The aspect ratio of the image." },
      size: { type: Type.STRING, enum: ["1K", "2K", "4K"], description: "The resolution of the image." },
    },
    required: ["prompt", "title"],
  },
};

const renderDocumentAnalysisFunction: FunctionDeclaration = {
  name: "renderDocumentAnalysis",
  description: "Renders an analysis of an uploaded document, including summary, key points, and insights.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      fileName: { type: Type.STRING },
      summary: { type: Type.STRING },
      keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
      insights: { type: Type.ARRAY, items: { type: Type.STRING } },
      documentType: { type: Type.STRING, description: "e.g., 'Loan Application', 'Appraisal Report', 'Bank Statement'" },
      confidenceScore: { type: Type.NUMBER, description: "AI confidence in the analysis (0-100)" },
    },
    required: ["fileName", "summary", "keyPoints", "documentType"],
  },
};

const renderPricingFunction: FunctionDeclaration = {
  name: "renderPricing",
  description: "Opens the TQL Pricing Engine iframe for detailed loan pricing.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      message: { type: Type.STRING, description: "Optional message to display alongside the pricing tool." },
    },
  },
};


const CHAT_MODEL = (process.env.VITE_GEMINI_CHAT_MODEL as string) || 'gemini-2.0-flash';

export async function* generateContentStream(
  messages: Message[],
  fileData?: { mimeType: string; data: string }
): AsyncGenerator<{ text: string; generativeUI?: GenerativeUIData } | { text: string }> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const query = lastUserMessage?.content || "";
  
  // Fetch RAG context and overrides (as before)
  const ragContext = await getRagContext(query);
  const overrides = getActiveOverrides();
  const overlayContext = overrides.length > 0 
    ? `OVERLAY GUIDELINES (FINAL SOURCE OF TRUTH):\n${JSON.stringify(overrides, null, 2)}`
    : "";

  const contents: any[] = messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  // Setup contents (same as before)
  if (contents.length > 0) {
    const lastContent = contents[contents.length - 1];
    if (lastContent.role === 'user') {
      lastContent.parts = [
        { text: `${overlayContext}\n\nKNOWLEDGE BASE CONTEXT:\n${ragContext}\n\nUSER QUERY: ${query}` }
      ];
    }
  }
  if (fileData) {
    const lastContent = contents[contents.length - 1];
    lastContent.parts.push({
      inlineData: { mimeType: fileData.mimeType, data: fileData.data },
    });
  }

  const useMaps = query.toLowerCase().includes("nearby") || 
                  query.toLowerCase().includes("location") || 
                  query.toLowerCase().includes("map");

  const stream = await ai.models.generateContentStream({
    model: CHAT_MODEL,
    contents,
    config: {
      systemInstruction,
      tools: [
        {
          functionDeclarations: [
            renderChartFunction,
            renderCardFunction,
            renderDealFunction,
            renderEmailFunction,
            renderLeaderboardFunction,
            renderIdeasFunction,
            renderQuoteBuilderFunction,
            renderImageFunction,
            renderDocumentAnalysisFunction,
            renderPricingFunction,
          ],
        },
        useMaps ? { googleMaps: {} } : { googleSearch: {} }
      ],
      toolConfig: { includeServerSideToolInvocations: true },
    },
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      yield { text: chunk.text };
    }
    
    if (chunk.functionCalls && chunk.functionCalls.length > 0) {
      const call = chunk.functionCalls[0];
      const args = { ...call.args } as any;
      const sourceRef = args.sourceRef as SourceRef | undefined;
      delete args.sourceRef; 

      let generativeUI: GenerativeUIData | undefined;
      
      // Re-use logic for mapping function names to UI types
      if (call.name === "renderChart") {
        generativeUI = { type: 'chart', data: args, sourceRef };
      } else if (call.name === "renderCard") {
        generativeUI = { type: 'card', data: args, sourceRef };
      } else if (call.name === "renderDeal") {
        generativeUI = { type: 'deal', data: args, sourceRef };
      } else if (call.name === "renderEmail") {
        generativeUI = { type: 'email', data: args, sourceRef };
      } else if (call.name === "renderLeaderboard") {
        generativeUI = { type: 'leaderboard', data: args, sourceRef };
      } else if (call.name === "renderIdeas") {
        generativeUI = { type: 'ideas', data: args, sourceRef };
      } else if (call.name === "renderQuoteBuilder") {
        generativeUI = { type: 'quoteBuilder', data: args, sourceRef };
      } else if (call.name === "renderImage") {
         // ... (re-implement image logic inside if needed, or better, separate)
         // For now, focusing on the UI part.
      } else if (call.name === "renderDocumentAnalysis") {
        generativeUI = { type: 'document', data: args };
      } else if (call.name === "renderPricing") {
        generativeUI = { type: 'pricing', data: args };
      }
      
      if (generativeUI) {
        yield { text: "", generativeUI };
      }
    }
  }
}
