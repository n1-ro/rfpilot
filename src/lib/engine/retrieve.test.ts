import { describe, expect, it } from 'vitest';
import { retrieve, Candidate } from './retrieve';

function cand(id: string, content: string, embedding: number[]): Candidate {
  return { chunkId: id, content, docId: id, docName: id, embedding };
}

describe('retrieve', () => {
  it('ranks lexically relevant chunks higher', () => {
    const candidates = [
      cand('a', 'data encryption at rest uses AES-256', [0, 0, 0]),
      cand('b', 'the office is located in cairo', [0, 0, 0]),
    ];
    const q = [0, 0, 0];
    const result = retrieve('describe your data encryption approach', candidates, q, 2);
    expect(result[0].docId).toBe('a');
  });

  it('caps at topK', () => {
    const candidates = Array.from({ length: 20 }, (_, i) => cand(`d${i}`, `content ${i}`, [0, 0, 0]));
    const result = retrieve('content', candidates, [0, 0, 0], 5);
    expect(result).toHaveLength(5);
  });
});
