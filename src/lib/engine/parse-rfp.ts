import { ParsedQuestion, ParsedRfp, ParsedSection, QuestionType } from '../types';

const NUMBERED = /^\s*(\d+(?:\.\d+)*)[\.\)]\s+(.+)$/;
const HEADING = /^\s*(\d+(?:\.\d+)*\.?)\s+([A-Z][A-Za-z0-9 &()\/-]{2,60})$/;
const YES_NO = /^(?:does|is|are|will|can|has|have|do)\b.*\?$/i;
const IMPERATIVE = /^(describe|explain|provide|outline|list|specify|detail|state|indicate)\b/i;

export function classifyQuestion(text: string): QuestionType {
  if (YES_NO.test(text)) return 'yes_no';
  if (/price|pricing|rate|fee|cost|quote/i.test(text)) return 'pricing';
  if (/table|schedule of|breakdown/i.test(text)) return 'table';
  return 'narrative';
}

/**
 * Extract sections and numbered requirements from raw RFP text.
 * Handles the common "3.1.2 requirement" pattern plus heading lines.
 */
export function parseRfp(raw: string): ParsedRfp {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sections: ParsedSection[] = [];
  let current: ParsedSection = { title: 'General', position: 0, questions: [] };

  const flush = () => {
    if (current.questions.length > 0) sections.push(current);
  };

  for (const line of lines) {
    const heading = line.match(HEADING);
    const numbered = line.match(NUMBERED);

    if (heading && !numbered) {
      flush();
      current = { title: heading[2], position: sections.length, questions: [] };
    } else if (numbered) {
      current.questions.push({
        number: numbered[1],
        text: numbered[2],
        qtype: classifyQuestion(numbered[2]),
      });
    } else if (IMPERATIVE.test(line) && line.length > 20) {
      current.questions.push({
        number: null,
        text: line,
        qtype: classifyQuestion(line),
      });
    }
  }
  flush();

  const totalQuestions = sections.reduce((n, s) => n + s.questions.length, 0);
  return { sections, totalQuestions };
}
