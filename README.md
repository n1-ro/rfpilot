# RFPilot

An AI copilot that turns a lengthy RFP (Request for Proposal) or security questionnaire into a drafted, sourced response — in minutes instead of weeks.

Upload a PDF/DOCX or paste raw text, and RFPilot extracts every requirement, retrieves the most relevant passages from your own knowledge base, and drafts an answer with inline source citations and a confidence score for human review. Export the result to Word or PDF.

## How it works

1. **Parse** — detect section headings and numbered requirements, classify each as narrative / yes-no / table / pricing.
2. **Retrieve** — hybrid vector + keyword search over your indexed documents (pgvector), plus best-matching Q&A pairs.
3. **Generate** — draft each answer strictly from retrieved context, in your company voice, with a confidence level.
4. **Review & export** — approve/flag answers, then export a submission-ready .docx or PDF.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Supabase (PostgreSQL + pgvector) for storage and retrieval
- Stripe for billing/metering
- DeepSeek / GLM for completion, Zhipu embedding-3 for embeddings (dim 1024)

## Run it

```bash
npm install
npm run dev       # http://localhost:3000
npm run test      # engine unit tests
npm run build     # production build
```

## Structure

```
src/
  lib/
    engine/
      parse-rfp.ts      # requirement extraction
      ingest.ts         # chunking + doc text extraction
      retrieve.ts       # hybrid retrieval
      generate.ts       # RAG answer generation
      prompts.ts
      model-adapter.ts  # swappable LLM interface
    types.ts
  app/
    api/                # projects, generate, kb, export routes
supabase/migrations/
```

> A deterministic `MockModelAdapter` is the default so the full flow runs with no API keys. Point real keys in `.env` to use live models.
