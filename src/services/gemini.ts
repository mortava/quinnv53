import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse, ThinkingLevel } from "@google/genai";
import { Message, GenerativeUIData } from "../types";
import { getRagContext } from "./ragService";
import { getActiveOverrides } from "../overlay";

const systemInstruction = `
You are Quinn, a world-class, high-end Enterprise AI Agent for Total Quality Lending (TQL).
Your persona is professional, sophisticated, and highly efficient. You represent a premium corporate brand.

You have access to a built-in knowledge base (provided via context).
CRITICAL: Always check the OVERLAY GUIDELINES (provided in context) first. These are the final source of truth and override any other guidelines.

When a question is asked, you must act as an Optimistic Senior Underwriting Consultant and Strategic Problem Solver.
1. **Jump Straight to the Solution**: DO NOT lead with formal introductions or redundant preambles (e.g., "As a Senior Underwriting Consultant...", "I have analyzed..."). Get straight to the analysis, facts, and your recommendation.
2. **Maintain an Optimistic & Encouraging Tone**: Be the user's best partner. Frame every response with a "can-do" attitude, looking for ways to make the deal work within TQL's risk appetite.
3. **Analyze Scenarios Fully**: Do not just quote a rule. Evaluate the specific scenario provided. Consider LTV, FICO, reserves, and income types together.
4. **Explain the Reasoning ("The Why")**: Briefly explain the underlying logic. Helping the user understand the risk profile makes them a better partner.
5. **Proactively Suggest Alternatives**: If a primary loan program doesn't fit, or if a deal is "on the edge," proactively suggest 2-3 alternative paths (e.g., "If DSCR doesn't work at 1.0, we can pivot to Bank Statement if the borrower has self-employment history").
6. **Solve the Deal**: Be creative but compliant. Your goal is to find a path forward.

CRITICAL: To ensure maximum user engagement and a premium experience, you MUST use Generative UI elements (Charts, Cards, Deals, Emails, Leaderboards, Images, or Quote Builders) as a visual anchor in your responses. However, the Generative UI must ALWAYS be accompanied by a focused, textual consultation. Never "just shoot out a card." Provide the expert solution first, then the visual summary.
- Use Charts to visualize data trends.
- Use Cards to summarize key information or profiles.
- Use Images to provide visual context or inspiration.
- Use Document Analysis for summarizing or analyzing uploaded files.
- Use Quote Builders for any loan or property-related inquiries.
- Use Pricing Tools when the user asks about interest rates, pricing, quotes, or if they want to see "how this one will pricing out".

CRITICAL: If the user mentions "Pricing", "Rates", or "Pricing quote", you MUST use the renderPricing tool. DO NOT use renderCard or renderQuoteBuilder for these specific requests. The renderPricing tool is the ONLY tool that allows the user to access the interactive TQL Pricing Engine.

CRITICAL: NEVER output raw JSON structures or data objects in your text response. ALWAYS use the provided tools (renderChart, renderCard, renderPricing, etc.) to display structured data. Information should be presented cleanly in text, while data blocks use tools.

CRITICAL: Use Google Search and Google Maps tools to provide REAL-TIME data for Quote Builder requests.

CRITICAL: When evaluating underwriting matrices, DSCR ratios, or Non-QM eligibility, you MUST anchor your analysis in the provided KNOWLEDGE BASE CONTEXT. 

Always cross-reference the user's query against the Underwriting Matrices provided in the context to ensure 100% accuracy on LTV/FICO cutoffs.

CRITICAL CITATION REQUIREMENT:
At the very bottom of EVERY response that provides information, you MUST include a citation in this exact markdown format:

---
*Source: [Program Name] - Document [Doc Name/Number], Page/Section [Number]*

If you do not know the exact document or page, provide your best estimate based on the context, but you MUST include this citation line.

CUSTOM MEMORY COMMAND:
If the user starts a message with "/tqlup26", they are providing a guideline update or a "final source of truth" override.
When you see this command:
1. Acknowledge that you are scrubbing the guidelines for the final source of truth.
2. Confirm that the change has been noted and will be stored in the 'overlay.ts' memory.
3. Provide a summary of the change being made.
4. In your response, explicitly state: "Guideline update processed and stored in overlay.ts."
`;

const renderChartFunction: FunctionDeclaration = {
  name: "renderChart",
  description: "Renders a chart (bar, line, or pie) based on the provided data.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      chartType: {
        type: Type.STRING,
        description: "The type of chart: 'bar', 'line', or 'pie'",
      },
      title: {
        type: Type.STRING,
        description: "The title of the chart",
      },
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
        description: "The data points for the chart",
      },
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


export async function generateResponse(
  messages: Message[],
  fileData?: { mimeType: string; data: string }
): Promise<{ text: string; generativeUI?: GenerativeUIData }> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      const query = lastUserMessage?.content || "";
      
      // Fetch RAG context for the user's query
      const ragContext = await getRagContext(query);
      const overrides = getActiveOverrides();
      const overlayContext = overrides.length > 0 
        ? `OVERLAY GUIDELINES (FINAL SOURCE OF TRUTH):\n${JSON.stringify(overrides, null, 2)}`
        : "";

      const contents: any[] = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // Inject RAG and Overlay context into the last user message
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
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.data,
          },
        });
      }

      const useMaps = query.toLowerCase().includes("nearby") || 
                      query.toLowerCase().includes("location") || 
                      query.toLowerCase().includes("map") ||
                      query.toLowerCase().includes("amenities") ||
                      query.toLowerCase().includes("schools");

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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

      let text = response.text || "";
      let generativeUI: GenerativeUIData | undefined;

      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        
        if (call.name === "renderChart") {
          generativeUI = { type: 'chart', data: call.args };
        } else if (call.name === "renderCard") {
          generativeUI = { type: 'card', data: call.args };
        } else if (call.name === "renderDeal") {
          generativeUI = { type: 'deal', data: call.args };
        } else if (call.name === "renderEmail") {
          generativeUI = { type: 'email', data: call.args };
        } else if (call.name === "renderLeaderboard") {
          generativeUI = { type: 'leaderboard', data: call.args };
        } else if (call.name === "renderIdeas") {
          generativeUI = { type: 'ideas', data: call.args };
        } else if (call.name === "renderQuoteBuilder") {
          generativeUI = { type: 'quoteBuilder', data: call.args };
        } else if (call.name === "renderImage") {
          const { prompt, title, aspectRatio = "1:1", size = "1K" } = call.args as any;
          
          // Generate image using gemini-3.1-flash-image-preview
          try {
            const imageResponse = await ai.models.generateContent({
              model: 'gemini-3.1-flash-image-preview',
              contents: { parts: [{ text: prompt }] },
              config: {
                imageConfig: {
                  aspectRatio: aspectRatio as any,
                  imageSize: size as any
                }
              }
            });
            
            let imageUrl = "";
            for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
              if (part.inlineData) {
                imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                break;
              }
            }
            
            if (imageUrl) {
              generativeUI = { type: 'image', data: { url: imageUrl, title, prompt } };
            }
          } catch (imgError: any) {
            console.error("Image generation error:", imgError);
            
            // Handle API key selection error
            if (imgError.message?.includes("Requested entity was not found")) {
              text += "\n\n(Note: I attempted to generate an image but it seems your API key selection is invalid. Please refresh and select a valid key from a paid Google Cloud project.)";
            } else {
              text += "\n\n(Note: I attempted to generate an image but encountered an error. Please ensure you have selected an API key if required.)";
            }
          }
        } else if (call.name === "renderDocumentAnalysis") {
          generativeUI = { type: 'document', data: call.args };
        } else if (call.name === "renderPricing") {
          generativeUI = { type: 'pricing', data: call.args };
        }

        
        // If the model only returned a function call, provide a default text
        if (!text) {
          text = "Here is the requested information:";
        }
      }

      return { text, generativeUI };
    } catch (error: any) {
      console.error(`Error generating response (attempt ${retryCount + 1}):`, error);
      
      // Don't retry if it's a client error (4xx) unless it's 429
      if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
        return { text: `I encountered an error while processing your request: ${error.message || "Unknown error"}. Please try again.` };
      }

      retryCount++;
      if (retryCount < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      } else {
        return { text: "I'm having trouble connecting to the Gemini API right now. Please check your internet connection or try again in a few moments." };
      }
    }
  }
  
  return { text: "I encountered an error while processing your request. Please try again." };
}
