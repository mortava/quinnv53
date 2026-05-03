import dscrInvestorSolutions from "./dscrInvestorSolutions";
import fullAltDocMatrix from "./fullAltDocMatrix";
import tqlSmartEquity2ndLien from "./tqlSmartEquity2ndLien";
import foreignNationalDscr from "./foreignNationalDscr";
import tqlFullUWGuidelines from "./tqlFullUWGuidelines";

export { dscrInvestorSolutions, fullAltDocMatrix, tqlSmartEquity2ndLien, foreignNationalDscr, tqlFullUWGuidelines };

export type { KnowledgeDocument, DocumentChunk, DocumentMetadata } from "./knowledge_types";

/** All knowledge documents as an array */  
export const knowledgeBase = [
  dscrInvestorSolutions,
  fullAltDocMatrix,
  tqlSmartEquity2ndLien,
  foreignNationalDscr,
  tqlFullUWGuidelines,
];

/** Flat array of ALL chunks across all documents — ready for Gemini batch embedding */
export const allChunks = knowledgeBase.flatMap(doc => doc.chunks);

/** Quick lookup: find chunks by tag */
export function findChunksByTag(tag: string) {
  return knowledgeBase
    .filter(doc => doc.metadata.tags.includes(tag))
    .flatMap(doc => doc.chunks);
}

/** Quick lookup: find chunks by product line */
export function findChunksByProductLine(productLine: string) {
  return knowledgeBase
    .filter(doc => doc.metadata.productLine.toLowerCase().includes(productLine.toLowerCase()))
    .flatMap(doc => doc.chunks);
}

/** Quick lookup: find chunk by ID */
export function findChunkById(id: string) {
  return allChunks.find(c => c.id === id);
}

/** Quick lookup: find chunk by sourceDocId and sectionTitle */
export function findChunkBySection(docId: string, sectionTitle: string) {
  return allChunks.find(c => c.sourceDocId === docId && c.section === sectionTitle);
}

/** Summary of loaded knowledge base */
export const knowledgeBaseSummary = {
  totalDocuments: 5,
  totalChunks: allChunks.length,
  documents: knowledgeBase.map(doc => ({
    id: doc.metadata.id,
    title: doc.metadata.title,
    productLine: doc.metadata.productLine,
    chunks: doc.chunks.length,
    tags: doc.metadata.tags,
  })),
};
