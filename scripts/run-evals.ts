import cases from "../evals/cases.json";
import { chunkDocument } from "../lib/chunk";
import {
  hasEnoughEvidence,
  rankByBm25,
  selectEvidence,
} from "../lib/retrieval";

let passed = 0;

for (const testCase of cases) {
  const chunks = chunkDocument(testCase.document, 280, 40);
  const ranking = rankByBm25(chunks, testCase.question);
  const evidence = selectEvidence(ranking, undefined, 3);
  const shouldAnswer = hasEnoughEvidence(evidence, testCase.question);
  const combined = evidence.map((item) => item.text.toLowerCase()).join(" ");
  const foundTerms = testCase.expectedTerms.every((term) =>
    combined.includes(term.toLowerCase()),
  );
  const success = shouldAnswer === testCase.shouldAnswer && foundTerms;

  if (success) passed += 1;
  process.stdout.write(`${success ? "✓" : "✗"} ${testCase.name}\n`);
}

process.stdout.write(`\n${passed}/${cases.length} retrieval checks passed\n`);
if (passed !== cases.length) process.exitCode = 1;
