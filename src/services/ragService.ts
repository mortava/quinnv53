import { GoogleGenAI } from "@google/genai";
import { allChunks, findChunksByTag, findChunksByProductLine } from "../lib/knowledge_base";
import { DocumentChunk } from "../lib/knowledge_types";

interface EmbeddedChunk extends DocumentChunk {
  embedding: number[];
}

const EMBED_MODEL = (process.env.VITE_GEMINI_EMBED_MODEL as string) || 'gemini-embedding-004';
const CACHE_KEY = 'quinn_embeddings_v2';
const CACHE_HASH_KEY = 'quinn_embeddings_hash_v2';

let cachedEmbeddings: EmbeddedChunk[] | null = null;
let initializationPromise: Promise<EmbeddedChunk[]> | null = null;

function getChunksHash(): string {
  return `${allChunks.length}_${allChunks[0]?.id ?? 'empty'}`;
}

function loadFromLocalStorage(): EmbeddedChunk[] | null {
  try {
    const hash = localStorage.getItem(CACHE_HASH_KEY);
    if (hash !== getChunksHash()) return null;
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed as EmbeddedChunk[];
  } catch {
    return null;
  }
}

function saveToLocalStorage(chunks: EmbeddedChunk[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(chunks));
    localStorage.setItem(CACHE_HASH_KEY, getChunksHash());
  } catch {
    // quota exceeded — skip silently
  }
}

export async function initializeKnowledgeBase(): Promise<EmbeddedChunk[]> {
  if (cachedEmbeddings) return cachedEmbeddings;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    // 1. Memory cache (already checked above, guard for concurrency)
    if (cachedEmbeddings) return cachedEmbeddings;

    // 2. localStorage cache
    const lsCache = loadFromLocalStorage();
    if (lsCache) {
      cachedEmbeddings = lsCache;
      console.log(`[Quinn] Loaded ${lsCache.length} embeddings from localStorage.`);
      return lsCache;
    }

    // 3. Pre-computed static file
    try {
      const res = await fetch('/embeddings.json');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          cachedEmbeddings = data as EmbeddedChunk[];
          saveToLocalStorage(cachedEmbeddings);
          console.log(`[Quinn] Loaded ${cachedEmbeddings.length} embeddings from static file.`);
          return cachedEmbeddings;
        }
      }
    } catch {
      // fall through to generation
    }

    // 4. Generate via Gemini — return [] on any failure so the app keeps rendering
    try {
      const result = await generateEmbeddings();
      cachedEmbeddings = result;
      if (result.length > 0) saveToLocalStorage(result);
      return result;
    } catch (err) {
      console.error('[Quinn] Knowledge base initialization failed, running without embeddings:', err);
      cachedEmbeddings = [];
      initializationPromise = null; // allow retry on next call
      return [];
    }
  })();

  return initializationPromise;
}

async function generateEmbeddings(): Promise<EmbeddedChunk[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Quinn] GEMINI_API_KEY not set — skipping embedding generation.');
    return [];
  }

  const ai = new GoogleGenAI({ apiKey });
  console.log('[Quinn] Generating knowledge base embeddings...');

  const chunks = allChunks;
  const batchSize = 10; // smaller batches to stay under quota
  const embeddedChunks: EmbeddedChunk[] = [];
  const maxRetries = 3;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    let success = false;
    let retryCount = 0;

    while (!success && retryCount < maxRetries) {
      try {
        const result = await ai.models.embedContent({
          model: EMBED_MODEL,
          contents: batch.map(c => c.content),
        });

        if (result.embeddings) {
          result.embeddings.forEach((emb, index) => {
            if (emb.values) {
              embeddedChunks.push({ ...batch[index], embedding: emb.values });
            }
          });
        }
        success = true;

        // 100ms pause between batches to avoid hitting the rate limit
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        retryCount++;
        const is429 = error?.status === 429 || String(error).includes('RESOURCE_EXHAUSTED');
        if (is429 && retryCount < maxRetries) {
          // Exponential backoff: 10s, 20s, 40s
          const delay = Math.pow(2, retryCount) * 10_000;
          console.warn(`[Quinn] Rate limited on batch ${i}, retrying in ${delay / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error(`[Quinn] Batch ${i} failed after ${retryCount} attempt(s) — skipping.`, error);
          break;
        }
      }
    }
  }

  console.log(`[Quinn] Knowledge base ready: ${embeddedChunks.length} of ${chunks.length} chunks embedded.`);
  return embeddedChunks;
}

/** Dev helper: download cached embeddings as embeddings.json */
export function exportEmbeddings() {
  if (!cachedEmbeddings || cachedEmbeddings.length === 0) {
    console.error('[Quinn] No embeddings cached yet.');
    return;
  }
  const blob = new Blob([JSON.stringify(cachedEmbeddings, null, 2)], { type: 'application/json' });
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

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function hybridSearch(query: string, topK = 5): Promise<DocumentChunk[]> {
  const embeddings = await initializeKnowledgeBase();

  if (embeddings.length === 0) {
    // No vectors available — fall back to keyword search
    return keywordFallback(query, topK);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return keywordFallback(query, topK);

  const ai = new GoogleGenAI({ apiKey });

  let queryVector: number[];
  try {
    const queryResult = await ai.models.embedContent({
      model: EMBED_MODEL,
      contents: [query],
    });
    if (!queryResult.embeddings?.[0]?.values) return keywordFallback(query, topK);
    queryVector = queryResult.embeddings[0].values;
  } catch {
    return keywordFallback(query, topK);
  }

  const lowerQuery = query.toLowerCase();
  let pool = embeddings;

  if (lowerQuery.includes('dscr')) {
    const ids = new Set(findChunksByTag('dscr').map(c => c.id));
    const filtered = pool.filter(c => ids.has(c.id));
    if (filtered.length > 0) pool = filtered;
  } else if (lowerQuery.includes('alt doc')) {
    const ids = new Set(findChunksByProductLine('Alt Doc').map(c => c.id));
    const filtered = pool.filter(c => ids.has(c.id));
    if (filtered.length > 0) pool = filtered;
  } else if (lowerQuery.includes('heloan') || lowerQuery.includes('2nd lien') || lowerQuery.includes('smart equity')) {
    const ids = new Set(findChunksByTag('heloan').map(c => c.id));
    const filtered = pool.filter(c => ids.has(c.id));
    if (filtered.length > 0) pool = filtered;
  }

  const ranked = pool
    .map(chunk => ({ chunk, score: cosineSimilarity(queryVector, chunk.embedding) }))
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, topK).map(r => r.chunk);
}

function keywordFallback(query: string, topK: number): DocumentChunk[] {
  const lower = query.toLowerCase();
  const scored = allChunks
    .map(chunk => {
      const text = `${chunk.section} ${chunk.content}`.toLowerCase();
      const words = lower.split(/\s+/).filter(Boolean);
      const score = words.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0);
      return { chunk, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map(r => r.chunk);
}

export async function getRagContext(query: string): Promise<string> {
  try {
    const chunks = await hybridSearch(query);
    return chunks
      .map(c => `[Source: ${c.sourceDocId}, Section: ${c.section}]\n${c.content}`)
      .join('\n\n---\n\n');
  } catch {
    return '';
  }
}
