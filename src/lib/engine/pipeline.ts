import { MockModelAdapter, ModelAdapter } from './model-adapter';
import { generateAnswer } from './generate';
import { retrieve } from './retrieve';
import { chunkDocument } from './ingest';
import { ParsedQuestion } from '../types';

/** Minimal end-to-end pipeline: parse → embed → retrieve → generate. */
export async function runPipeline(params: {
  question: ParsedQuestion;
  documents: { id: string; name: string; text: string }[];
  model?: ModelAdapter;
}) {
  const model = params.model ?? new MockModelAdapter();

  // Index documents into chunks with embeddings.
  const candidates: {
    chunkId: string;
    content: string;
    docId: string;
    docName: string;
    embedding: number[];
  }[] = [];
  for (const doc of params.documents) {
    const chunks = chunkDocument(doc.text);
    const embeddings = await model.embed(chunks);
    chunks.forEach((content, i) => {
      candidates.push({
        chunkId: `${doc.id}:${i}`,
        content,
        docId: doc.id,
        docName: doc.name,
        embedding: embeddings[i] ?? [],
      });
    });
  }

  const [qEmbedding] = await model.embed([params.question.text]);
  const context = retrieve(params.question.text, candidates, qEmbedding ?? [], 8);

  return generateAnswer(
    params.question,
    context,
    [],
    { tone: 'professional', description: '', differentiators: '' },
    model,
  );
}
