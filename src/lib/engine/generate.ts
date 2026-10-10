import { CompanyVoice, Confidence, ParsedQuestion, Source } from '../types';
import { RetrievedChunk } from './retrieve';

export interface ModelAdapter {
  embed(texts: string[]): Promise<number[][]>;
  complete(prompt: string, opts?: { temperature?: number }): Promise<string>;
}

/** Deterministic adapter for tests and offline demos — no network, no API key. */
export class MockModelAdapter implements ModelAdapter {
  private dim: number;

  constructor(dim = 1024) {
    this.dim = dim;
  }

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((t) => {
      const v = new Array<number>(this.dim).fill(0);
      // Simple deterministic hashing into a vector.
      for (let i = 0; i < t.length; i++) {
        const c = t.charCodeAt(i);
        v[(c * 31 + i * 7) % this.dim] += 1;
      }
      const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
      return v.map((x) => x / norm);
    });
  }

  async complete(prompt: string): Promise<string> {
    return `[Mock answer] Based on the provided context, this requirement is addressed in the referenced material.`;
  }
}

export interface QaPairInput {
  question: string;
  answer: string;
  starred: boolean;
}

export async function generateAnswer(
  q: ParsedQuestion,
  context: RetrievedChunk[],
  qaPairs: QaPairInput[],
  voice: CompanyVoice,
  model: ModelAdapter,
): Promise<{ draft: string; confidence: Confidence; sources: Source[] }> {
  const starred = qaPairs.filter((p) => p.starred);
  const contextText = context.map((c) => `[${c.docName}] ${c.content}`).join('\n');
  const voiceText = `${voice.tone}; ${voice.description}; ${voice.differentiators}`;

  const topScore = context[0]?.score ?? 0;
  const confidence: Confidence = topScore > 0.6 ? 'high' : topScore > 0.3 ? 'medium' : 'low';

  let draft: string;
  if (starred.length > 0) {
    draft = starred[0].answer;
  } else {
    draft = await model.complete(
      JSON.stringify({ question: q.text, qtype: q.qtype, context: contextText, voice: voiceText }),
    );
  }

  const sources: Source[] = context.slice(0, 5).map((c) => ({
    docId: c.docId,
    docName: c.docName,
    excerpt: c.content.slice(0, 200),
    relevance: Math.round(c.score * 100),
  }));

  return { draft, confidence, sources };
}
