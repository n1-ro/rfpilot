import { describe, expect, it } from 'vitest';
import { MockModelAdapter } from './model-adapter';

describe('MockModelAdapter', () => {
  it('returns vectors of the configured dimension', async () => {
    const m = new MockModelAdapter(16);
    const out = await m.embed(['hello', 'world']);
    expect(out).toHaveLength(2);
    expect(out[0]).toHaveLength(16);
  });

  it('returns unit-normalized vectors', async () => {
    const m = new MockModelAdapter(8);
    const [v] = await m.embed(['some text']);
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    expect(norm).toBeCloseTo(1, 5);
  });

  it('returns a deterministic completion', async () => {
    const m = new MockModelAdapter();
    const text = await m.complete('anything');
    expect(text.length).toBeGreaterThan(0);
  });
});
