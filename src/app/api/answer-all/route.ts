import { NextResponse } from 'next/server';
import { parseRfp } from '@/lib/engine/parse-rfp';
import { chunkDocument } from '@/lib/engine/ingest';
import { MockModelAdapter } from '@/lib/engine/model-adapter';
import { generateAnswer } from '@/lib/engine/generate';
import { retrieve } from '@/lib/engine/retrieve';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const rfpText: string | undefined = body?.rfpText;
  const knowledgeBase: { id: string; name: string; text: string }[] = body?.knowledgeBase ?? [];

  if (!rfpText) {
    return NextResponse.json({ error: 'rfpText is required' }, { status: 400 });
  }

  const parsed = parseRfp(rfpText);
  const model = new MockModelAdapter();

  // Index the knowledge base.
  const candidates: any[] = [];
  for (const doc of knowledgeBase) {
    const chunks = chunkDocument(doc.text);
    const embeddings = await model.embed(chunks);
    chunks.forEach((content, i) => {
      candidates.push({ chunkId: `${doc.id}:${i}`, content, docId: doc.id, docName: doc.name, embedding: embeddings[i] ?? [] });
    });
  }

  const questions = parsed.sections.flatMap((s) => s.questions);
  const results = [];
  for (const q of questions) {
    const [qEmb] = await model.embed([q.text]);
    const context = retrieve(q.text, candidates, qEmb ?? [], 8);
    const answer = await generateAnswer(
      q,
      context,
      [],
      { tone: 'professional', description: '', differentiators: '' },
      model,
    );
    results.push({ question: q, ...answer });
  }

  return NextResponse.json({ sections: parsed.sections, totalQuestions: parsed.totalQuestions, answers: results });
}
