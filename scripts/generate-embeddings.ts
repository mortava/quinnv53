/**
 * Pre-compute Gemini embeddings for the TQL knowledge base and write to
 * public/embeddings.json so the app never calls the Gemini Embed API at runtime.
 *
 * Usage:  npm run embed
 * Needs:  GEMINI_API_KEY in .env (or environment)
 */

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { allChunks } from '../src/lib/knowledge_base.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.GEMINI_API_KEY;
const EMBED_MODEL = process.env.VITE_GEMINI_EMBED_MODEL || 'gemini-embedding-001';
const BATCH_SIZE = 10;
const MAX_RETRIES = 3;
const OUT_PATH = resolve(__dirname, '../public/embeddings.json');

if (!API_KEY) {
  console.error('Error: GEMINI_API_KEY is not set.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const totalBatches = Math.ceil(allChunks.length / BATCH_SIZE);

console.log(`Model:   ${EMBED_MODEL}`);
console.log(`Chunks:  ${allChunks.length}`);
console.log(`Batches: ${totalBatches}`);
console.log('');

type EmbeddedChunk = (typeof allChunks)[number] & { embedding: number[] };
const results: EmbeddedChunk[] = [];

for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
  const batch = allChunks.slice(i, i + BATCH_SIZE);
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;
  let success = false;
  let retries = 0;

  while (!success && retries < MAX_RETRIES) {
    try {
      const res = await ai.models.embedContent({
        model: EMBED_MODEL,
        contents: batch.map(c => c.content),
      });

      if (res.embeddings) {
        res.embeddings.forEach((emb, idx) => {
          if (emb.values) {
            results.push({ ...batch[idx], embedding: emb.values });
          }
        });
      }
      success = true;

      const pct = Math.round((results.length / allChunks.length) * 100);
      process.stdout.write(`\r  [${pct.toString().padStart(3)}%] batch ${batchNum}/${totalBatches} — ${results.length}/${allChunks.length} chunks`);

      await new Promise(r => setTimeout(r, 120));
    } catch (err: any) {
      retries++;
      const is429 = err?.status === 429 || String(err).includes('RESOURCE_EXHAUSTED');
      if (is429 && retries < MAX_RETRIES) {
        const delay = Math.pow(2, retries) * 10_000;
        console.warn(`\n  Rate limited on batch ${batchNum}, retrying in ${delay / 1000}s (attempt ${retries}/${MAX_RETRIES})...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        console.error(`\n  Batch ${batchNum} failed after ${retries} attempt(s) — skipping.`, err);
        break;
      }
    }
  }
}

console.log(`\n\nEmbedded ${results.length} of ${allChunks.length} chunks.`);

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(results));
console.log(`Written → ${OUT_PATH}`);

if (results.length < allChunks.length) {
  console.warn(`Warning: ${allChunks.length - results.length} chunk(s) were skipped.`);
  process.exit(1);
}
