import { describe, expect, it } from "vitest";
import { chunkDocument } from "../lib/chunk";
import {
  cosineSimilarity,
  hasEnoughEvidence,
  rankByBm25,
  rankByEmbedding,
  reciprocalRankFusion,
  retrievalConfidence,
  selectEvidence,
  tokenize,
} from "../lib/retrieval";

const document = `Employees receive a $1,200 home-office allowance. It covers a desk, ergonomic chair, monitor, keyboard, mouse, webcam, or headset.

Purchases above $500 need written manager approval before purchase. Reimbursement requests require an itemized receipt and must be submitted within 45 days.

The company laptop is issued separately by IT and must be returned when employment ends.`;

describe("retrieval", () => {
  it("ranks the relevant passage first", () => {
    const chunks = chunkDocument(document, 190, 20);
    const ranking = rankByBm25(chunks, "Which purchases need manager approval?");

    expect(ranking[0].chunk.text).toContain("manager approval");
    expect(ranking[0].matchedTerms).toContain("approval");
  });

  it("abstains when the document has no meaningful overlap", () => {
    const chunks = chunkDocument(document, 190, 20);
    const ranking = rankByBm25(chunks, "How many vacation days are provided?");
    const evidence = selectEvidence(ranking);

    expect(hasEnoughEvidence(evidence, "How many vacation days are provided?")).toBe(
      false,
    );
  });

  it("does not answer a vacation question from an unrelated mention of paid", () => {
    const trickyDocument = `${document}

Unused allowance funds cannot be paid out as cash.`;
    const question = "How many paid vacation days do I get?";
    const chunks = chunkDocument(trickyDocument, 190, 20);
    const evidence = selectEvidence(rankByBm25(chunks, question));

    expect(hasEnoughEvidence(evidence, question)).toBe(false);
  });

  it("normalizes punctuation and removes common question words", () => {
    expect(tokenize("What does the café provide for employees?")).toEqual([
      "cafe",
    ]);
  });

  it("calculates cosine similarity safely", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBe(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
    expect(cosineSimilarity([], [])).toBe(0);
    expect(cosineSimilarity([1], [1, 2])).toBe(0);
  });

  it("ranks the closest embedding first", () => {
    const chunks = chunkDocument(document, 190, 20).slice(0, 2);
    const ranked = rankByEmbedding(chunks, [1, 0], [
      [0.1, 0.9],
      [0.9, 0.1],
    ]);

    expect(ranked[0].chunk.index).toBe(chunks[1].index);
  });

  it("combines rankings and keeps scores normalized", () => {
    const chunks = chunkDocument(document, 190, 20);
    const lexical = rankByBm25(chunks, "manager approval");
    const reversed = [...lexical].reverse();
    const fused = reciprocalRankFusion([lexical, reversed], 2);

    expect(fused).toHaveLength(2);
    expect(fused[0].score).toBe(1);
    expect(fused.every((item) => item.score <= 1)).toBe(true);
  });

  it("removes nearly duplicate evidence passages", () => {
    const chunks = [
      { index: 0, text: "A monitor and keyboard are covered by the allowance." },
      { index: 1, text: "A monitor and keyboard are covered by the allowance." },
      { index: 2, text: "Purchases over $500 require manager approval." },
    ];
    const ranked = rankByBm25(chunks, "monitor keyboard allowance approval");
    const evidence = selectEvidence(ranked, undefined, 3);

    expect(evidence).toHaveLength(2);
    expect(new Set(evidence.map((item) => item.text)).size).toBe(2);
  });

  it("reports stronger confidence when query terms are covered", () => {
    const chunks = chunkDocument(document, 190, 20);
    const question = "Which purchases need manager approval?";
    const evidence = selectEvidence(rankByBm25(chunks, question));

    expect(retrievalConfidence(evidence, question)).toBeGreaterThan(0.4);
  });

  it("can accept a very strong semantic match without lexical overlap", () => {
    const evidence = [
      {
        id: 1,
        chunkIndex: 0,
        text: "A semantically related passage.",
        score: 0.95,
        matchedTerms: [],
      },
    ];

    expect(hasEnoughEvidence(evidence, "unmatched wording", false)).toBe(false);
    expect(hasEnoughEvidence(evidence, "unmatched wording", true)).toBe(true);
  });
});
