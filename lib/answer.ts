import { z } from "zod";
import type { Evidence } from "./types";

export const NO_ANSWER =
  "I don’t have enough information in this document to answer that confidently.";

export const GroundedAnswerSchema = z.object({
  answer: z.string().min(1).max(2_000),
  citations: z.array(z.number().int().positive()).max(4),
  sufficient: z.boolean(),
});

export function buildEvidenceBlock(evidence: Evidence[]) {
  return evidence
    .map((item) => `[${item.id}] PASSAGE ${item.chunkIndex + 1}\n${item.text}`)
    .join("\n\n");
}

export function validateGroundedAnswer(
  input: z.infer<typeof GroundedAnswerSchema>,
  evidence: Evidence[],
) {
  const validIds = new Set(evidence.map((item) => item.id));
  const citations = [...new Set(input.citations)].filter((id) => validIds.has(id));
  const citedInAnswer = [...input.answer.matchAll(/\[(\d+)\]/g)].map((match) =>
    Number(match[1]),
  );
  const invalidInlineCitation = citedInAnswer.some((id) => !validIds.has(id));

  if (
    !input.sufficient ||
    citations.length === 0 ||
    citedInAnswer.length === 0 ||
    invalidInlineCitation
  ) {
    return { answer: NO_ANSWER, citations: [] as number[], sufficient: false };
  }

  return { answer: input.answer.trim(), citations, sufficient: true };
}

export function extractiveAnswer(evidence: Evidence[]) {
  if (evidence.length === 0) {
    return { answer: NO_ANSWER, citations: [] as number[], sufficient: false };
  }

  const primary = evidence[0];
  const secondary = evidence.find(
    (item) => item.id !== primary.id && item.matchedTerms.length > 0,
  );
  const shorten = (text: string) =>
    text.length > 460 ? `${text.slice(0, 457).trimEnd()}…` : text;
  const parts = [
    `The strongest relevant passage says: “${shorten(primary.text)}” [${primary.id}]`,
  ];

  if (secondary) {
    parts.push(
      `A second relevant passage adds: “${shorten(secondary.text)}” [${secondary.id}]`,
    );
  }

  return {
    answer: parts.join("\n\n"),
    citations: secondary ? [primary.id, secondary.id] : [primary.id],
    sufficient: true,
  };
}
