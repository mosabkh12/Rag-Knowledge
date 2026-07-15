-- Track the original uploaded file (stored in the "document-files"
-- Supabase Storage bucket) alongside the extracted text, so uploads
-- like PDFs remain viewable in their original form from the Library.
alter table documents
  add column if not exists storage_path text,
  add column if not exists file_name text,
  add column if not exists mime_type text;
