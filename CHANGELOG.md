# Changelog

Groundquote follows semantic versioning for public releases.

## 2026-11-07

- Answers are now written by Claude (structured JSON output, same schema and
  citation validation as before) when `ANTHROPIC_API_KEY` is set. OpenAI stays
  as the fallback writer and remains the embedding provider. A refusal or error
  still falls back to the cited extractive answer.
- The privacy page names both providers and states that embeddings send the
  document text to OpenAI.
- `/api/ask` now logs why an answer fell back (provider, status, code), so a
  broken key or model no longer looks like a working demo.

## 1.2.0 — 2026-07-26

- Added a practical RAG guide covering retrieval misses, unsupported details,
  stale sources, evaluation, and safe abstention.
- Added share controls and privacy-friendly traffic measurement.
- Added comprehensive unit, API, browser, mobile, accessibility, security, and
  public-discovery tests.
- Fixed a false-positive retrieval case where “paid” in an allowance policy
  could be mistaken for evidence about paid vacation.
- Added real product screenshots, a short demo, a test matrix, and human launch
  copy.

## 1.1.0 — 2026-07-25

- Added the interactive RAG learning lab and grounding animation.
- Added the privacy page, security headers, crawler files, social images, and
  public-launch documentation.
- Added feedback controls and private vulnerability reporting.

## 1.0.0 — 2026-07-24

- Shipped single-document question answering with visible evidence, validated
  citations, hybrid retrieval, and a deterministic evidence-only fallback.
