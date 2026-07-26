<p align="center">
  <img src="app/icon.svg" width="72" alt="Groundquote logo">
</p>

# Groundquote

**Ask the text. Check the source.**

Groundquote is a focused retrieval-augmented generation product for policies,
contracts, research notes, and technical documentation. Paste or upload text,
ask one question, and get a short answer backed by the exact source passages.
When the document does not contain enough evidence, Groundquote says so.

It is intentionally small enough to understand in one sitting and careful
enough to use in the real world.

## Why this exists

Many document-chat demos optimize for a fluent answer. Groundquote optimizes for a
*verifiable* answer:

- Every generated claim must contain an inline source citation.
- Citation IDs are validated by application code, not trusted from the model.
- Weak retrieval takes a safe no-answer path.
- Uploaded text is processed in request memory and is not persisted.
- Source text is treated as untrusted data to reduce prompt-injection risk.
- A helpful / not-helpful control creates a lightweight human evaluation loop.
- If the model API is unavailable, the product still returns transparent,
  extractive evidence instead of failing or inventing an answer.

## How it works

```text
document → clean + chunk → BM25 keyword ranking ─┐
                                                  ├→ rank fusion → top evidence
question → embedding → semantic ranking ─────────┘
                                                         ↓
                                              evidence-constrained answer
                                                         ↓
                                       validate citations or safely abstain
```

The semantic branch is enabled when `OPENAI_API_KEY` is configured. Retrieval
falls back to deterministic BM25 ranking if embeddings are unavailable.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app works immediately
in evidence-only mode. Add `OPENAI_API_KEY` for generated answers and hybrid
retrieval.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | No | Enables embeddings and synthesized answers |
| `OPENAI_MODEL` | No | Defaults to `gpt-5.6-luna` |
| `OPENAI_EMBEDDING_MODEL` | No | Defaults to `text-embedding-3-small` |
| `SUPABASE_URL` | No | Enables aggregate anonymous feedback |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server-only key for feedback writes |

Never prefix the service-role key with `NEXT_PUBLIC_`.

## Persist anonymous ratings

Groundquote always remembers a rating in the visitor's browser. To also collect
aggregate ratings:

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
3. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the server environment.

Only the answer ID, helpful/not-helpful choice, answer mode, and timestamp are
stored. Document text and questions are not included.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test:run
npm run eval
npm run build
```

The tests cover chunking, retrieval, abstention, and citation validation. The
small evaluation set in [`evals/cases.json`](evals/cases.json) is designed to be
easy to extend with real failure cases.

## Deploy

The fastest path is Vercel:

1. Import this GitHub repository into Vercel.
2. Add `OPENAI_API_KEY` as an encrypted environment variable.
3. Add a monthly API usage limit and deploy.
4. Optionally configure Supabase feedback using the steps above.

The public API applies request-size limits and a best-effort in-memory rate
limit. For a high-traffic deployment, replace it with a distributed limiter
such as Vercel KV or Upstash Redis.

## Deliberate boundaries

- Text, Markdown, CSV, and JSON are supported; PDF parsing is deliberately out
  of scope to keep the trust boundary and deployment small.
- Documents are limited to 60,000 characters.
- This is single-document question answering, not a persistent knowledge base.
- Retrieval confidence is a useful signal, not a calibrated probability.

## Stack

Next.js, TypeScript, OpenAI Responses API, OpenAI embeddings, Zod, Vitest, and
optional Supabase feedback storage.

## License

MIT
