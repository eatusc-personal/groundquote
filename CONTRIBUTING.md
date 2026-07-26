# Contributing to Groundquote

Groundquote is deliberately focused. The best contributions make evidence
easier to inspect, improve safe abstention, add a reproducible failure case, or
make the product simpler to use.

## Before opening a pull request

1. Open an issue describing the user problem.
2. Keep the solution small and avoid adding persistent document storage.
3. Add or update a test for behavior changes.
4. Do not commit documents, prompts, credentials, or personal data.
5. Run the full verification suite:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run eval
npm run audit:prod
npm run build
```

## Retrieval evaluation cases

Add compact, synthetic examples to [`evals/cases.json`](evals/cases.json).
Include both a question the source can answer and a nearby question that should
trigger abstention. Avoid copyrighted or sensitive source text.

## Security issues

Do not report vulnerabilities in a public issue. Follow
[`SECURITY.md`](SECURITY.md) and use GitHub private vulnerability reporting.
