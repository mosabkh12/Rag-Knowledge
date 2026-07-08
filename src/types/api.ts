import type { RetrievedChunk } from "./rag";

export interface CreateDocumentRequest {
  title: string;
  content: string;
}

export interface CreateDocumentResponse {
  documentId: string;
  chunksCreated: number;
}

export interface AskRequest {
  question: string;
  topK?: number;
}

export interface AskResponse {
  answer: string;
  sources: RetrievedChunk[];
}

export interface ApiErrorResponse {
  error: string;
}
