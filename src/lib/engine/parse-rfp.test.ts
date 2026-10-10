import { describe, expect, it } from 'vitest';
import { classifyQuestion, parseRfp } from './parse-rfp';

const SAMPLE = `
1. Introduction
1.1 Company Overview
Provide an overview of your company.

2. Security
2.1.1 Does your solution support single sign-on?
2.1.2 Describe your approach to data encryption.
2.2 Pricing
2.2.1 Provide your pricing schedule.
`;

describe('parseRfp', () => {
  it('extracts numbered requirements across sections', () => {
    const rfp = parseRfp(SAMPLE);
    expect(rfp.sections.length).toBeGreaterThanOrEqual(2);
    expect(rfp.totalQuestions).toBeGreaterThanOrEqual(4);
  });

  it('classifies yes/no questions', () => {
    expect(classifyQuestion('Does your solution support SSO?')).toBe('yes_no');
  });

  it('classifies pricing questions', () => {
    expect(classifyQuestion('Provide your pricing schedule.')).toBe('pricing');
  });

  it('classifies narrative imperatives', () => {
    expect(classifyQuestion('Describe your approach to data migration.')).toBe('narrative');
  });
});
