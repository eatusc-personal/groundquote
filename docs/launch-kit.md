# Groundquote launch kit

These are starting points, not scripts. Change a sentence if you would not say
it out loud.

## One-line description

Groundquote lets you ask a question about a document, see the exact passages
behind the answer, and get a clear “not enough information” when the source is
silent.

## LinkedIn

I built a small RAG product called Groundquote.

You paste a policy, contract, research note, or technical document and ask one
question. It shows the passages behind the answer, checks the citation IDs in
code, and stops when the document does not contain enough evidence.

The interesting part for me was not making another chat box. It was making the
failure path useful. During browser testing I found a real false positive:
“paid” in a sentence about unused allowance funds was being treated as evidence
for a question about paid vacation. That case is now fixed and lives in the
public test suite.

It is free, open source, and works without an API key in evidence-only mode:
https://groundquote.vercel.app

Source and test matrix:
https://github.com/eatusc/groundquote

## Show HN

**Title:** Show HN: Groundquote – document Q&A that shows evidence and knows when to stop

I made Groundquote because fluent document-chat answers are hard to trust when
you cannot quickly compare them with the source.

Paste text, ask one focused question, and it returns a cited answer with the
retrieved passages beside it. Weak evidence takes a deliberate no-answer path.
The hosted version works in deterministic evidence mode; the repository also
supports optional embeddings and generated answers.

The implementation and test matrix are public. I would especially value
feedback on citation usability and examples where the abstention threshold is
too cautious or too loose.

App: https://groundquote.vercel.app  
Source: https://github.com/eatusc/groundquote

## Reddit or Indie Hackers

I wanted a document Q&A tool where the evidence was part of the normal
workflow—not hidden behind a “sources” button.

Groundquote puts the retrieved passages beside the answer and safely stops when
the source is not strong enough. It is deliberately a single-document tool, so
you can understand the whole path from chunking to retrieval to citation
validation.

I also published the tests, including supported questions, missing information,
bad payloads, cross-origin requests, mobile layout, accessibility, and a
retrieval false positive the browser suite caught.

I would love practical feedback: does clicking from a claim to its passage feel
fast enough, and is the no-answer wording helpful?

https://groundquote.vercel.app

## Short post

Built Groundquote: ask a document, inspect the evidence, and get a straight
“not enough information” instead of a confident guess. Free, open source, and
tested against the unglamorous failure cases. https://groundquote.vercel.app

## Portfolio description

Built and deployed a retrieval-augmented document Q&A product with BM25 and
optional semantic retrieval, reciprocal-rank fusion, evidence thresholds,
structured generation, server-side citation validation, and a deterministic
fallback. Added API, security, accessibility, mobile, and end-to-end tests plus
a safe no-answer path for unsupported questions.

## Interview explanation

“I kept the product intentionally narrow: one document and one question. That
let me spend time on the parts that make RAG dependable—retrieval quality,
visible evidence, citation validation, and knowing when not to answer. The
browser tests even caught a realistic false positive around the word ‘paid,’ so
I tightened the evidence threshold and kept that case as a regression test.”
