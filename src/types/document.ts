export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string | null;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
  createdAt: string;
}

export interface NewDocumentInput {
  title: string;
  content: string;
  createdBy: string | null;
}

export interface DocumentSummary {
  id: string;
  title: string;
  createdAt: string;
  createdBy: string | null;
  chunkCount: number;
  contentPreview: string;
}

export interface NewChunkInput {
  documentId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
}
