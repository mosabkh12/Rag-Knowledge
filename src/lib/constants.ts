export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;
export const DEFAULT_CHAT_MODEL = "gpt-4o-mini";

export const CHUNK_TARGET_SIZE = 900;
export const CHUNK_MIN_SIZE = 800;
export const CHUNK_MAX_SIZE = 1000;
export const CHUNK_OVERLAP = 180;

export const DOCUMENT_TITLE_MAX_LENGTH = 120;
export const DOCUMENT_CONTENT_MIN_LENGTH = 50;
export const DOCUMENT_CONTENT_MAX_LENGTH = 300_000;

export const FILE_MAX_SIZE_BYTES = 15 * 1024 * 1024;
export const SUPPORTED_FILE_EXTENSIONS = [".txt", ".md", ".markdown", ".pdf", ".docx"];

export const DOCUMENT_PREVIEW_LENGTH = 220;

export const QUESTION_MAX_LENGTH = 500;
export const DEFAULT_TOP_K = 5;
export const MIN_TOP_K = 1;
export const MAX_TOP_K = 10;
export const SIMILARITY_THRESHOLD = 0.2;

export const NO_CONTEXT_ANSWER =
  "I could not find enough information in the uploaded documents to answer this question.";
