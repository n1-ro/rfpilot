export interface RetrievedChunk {
  content: string;
  docId: string;
  docName: string;
  score: number;
}

export interface Candidate {
  chunkId: string;
  content: string;
  docId: string;
  docName: string;
  embedding: number[];
}

function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Keyword overlap score as a lexical fallback when embeddings are absent. */
function keywordScore(question: string, content: string): number {
  const qTerms = new Set(question.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []);
  if (qTerms.size === 0) return 0;
  const contentTerms = new Set(content.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []);
  let hits = 0;
  for (const t of qTerms) if (contentTerms.has(t)) hits++;
  return hits / qTerms.size;
}

/**
 * Hybrid retrieval: cosine similarity over embeddings, blended with keyword
 * overlap. Returns top-K chunks.
 */
export function retrieve(
  question: string,
  candidates: Candidate[],
  questionEmbedding: number[],
  topK = 8,
): RetrievedChunk[] {
  const scored = candidates.map((c) => {
    const vector = questionEmbedding.length > 0 ? cosine(questionEmbedding, c.embedding) : 0;
    const lexical = keywordScore(question, c.content);
    const score = 0.7 * vector + 0.3 * lexical;
    return { ...c, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((c) => ({ content: c.content, docId: c.docId, docName: c.docName, score: c.score }));
}
