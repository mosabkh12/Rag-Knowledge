-- RAG Knowledge Base Assistant - Database Schema
-- Run this file in the Supabase SQL editor (or via `supabase db push`).

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists vector;
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists document_chunks_document_id_idx
  on document_chunks (document_id);

-- IVFFlat index for approximate nearest-neighbor cosine similarity search.
-- `lists` should be tuned to roughly sqrt(row_count) as the table grows;
-- 100 is a reasonable default for small-to-medium knowledge bases.
create index if not exists document_chunks_embedding_idx
  on document_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ---------------------------------------------------------------------------
-- RPC: match_document_chunks
-- Performs cosine similarity search over document_chunks and returns the
-- top matches above the similarity threshold, ordered by best match first.
-- ---------------------------------------------------------------------------
create or replace function match_document_chunks(
  query_embedding vector(1536),
  match_count int default 5,
  similarity_threshold float default 0.2
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  similarity float
)
language sql
stable
set ivfflat.probes = 100
as $$
  select
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.content,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where 1 - (document_chunks.embedding <=> query_embedding) > similarity_threshold
  order by document_chunks.embedding <=> query_embedding asc
  limit match_count;
$$;
