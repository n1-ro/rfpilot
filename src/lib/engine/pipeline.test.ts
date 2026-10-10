import { describe, expect, it } from 'vitest';
import { MockModelAdapter } from './model-adapter';
import { runPipeline } from './pipeline';

describe('pipeline', () => {
  it('runs end-to-end with the mock adapter and returns a draft + sources', async () => {
    const out = await runPipeline({
      question: { number: '2.1.1', text: 'Describe your approach to data encryption.', qtype: 'narrative' },
      documents: [
        { id: 'd1', name: 'Security Handbook', text: 'We encrypt data at rest using AES-256 and in transit using TLS 1.2+.' },
      ],
      model: new MockModelAdapter(),
    });
    expect(out.draft.length).toBeGreaterThan(0);
    expect(out.confidence).toMatch(/high|medium|low/);
    expect(Array.isArray(out.sources)).toBe(true);
  });

  it('returns low confidence when no relevant context exists', async () => {
    const out = await runPipeline({
      question: { number: '9.9.9', text: 'Explain your quantum computing strategy.', qtype: 'narrative' },
      documents: [
        { id: 'd1', name: 'Office Guide', text: 'The office is located in downtown Cairo.' },
      ],
      model: new MockModelAdapter(),
    });
    expect(out.confidence).toBe('low');
  });
});
