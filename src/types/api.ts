import type { RetrievedChunk } from "./rag";
import type { DocumentSummary } from "./document";
import type { Profile, UserRole } from "./auth";

export interface CreateDocumentRequest {
  title: string;
  content: string;
}

export interface CreateDocumentResponse {
  documentId: string;
  chunksCreated: number;
}

export interface ListDocumentsResponse {
  documents: DocumentSummary[];
}

export interface DocumentDetailResponse {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string | null;
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

export interface ListUsersResponse {
  users: Profile[];
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface UpdateUserRoleResponse {
  user: Profile;
}
