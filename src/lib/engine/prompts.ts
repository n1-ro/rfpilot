export const SYSTEM_PROMPT = `
You are a proposal-writing assistant. Answer the question using ONLY the provided
context. Cite the source document for every factual claim. If the context is
insufficient, say so explicitly and mark the answer low confidence.
`.trim();

export function buildPrompt(params: {
  question: string;
  qtype: string;
  context: string;
  voice: string;
}): string {
  return [
    SYSTEM_PROMPT,
    '',
    `Company voice: ${params.voice}`,
    '',
    'Context:',
    params.context,
    '',
    `Question (${params.qtype}): ${params.question}`,
    '',
    params.qtype === 'yes_no'
      ? 'Answer yes or no, then justify in two sentences with citations.'
      : 'Answer in 150–300 words with inline citations [doc] where appropriate.',
  ].join('\n');
}
