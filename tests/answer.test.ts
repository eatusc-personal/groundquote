import { describe, expect, it } from "vitest";
import {
  buildEvidenceBlock,
  extractiveAnswer,
  NO_ANSWER,
  validateGroundedAnswer,
} from "../lib/answer";
import type { Evidence } from "../lib/types";

const evidence: Evidence[] = [
  {
    id: 1,
    chunkIndex: 0,
    text: "Purchases above $500 require manager approval.",
    score: 1,
    matchedTerms: ["purchases", "approval"],
  },
];

describe("answer validation", () => {
  it("accepts an answer with valid inline evidence", () => {
    const checked = validateGroundedAnswer(
      {
        answer: "Purchases above $500 need approval. [1]",
        citations: [1],
        sufficient: true,
      },
      evidence,
    );

    expect(checked.sufficient).toBe(true);
    expect(checked.citations).toEqual([1]);
  });

  it("rejects unsupported or invented citations", () => {
    const checked = validateGroundedAnswer(
      {
        answer: "The policy allows $2,000. [4]",
        citations: [4],
        sufficient: true,
      },
      evidence,
    );

    expect(checked.sufficient).toBe(false);
    expect(checked.answer).toBe(NO_ANSWER);
  });

  it("rejects an answer with no inline citation", () => {
    const checked = validateGroundedAnswer(
      {
        answer: "Purchases above $500 need approval.",
        citations: [1],
        sufficient: true,
      },
      evidence,
    );

    expect(checked).toEqual({
      answer: NO_ANSWER,
      citations: [],
      sufficient: false,
    });
  });

  it("deduplicates valid citation IDs", () => {
    const checked = validateGroundedAnswer(
      {
        answer: "Purchases above $500 need approval. [1]",
        citations: [1, 1],
        sufficient: true,
      },
      evidence,
    );

    expect(checked.citations).toEqual([1]);
  });

  it("respects an explicit insufficient answer", () => {
    const checked = validateGroundedAnswer(
      {
        answer: "A guess with a citation. [1]",
        citations: [1],
        sufficient: false,
      },
      evidence,
    );

    expect(checked.answer).toBe(NO_ANSWER);
  });

  it("formats retrieved passages as numbered untrusted evidence", () => {
    expect(buildEvidenceBlock(evidence)).toContain(
      "[1] PASSAGE 1\nPurchases above $500 require manager approval.",
    );
  });

  it("builds a cited extractive fallback without a model", () => {
    const result = extractiveAnswer(evidence);

    expect(result.sufficient).toBe(true);
    expect(result.citations).toEqual([1]);
    expect(result.answer).toContain("[1]");
  });

  it("selects relevant complete sentences instead of cutting a passage mid-thought", () => {
    const result = extractiveAnswer([
      {
        id: 1,
        chunkIndex: 0,
        text: "The office opens at nine. Purchases above $500 require approval. The cafeteria closes at three.",
        score: 1,
        matchedTerms: ["purchases", "approval"],
      },
    ]);

    expect(result.answer).toContain("Purchases above $500 require approval.");
    expect(result.answer).toContain("[1]");
    expect(result.answer).not.toContain("cafeteria");
  });

  it("uses a second passage only when it adds a new matched term", () => {
    const result = extractiveAnswer([
      ...evidence,
      {
        id: 2,
        chunkIndex: 1,
        text: "A manager must approve the expense.",
        score: 0.9,
        matchedTerms: ["approval"],
      },
      {
        id: 3,
        chunkIndex: 2,
        text: "An itemized receipt is also required.",
        score: 0.8,
        matchedTerms: ["receipt"],
      },
    ]);

    expect(result.citations).toEqual([1, 3]);
    expect(result.answer).not.toContain("[2]");
  });

  it("abstains when no evidence is available for an extractive answer", () => {
    expect(extractiveAnswer([])).toEqual({
      answer: NO_ANSWER,
      citations: [],
      sufficient: false,
    });
  });
});
