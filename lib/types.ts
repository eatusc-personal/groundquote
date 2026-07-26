export type FeedbackRating = "helpful" | "not_helpful";

export type Evidence = {
  id: number;
  chunkIndex: number;
  text: string;
  score: number;
  matchedTerms: string[];
};

export type RetrievalDetails = {
  method: "hybrid" | "keyword";
  chunkCount: number;
  confidence: number;
  elapsedMs: number;
};

export type AskResponse = {
  answerId: string;
  answer: string;
  citations: number[];
  evidence: Evidence[];
  sufficient: boolean;
  mode: "generated" | "extractive";
  retrieval: RetrievalDetails;
};

export type DocumentChunk = {
  index: number;
  text: string;
};
