export interface RetrievedChunk {
  id: string;
  documentId: string;
  content: string;
  similarity: number;
}

export interface RagAnswer {
  answer: string;
  sources: RetrievedChunk[];
}

export interface TextChunk {
  chunkIndex: number;
  content: string;
}
