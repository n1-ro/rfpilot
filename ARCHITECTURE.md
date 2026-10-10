# Architecture

`rfpilot` is a Next.js App Router application with a RAG engine that answers
RFP requirements from an organization's own knowledge base.

## High-level flow

```
RFP (PDF/DOCX/text)
      │
      ▼
parse-rfp.ts ──► sections + questions (narrative / yes-no / table / pricing)
      │
      ▼
ingest.ts ──► chunk documents (600 tokens, 100 overlap)
      │
      ▼
model-adapter.ts ──► embeddings (Zhipu embedding-3, dim 1024)
      │
      ▼
retrieve.ts ──► hybrid vector + keyword retrieval (top-K)
      │
      ▼
generate.ts ──► draft answers with sources + confidence
      │
      ▼
export ──► Word / PDF
```

## Engine modules

| Module | Responsibility |
|---|---|
| `parse-rfp.ts` | Detect sections + numbered requirements, classify question type |
| `ingest.ts` | Chunking + document text extraction |
| `retrieve.ts` | Hybrid retrieval (cosine + keyword blend) |
| `generate.ts` | RAG answer generation + confidence scoring |
| `prompts.ts` | System/user prompt assembly |
| `model-adapter.ts` | Swappable LLM interface; `MockModelAdapter` default |
| `pipeline.ts` | End-to-end orchestration (parse → retrieve → generate) |

## Confidence scoring

Confidence is derived from the top retrieved chunk's relevance score:
`> 0.6` high, `> 0.3` medium, otherwise low (auto-flagged for SME review).

## Persistence

`supabase/migrations/0001_init.sql` defines the full schema: orgs, profiles,
projects, rfps, sections, questions, answers, kb_documents (pgvector chunks),
qa_pairs, usage_events, and subscriptions — with RLS org isolation.
