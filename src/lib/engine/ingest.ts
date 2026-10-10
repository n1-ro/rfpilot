/**
 * Dependency-free text extraction + chunking for ingested knowledge-base docs.
 */

export function chunkDocument(text: string, chunkSize = 600, overlap = 100): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= chunkSize) return cleaned ? [cleaned] : [];

  const chunks: string[] = [];
  let start = 0;
  while (start < cleaned.length) {
    const end = Math.min(start + chunkSize, cleaned.length);
    // Prefer to break on a word boundary.
    let cut = end;
    if (end < cleaned.length) {
      const space = cleaned.lastIndexOf(' ', end);
      if (space > start) cut = space;
    }
    chunks.push(cleaned.slice(start, cut).trim());
    start = Math.max(cut - overlap, start + 1);
  }
  return chunks.filter((c) => c.length > 0);
}

/** Approximate token count (words / 0.75). */
export function estimateTokens(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.ceil(words / 0.75);
}
