import { NextResponse } from 'next/server';
import { MockModelAdapter } from '@/lib/engine/model-adapter';
import { runPipeline } from '@/lib/engine/pipeline';

// Demo-only generation route using the mock adapter. In production this
// resolves the org knowledge base from Supabase and uses a live model.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const question = body?.question;
  const documents = body?.documents;

  if (!question?.text || !Array.isArray(documents)) {
    return NextResponse.json({ error: 'question and documents are required' }, { status: 400 });
  }

  const result = await runPipeline({
    question: { number: question.number ?? null, text: question.text, qtype: question.qtype ?? 'narrative' },
    documents,
    model: new MockModelAdapter(),
  });

  return NextResponse.json(result);
}
