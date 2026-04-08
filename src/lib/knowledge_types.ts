/**
 * TQL Non-QM Knowledge Base — Shared TypeScript Types
 * Auto-generated for Gemini AI App integration
 * Generated: 2026-03-29
 */

export interface DocumentChunk {
  /** Unique chunk identifier: "{docId}-{index}" */
  id: string;
  /** Section heading this chunk belongs to */
  section: string;
  /** Heading depth (1=H1, 2=H2, 3=H3, 4=H4, 0=no heading) */
  headingLevel: number;
  /** Raw text content of the chunk — used for embedding + retrieval */
  content: string;
  /** Source document ID */
  sourceDocId: string;
  /** Zero-based chunk index within document */
  chunkIndex: number;
}

export interface DocumentMetadata {
  id: string;
  title: string;
  program: string;
  docType: string;
  productLine: string;
  version: string;
  lender: string;
  tags: string[];
  totalChunks: number;
  /** ISO date string of when this was generated */
  generatedAt: string;
}

export interface KnowledgeDocument {
  metadata: DocumentMetadata;
  chunks: DocumentChunk[];
}
