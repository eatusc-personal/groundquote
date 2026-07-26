import { describe, expect, it } from "vitest";
import { chunkDocument } from "../lib/chunk";
import {
  hasEnoughEvidence,
  rankByBm25,
  selectEvidence,
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
});
