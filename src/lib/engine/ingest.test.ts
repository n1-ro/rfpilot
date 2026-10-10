import { describe, expect, it } from 'vitest';
import { chunkDocument, estimateTokens } from './ingest';

describe('chunkDocument', () => {
  it('keeps short text as one chunk', () => {
    const chunks = chunkDocument('hello world');
    expect(chunks).toEqual(['hello world']);
  });

  it('splits long text into overlapping chunks', () => {
    const text = Array.from({ length: 2000 }, (_, i) => `word${i}`).join(' ');
    const chunks = chunkDocument(text, 600, 100);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.length > 0)).toBe(true);
  });

  it('returns empty for empty input', () => {
    expect(chunkDocument('')).toEqual([]);
  });
});

describe('estimateTokens', () => {
  it('approximates token count', () => {
    expect(estimateTokens('one two three four')).toBeGreaterThanOrEqual(4);
  });
});
