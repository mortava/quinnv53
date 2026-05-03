import { GoogleGenAI } from "@google/genai";
import { allChunks, findChunksByTag, findChunksByProductLine } from "../lib/knowledge_base";
import { DocumentChunk } from "../lib/knowledge_types";

interface EmbeddedChunk extends DocumentChunk {
  embedding: number[];
}

let cachedEmbeddings: EmbeddedChunk[] | null = null;
let initializationPromise: Promise<EmbeddedChunk[]> | null = null;

/**
 * Initializes the knowledge base by embedding all chunks.
 * This is done once and cached in memory.
 */
export async function initializeKnowledgeBase() {
  if (cachedEmbeddings) return cachedEmbeddings;
  if (initializationPromise) return initializationPromise;

  // Attempt to load pre-computed embeddings
  initializationPromise = (async () => {
    try {
      const response = await fetch('/embeddings.json');
      if (response.ok) {
        cachedEmbeddings = await response.json();
        console.log(`Loaded ${cachedEmbeddings!.length} embeddings from static file.`);
        return cachedEmbeddings!;
      }
    } catch (e) {
      console.warn("Failed to load pre-computed embeddings, falling back to generation.", e);
    }

    // Fallback: Generate embeddings
    return generateEmbeddings();
  })();

  return initializationPromise;
}

async function generateEmbeddings() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log("Initializing Knowledge Base Embeddings...");
  const chunks = allChunks;
  
  const batchSize = 20; 
  const embeddedChunks: EmbeddedChunk[] = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    console.log(`Embedding batch ${i / batchSize + 1} of ${Math.ceil(chunks.length / batchSize)}...`);
    let success = false;
    let retryCount = 0;
    const maxRetries = 5; 

    while (!success && retryCount < maxRetries) {
      try {
        const result = await ai.models.embedContent({
          model: "gemini-embedding-2-preview",
          contents: batch.map(c => c.content),
        });

        if (result.embeddings) {
          result.embeddings.forEach((emb, index) => {
            embeddedChunks.push({
              ...batch[index],
              embedding: emb.values,
            });
          });
        }
        success = true;
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error embedding batch ${i} (attempt ${retryCount + 1}):`, error);
        retryCount++;
        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 2000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    if (!success) {
      console.error(`Failed to embed batch ${i} after ${maxRetries} attempts.`);
    }
  }

  cachedEmbeddings = embeddedChunks;
  console.log(`Knowledge Base Initialized with ${cachedEmbeddings.length} embeddings.`);
  return cachedEmbeddings;
}

/**
 * Dev helper: Downloads the current cached embeddings as embeddings.json
 */
export function exportEmbeddings() {
  if (!cachedEmbeddings) {
    console.error("No embeddings to export. Run a search first.");
    return;
  }
  const data = JSON.stringify(cachedEmbeddings, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'embeddings.json';
  a.click();
  URL.revokeObjectURL(url);
}

if (typeof window !== 'undefined') {
  (window as any).exportEmbeddings = exportEmbeddings;
}

/**
 * Cosine similarity between two vectors.
 */
function cosineSimilarity(a: number[], b: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Performs a hybrid search:
 * 1. Metadata filtering (tags/product lines)
 * 2. Semantic vector search
 */
export async function hybridSearch(query: string, topK: number = 5) {
  const embeddings = await initializeKnowledgeBase();
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // 1. Get query embedding
  const queryResult = await ai.models.embedContent({
    model: "gemini-embedding-2-preview",
    contents: [query],
  });
  
  if (!queryResult.embeddings || queryResult.embeddings.length === 0) {
    throw new Error("Failed to generate query embedding");
  }
  
  const queryVector = queryResult.embeddings[0].values;

  // 2. Identify potential filters from the query
  const lowerQuery = query.toLowerCase();
  let filteredPool = embeddings;

  // Simple heuristic for filtering
  if (lowerQuery.includes("dscr")) {
    const dscrIds = new Set(findChunksByTag("dscr").map(c => c.id));
    filteredPool = filteredPool.filter(c => dscrIds.has(c.id));
  } else if (lowerQuery.includes("alt doc")) {
    const altDocIds = new Set(findChunksByProductLine("Alt Doc").map(c => c.id));
    filteredPool = filteredPool.filter(c => altDocIds.has(c.id));
  } else if (lowerQuery.includes("heloan") || lowerQuery.includes("2nd lien") || lowerQuery.includes("smart equity")) {
    const heloanIds = new Set(findChunksByTag("heloan").map(c => c.id));
    filteredPool = filteredPool.filter(c => heloanIds.has(c.id));
  }

  // If filter narrowed it down too much (e.g. 0), fall back to full pool
  if (filteredPool.length === 0) {
    filteredPool = embeddings;
  }

  // 3. Rank by similarity
  const ranked = filteredPool.map(chunk => ({
    chunk,
    score: cosineSimilarity(queryVector, chunk.embedding)
  }));

  ranked.sort((a, b) => b.score - a.score);

  return ranked.slice(0, topK).map(r => r.chunk);
}

/**
 * RAG implementation: Retrieves context and generates a response.
 */
export async function getRagContext(query: string) {
  const relevantChunks = await hybridSearch(query);
  
  const context = relevantChunks.map(c => {
    return `[Source: ${c.sourceDocId}, Section: ${c.section}]\n${c.content}`;
  }).join("\n\n---\n\n");

  return context;
}
