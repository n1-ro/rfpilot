export type QuestionType = 'narrative' | 'yes_no' | 'table' | 'pricing';
export type AnswerStatus = 'unprocessed' | 'generating' | 'generated' | 'approved' | 'flagged';
export type Confidence = 'high' | 'medium' | 'low';

export interface ParsedQuestion {
  number: string | null;
  text: string;
  qtype: QuestionType;
}

export interface ParsedSection {
  title: string;
  position: number;
  questions: ParsedQuestion[];
}

export interface ParsedRfp {
  sections: ParsedSection[];
  totalQuestions: number;
}

export interface Source {
  docId: string;
  docName: string;
  excerpt: string;
  relevance: number;
}

export interface CompanyVoice {
  tone: 'professional' | 'friendly' | 'formal';
  description: string;
  differentiators: string;
}
