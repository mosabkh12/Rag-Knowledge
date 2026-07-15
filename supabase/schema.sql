-- RAG Knowledge Base Assistant - Database Schema
--
-- This is a consolidated reference of the full current schema — useful
-- for a quick fresh setup. The source of truth for changes is
-- supabase/migrations/, applied in order; whenever a new migration is
-- added, fold the same change in here too so this file stays a
-- complete, accurate snapshot. Safe to re-run: every statement is
-- idempotent.

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

-- Profile row for every authenticated user, mirroring auth.users with
-- app-specific fields (role-based access control lives here, not in auth.users).
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Track who added each document so owners (and admins) can delete it.
alter table documents
  add column if not exists created_by uuid references profiles(id) on delete set null;

-- Track the original uploaded file (stored in the "document-files"
-- Supabase Storage bucket) alongside the extracted text, so uploads
-- like PDFs remain viewable in their original form from the Library.
alter table documents
  add column if not exists storage_path text,
  add column if not exists file_name text,
  add column if not exists mime_type text;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists document_chunks_document_id_idx
  on document_chunks (document_id);

create index if not exists documents_created_by_idx
  on documents (created_by);

-- IVFFlat index for approximate nearest-neighbor cosine similarity search.
-- `lists` should be tuned to roughly sqrt(row_count) as the table grows;
-- 100 is a reasonable default for small-to-medium knowledge bases.
create index if not exists document_chunks_embedding_idx
  on document_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ---------------------------------------------------------------------------
-- Auth trigger: auto-create a profile row whenever a new user signs up.
-- ---------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- All application writes go through the service-role key (server-side
-- only), which bypasses RLS entirely — these policies are defense in
-- depth in case the anon/authenticated key is ever used directly.
-- ---------------------------------------------------------------------------
alter table documents enable row level security;
alter table document_chunks enable row level security;
alter table profiles enable row level security;

drop policy if exists "Authenticated users can view documents" on documents;
create policy "Authenticated users can view documents"
  on documents for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can view chunks" on document_chunks;
create policy "Authenticated users can view chunks"
  on document_chunks for select
  to authenticated
  using (true);

drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

-- A policy on `profiles` that queries `profiles` again (even for a
-- different row) makes Postgres re-evaluate every SELECT policy on the
-- table for that inner query too, including this one — infinite
-- recursion. Routing the check through a SECURITY DEFINER function
-- breaks the cycle: the function body runs as its owner (which bypasses
-- RLS), so the inner lookup never re-triggers policy evaluation.
create or replace function is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = user_id and role = 'admin'
  );
$$;

drop policy if exists "Admins can view all profiles" on profiles;
create policy "Admins can view all profiles"
  on profiles for select
  to authenticated
  using (is_admin(auth.uid()));

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
