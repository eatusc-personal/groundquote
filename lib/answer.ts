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
  const primaryTerms = new Set(primary.matchedTerms);
  const secondary = evidence.find(
    (item) =>
      item.id !== primary.id &&
      item.matchedTerms.some((term) => !primaryTerms.has(term)),
  );
  const excerpt = (item: Evidence) => {
    const sentences =
      item.text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) =>
        sentence.trim(),
      ) ?? [item.text];
    const terms = new Set(item.matchedTerms.map((term) => term.toLowerCase()));
    const ranked = sentences
      .map((sentence, index) => ({
        sentence,
        index,
        score: [...terms].filter((term) =>
          sentence.toLowerCase().includes(term),
        ).length,
      }))
      .filter((candidate) => candidate.score > 0)
      .sort((left, right) => right.score - left.score || left.index - right.index)
      .slice(0, 3)
      .sort((left, right) => left.index - right.index)
      .map((candidate) => candidate.sentence);
    const selected = ranked.length > 0 ? ranked : sentences.slice(0, 2);
    const complete: string[] = [];

    for (const sentence of selected) {
      const candidate = complete.length
        ? `${complete.join(" ")} ${sentence}`
        : sentence;
      if (candidate.length > 460) break;
      complete.push(sentence);
    }

    if (complete.length > 0) return complete.join(" ");
    const shortened = selected[0].slice(0, 457);
    const lastSpace = shortened.lastIndexOf(" ");
    return `${shortened.slice(0, lastSpace > 300 ? lastSpace : 457).trimEnd()}…`;
  };
  const parts = [
    `The document says: “${excerpt(primary)}” [${primary.id}]`,
  ];

  if (secondary) {
    parts.push(
      `Another passage adds: “${excerpt(secondary)}” [${secondary.id}]`,
    );
  }

  return {
    answer: parts.join("\n\n"),
    citations: secondary ? [primary.id, secondary.id] : [primary.id],
    sufficient: true,
  };
}
