import type { DocumentChunk, Evidence } from "./types";

const STOP_WORDS = new Set([
  "a",
  "about",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "can",
  "days",
  "do",
  "does",
  "employee",
  "employees",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "many",
  "new",
  "of",
  "on",
  "or",
  "provide",
  "provided",
  "receive",
  "received",
  "receives",
  "that",
  "the",
  "their",
  "this",
  "to",
  "was",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "with",
]);

export function tokenize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function termCounts(tokens: string[]) {
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  return counts;
}

export type RankedChunk = {
  chunk: DocumentChunk;
  score: number;
  matchedTerms: string[];
};

export function rankByBm25(
  chunks: DocumentChunk[],
  query: string,
): RankedChunk[] {
  if (chunks.length === 0) return [];
  const queryTerms = [...new Set(tokenize(query))];
  if (queryTerms.length === 0) return [];

  const tokenized = chunks.map((chunk) => tokenize(chunk.text));
  const averageLength =
    tokenized.reduce((sum, tokens) => sum + tokens.length, 0) / chunks.length || 1;
  const documentFrequency = new Map<string, number>();

  for (const term of queryTerms) {
    documentFrequency.set(
      term,
      tokenized.filter((tokens) => tokens.includes(term)).length,
    );
  }

  const k1 = 1.5;
  const b = 0.75;

  return chunks
    .map((chunk, index) => {
      const tokens = tokenized[index];
      const counts = termCounts(tokens);
      const matchedTerms = queryTerms.filter((term) => counts.has(term));
      let score = 0;

      for (const term of matchedTerms) {
        const frequency = counts.get(term) ?? 0;
        const documentsWithTerm = documentFrequency.get(term) ?? 0;
        const inverseDocumentFrequency = Math.log(
          1 + (chunks.length - documentsWithTerm + 0.5) / (documentsWithTerm + 0.5),
        );
        const denominator =
          frequency + k1 * (1 - b + b * (tokens.length / averageLength));
        score +=
          inverseDocumentFrequency * ((frequency * (k1 + 1)) / denominator);
      }

      return { chunk, score, matchedTerms };
    })
    .sort((left, right) => right.score - left.score);
}

export function cosineSimilarity(left: number[], right: number[]) {
  if (left.length === 0 || left.length !== right.length) return 0;
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += right[index] ** 2;
  }

  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
  return denominator === 0 ? 0 : dot / denominator;
}

export function rankByEmbedding(
  chunks: DocumentChunk[],
  queryEmbedding: number[],
  chunkEmbeddings: number[][],
): RankedChunk[] {
  return chunks
    .map((chunk, index) => ({
      chunk,
      score: Math.max(
        0,
        cosineSimilarity(queryEmbedding, chunkEmbeddings[index] ?? []),
      ),
      matchedTerms: [] as string[],
    }))
    .sort((left, right) => right.score - left.score);
}

export function reciprocalRankFusion(
  rankings: RankedChunk[][],
  limit = 4,
): RankedChunk[] {
  const fused = new Map<
    number,
    { chunk: DocumentChunk; score: number; matchedTerms: Set<string> }
  >();
  const k = 60;

  for (const ranking of rankings) {
    ranking.forEach((item, rank) => {
      const existing = fused.get(item.chunk.index) ?? {
        chunk: item.chunk,
        score: 0,
        matchedTerms: new Set<string>(),
      };
      existing.score += 1 / (k + rank + 1);
      item.matchedTerms.forEach((term) => existing.matchedTerms.add(term));
      fused.set(item.chunk.index, existing);
    });
  }

  const sorted = [...fused.values()].sort((left, right) => right.score - left.score);
  const topScore = sorted[0]?.score || 1;

  return sorted.slice(0, limit).map((item) => ({
    chunk: item.chunk,
    score: item.score / topScore,
    matchedTerms: [...item.matchedTerms],
  }));
}

export function selectEvidence(
  lexicalRanking: RankedChunk[],
  semanticRanking?: RankedChunk[],
  limit = 4,
): Evidence[] {
  const rankings = semanticRanking
    ? [lexicalRanking, semanticRanking]
    : [lexicalRanking];
  const fused = reciprocalRankFusion(rankings, Math.max(limit * 2, limit));
  const lexicalByIndex = new Map(
    lexicalRanking.map((item) => [item.chunk.index, item]),
  );

  const selected: RankedChunk[] = [];
  for (const item of fused) {
    const lexical = lexicalByIndex.get(item.chunk.index);
    const candidate = {
      ...item,
      matchedTerms: lexical?.matchedTerms ?? [],
    };

    const duplicatesExisting = selected.some((existing) => {
      const existingTerms = new Set(tokenize(existing.chunk.text));
      const candidateTerms = new Set(tokenize(candidate.chunk.text));
      const overlap = [...candidateTerms].filter((term) =>
        existingTerms.has(term),
      ).length;
      return overlap / Math.max(1, Math.min(existingTerms.size, candidateTerms.size)) > 0.85;
    });

    if (!duplicatesExisting) selected.push(candidate);
    if (selected.length === limit) break;
  }

  return selected.map((item, index) => ({
    id: index + 1,
    chunkIndex: item.chunk.index,
    text: item.chunk.text,
    score: Number(item.score.toFixed(3)),
    matchedTerms: item.matchedTerms,
  }));
}

export function retrievalConfidence(
  evidence: Evidence[],
  question: string,
  semantic = false,
) {
  if (evidence.length === 0) return 0;
  const queryTerms = new Set(tokenize(question));
  const matched = new Set(evidence.flatMap((item) => item.matchedTerms));
  const lexicalCoverage = matched.size / Math.max(1, queryTerms.size);
  const rankStrength = evidence[0].score;
  const semanticFloor = semantic ? 0.18 : 0;

  return Math.min(
    1,
    Number((lexicalCoverage * 0.72 + rankStrength * 0.1 + semanticFloor).toFixed(3)),
  );
}

export function hasEnoughEvidence(
  evidence: Evidence[],
  question: string,
  semantic = false,
) {
  if (evidence.length === 0) return false;
  const contentTerms = tokenize(question);
  const lexicalMatches = new Set(evidence.flatMap((item) => item.matchedTerms));
  const minimumMatches = contentTerms.length >= 6 ? 2 : 1;

  if (lexicalMatches.size >= minimumMatches) return true;
  return semantic && evidence[0].score >= 0.9;
}
