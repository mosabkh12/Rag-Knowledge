# RAG Knowledge Base Assistant

A production-style Retrieval-Augmented Generation (RAG) assistant. Upload
documents, and ask natural-language questions that are answered strictly
from the content you've added — with cited source chunks and similarity
scores.

Built with a clean, layered architecture on Next.js 15, Supabase
(PostgreSQL + pgvector), and the OpenAI API.

---

## 1. Overview

This project demonstrates a complete, end-to-end RAG pipeline:

1. Documents are submitted through the UI and stored in Supabase.
2. Document text is chunked into overlapping segments.
3. Each chunk is embedded using OpenAI's `text-embedding-3-small` model
   and stored alongside its vector in Postgres via `pgvector`.
4. When a user asks a question, the question is embedded and matched
   against stored chunks using cosine similarity search (via a Postgres
   RPC function).
5. The most relevant chunks are passed to an OpenAI chat model, which is
   instructed to answer **only** using that retrieved context — if the
   context is insufficient, it returns an explicit "I don't know" style
   fallback instead of hallucinating.

## 2. Features

- Add documents by title and content through a simple web UI.
- Automatic text chunking with configurable size and overlap.
- Batch embedding generation via OpenAI.
- Vector storage and similarity search via Supabase/pgvector.
- Grounded question answering with source citations and similarity scores.
- Strict layered architecture separating UI, API, services, data access,
  AI integration, and RAG orchestration.
- Full TypeScript typing across client and server boundaries.
- Ready to deploy to Vercel.

## 3. Tech Stack

| Layer          | Technology                              |
| -------------- | ---------------------------------------- |
| Framework      | Next.js 15 (App Router)                  |
| Language       | TypeScript                               |
| Styling        | Tailwind CSS                             |
| Database       | Supabase PostgreSQL + pgvector           |
| AI Provider    | OpenAI (embeddings + chat completions)   |
| Deployment     | Vercel                                   |
| Linting        | ESLint (`next/core-web-vitals`, TS rules)|

## 4. Architecture

The project follows a strict layered architecture. Each layer has a single
responsibility and only depends on the layer(s) beneath it:

```
UI (React components/pages)
   │  fetch() calls only
   ▼
API routes (Next.js route handlers)
   │  validate → call service → return JSON
   ▼
RAG / Service layer (src/server/rag)
   │  orchestrates chunking, embeddings, retrieval, prompting
   ▼
AI layer (src/server/ai)        Repository / Data layer (src/server/db)
   │  OpenAI SDK calls               │  Supabase queries only
   ▼                                 ▼
   OpenAI API                        Supabase PostgreSQL (pgvector)
```

**Rules enforced throughout the codebase:**

- React components never call OpenAI or Supabase directly — they only call
  `/api/*` routes via `fetch`.
- API routes contain no business logic: they validate the request body,
  call a service function, and return a JSON response.
- All RAG logic (chunking, prompt construction, retrieval, generation)
  lives in `src/server/rag`, not in API routes.
- All database queries live in `src/server/db` repositories — services
  never talk to Supabase directly.
- `SUPABASE_SERVICE_ROLE_KEY` is only ever read inside
  `src/server/db/supabaseAdmin.ts`.
- `OPENAI_API_KEY` is only ever read inside `src/server/ai/openaiClient.ts`.
- Every request/response shape has an explicit TypeScript interface in
  `src/types`.

## 5. Folder Structure

```
src/
  app/
    layout.tsx              Root layout + global nav
    page.tsx                Home page (explains the project)
    ingest/page.tsx         Add Document page
    ask/page.tsx            Ask a Question page
    api/
      documents/route.ts    POST /api/documents
      ask/route.ts          POST /api/ask

  components/
    layout/                 Header, Container
    documents/              DocumentForm (client component)
    ask/                    AskForm, AnswerPanel, SourceCard
    ui/                     Button, Input, Textarea, Alert, LoadingSpinner

  lib/
    env.ts                  Server environment validation
    errors.ts               AppError hierarchy + error formatting
    constants.ts            Shared tunable constants

  server/
    ai/
      openaiClient.ts       OpenAI SDK singleton (only place API key is read)
      embeddingService.ts   Embedding generation
      chatService.ts        Chat completion generation
    db/
      supabaseAdmin.ts      Supabase service-role client singleton
      documentRepository.ts Document CRUD
      chunkRepository.ts    Chunk inserts + vector similarity search (RPC)
    rag/
      chunkText.ts          Text cleaning + chunking
      promptBuilder.ts       Grounded prompt construction
      retrievalService.ts   Embed question + retrieve top-k chunks
      ragService.ts         Orchestrates ingestion + question answering
    validators/
      documentValidators.ts Request validation for document ingestion
      askValidators.ts      Request validation for asking questions

  types/
    document.ts             Document + chunk domain types
    rag.ts                  RAG-specific types (retrieved chunks, answers)
    api.ts                  Request/response contracts for API routes

supabase/
  schema.sql                Tables, indexes, and the match RPC function

.env.example
README.md
```

## 6. RAG Pipeline Explanation

**Ingestion (`POST /api/documents`):**

1. Validate `title` and `content` (`documentValidators.ts`).
2. Persist the document row in `documents` (`documentRepository.ts`).
3. Clean and split the content into overlapping chunks of ~800–1000
   characters with ~150–200 character overlap (`chunkText.ts`), breaking on
   paragraph/sentence boundaries where possible.
4. Batch-embed all chunks in a single OpenAI call (`embeddingService.ts`).
5. Bulk-insert chunks with their embeddings into `document_chunks`
   (`chunkRepository.ts`).

**Question answering (`POST /api/ask`):**

1. Validate `question` and optional `topK` (`askValidators.ts`).
2. Embed the question (`embeddingService.ts`).
3. Call the `match_document_chunks` Postgres RPC function, which performs
   cosine similarity search over `document_chunks.embedding` and returns
   the top `topK` chunks above a similarity threshold (`chunkRepository.ts`
   / `retrievalService.ts`).
4. If no chunks clear the threshold, return the fixed fallback answer
   without calling the chat model.
5. Otherwise, build a grounded prompt that instructs the model to answer
   **only** from the retrieved context (`promptBuilder.ts`) and generate
   the final answer (`chatService.ts`).
6. Return the answer plus the source chunks (with similarity scores) to
   the client.

## 7. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run the contents of
   [`supabase/schema.sql`](supabase/schema.sql). This will:
   - Enable the `vector` and `pgcrypto` extensions.
   - Create the `documents` and `document_chunks` tables.
   - Create a B-tree index on `document_chunks.document_id`.
   - Create an IVFFlat vector index on `document_chunks.embedding` for
     fast approximate cosine similarity search.
   - Create the `match_document_chunks` RPC function.
3. Copy your **Project URL**, **anon public key**, and **service_role
   key** from Project Settings → API into your `.env.local` file (see
   below).

> As your knowledge base grows past a few thousand chunks, consider
> tuning the IVFFlat `lists` parameter (roughly `sqrt(row_count)`) and
> running `ANALYZE document_chunks;` for better query planning.

## 8. Database Schema

```sql
documents
  id          uuid primary key default gen_random_uuid()
  title       text not null
  content     text not null
  created_at  timestamptz not null default now()

document_chunks
  id            uuid primary key default gen_random_uuid()
  document_id   uuid not null references documents(id) on delete cascade
  chunk_index   integer not null
  content       text not null
  embedding     vector(1536) not null
  created_at    timestamptz not null default now()
```

The `match_document_chunks(query_embedding, match_count, similarity_threshold)`
RPC function returns `(id, document_id, content, similarity)`, ordered by
highest cosine similarity first, filtering out rows below
`similarity_threshold`.

See the full definition in [`supabase/schema.sql`](supabase/schema.sql).

## 9. Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```
OPENAI_API_KEY=
OPENAI_CHAT_MODEL=gpt-4o-mini
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

| Variable | Description |
| --- | --- |
| `OPENAI_API_KEY` | Secret key for the OpenAI API. Server-only. |
| `OPENAI_CHAT_MODEL` | Chat model used for answer generation. Falls back to `gpt-4o-mini` if unset. |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key, reserved for future client-side Supabase usage (not currently used server-side). |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret service-role key used for all server-side database access. Never exposed to the client. |

## 10. Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local
# then fill in .env.local with your OpenAI + Supabase credentials

# 3. Set up the database
# Run supabase/schema.sql in the Supabase SQL editor

# 4. Run the dev server
npm run dev
```

Visit `http://localhost:3000`:

- `/` — overview of the project and pipeline
- `/ingest` — add a document to the knowledge base
- `/ask` — ask a question and view the grounded answer + sources

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build locally
npm run lint     # run ESLint
```

## 11. Vercel Deployment

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. Import the project into [Vercel](https://vercel.com/new).
3. Add the environment variables from `.env.example` in the Vercel
   project's **Settings → Environment Variables** (for Production,
   Preview, and Development as needed).
4. Deploy. Vercel will run `npm run build` automatically.
5. Make sure your Supabase schema (`supabase/schema.sql`) has already been
   applied to the database you're pointing at.

No additional configuration is required — API routes run as serverless
functions and read their credentials from environment variables at
request time.

## 12. Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` are read exclusively on
  the server (`src/server/db/supabaseAdmin.ts` and
  `src/server/ai/openaiClient.ts` respectively) and are never sent to the
  browser.
- All user input is validated server-side (`src/server/validators`) before
  touching the database or calling OpenAI — including length limits on
  titles, content, and questions.
- The chat prompt explicitly restricts the model to the retrieved context,
  reducing the risk of hallucinated or leaked information.
- Row-level security (RLS) is not enabled on the tables in
  `supabase/schema.sql` because all access goes through the trusted
  service-role key on the server. If you ever expose direct client-side
  Supabase access (e.g. using the anon key), enable RLS policies first.
- A known moderate-severity advisory exists in a `postcss` version bundled
  internally by Next.js itself (not a direct dependency of this project);
  it affects Next's own build tooling rather than application code. It
  will be resolved by an upstream Next.js patch release.

## 13. Future Improvements

- Support additional document formats (PDF, DOCX, URLs) with server-side
  text extraction.
- Add authentication so knowledge bases are scoped per user/organization.
- Stream chat completions to the UI token-by-token.
- Add pagination and management (list/delete) for ingested documents.
- Add automated evaluation of retrieval quality and answer groundedness.
- Add rate limiting on the API routes.

## 14. CV Bullet Points

- Built and deployed a production-style RAG knowledge assistant using
  Next.js, TypeScript, OpenAI embeddings, Supabase PostgreSQL, and
  pgvector.
- Implemented a complete RAG pipeline with document ingestion, chunking,
  embedding generation, semantic retrieval, prompt construction, and
  grounded answer generation.
- Designed a clean layered architecture with API routes, service layer,
  repositories, AI services, validation, and reusable UI components.
- Secured server-side credentials through Next.js API routes and deployed
  the application on Vercel with documented environment setup.
