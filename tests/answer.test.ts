import { describe, expect, it } from "vitest";
import {
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
});
