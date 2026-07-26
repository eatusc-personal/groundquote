"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Wordmark } from "@/components/brand";
import { TrustRail } from "@/components/trust-rail";
import type { AskResponse, FeedbackRating } from "@/lib/types";

const SAMPLE_DOCUMENT = `Northwind Remote Work Policy

Employees may work remotely up to three days per week with manager approval. Teams choose their shared in-office days so that collaboration time overlaps.

New full-time employees receive a one-time home-office equipment allowance of $1,200. It may be used for a desk, ergonomic chair, external monitor, keyboard, mouse, webcam, or headset. Laptops are issued separately by IT and do not count against the allowance.

Reimbursement requests must include an itemized receipt and be submitted within 45 days of purchase. Purchases above $500 require written manager approval before the purchase is made.

The allowance does not cover internet service, office decorations, personal tablets, or recurring subscriptions. Unused funds expire 90 days after the employee's start date and cannot be paid out as cash.

Employees who leave within six months may be asked to return equipment purchased with the allowance. Company-issued laptops must always be returned to IT.`;

const MAX_DOCUMENT_CHARS = 60_000;

function CitedAnswer({ answer }: { answer: string }) {
  const parts = answer.split(/(\[\d+\])/g);

  return (
    <p className="answer-text">
      {parts.map((part, index) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (!match) return <span key={`${part}-${index}`}>{part}</span>;
        const citation = Number(match[1]);
        return (
          <button
            className="citation-link"
            key={`${part}-${index}`}
            type="button"
            onClick={() =>
              document
                .getElementById(`evidence-${citation}`)
                ?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
            aria-label={`Jump to evidence ${citation}`}
          >
            {part}
          </button>
        );
      })}
    </p>
  );
}

export default function Home() {
  const [documentText, setDocumentText] = useState("");
  const [documentName, setDocumentName] = useState("Pasted document");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState<FeedbackRating | null>(null);

  const remaining = MAX_DOCUMENT_CHARS - documentText.length;
  const canAsk =
    documentText.trim().length >= 80 &&
    question.trim().length >= 3 &&
    !loading;

  const confidenceLabel = useMemo(() => {
    if (!result) return "";
    if (result.retrieval.confidence >= 0.72) return "Strong match";
    if (result.retrieval.confidence >= 0.42) return "Useful match";
    return "Limited match";
  }, [result]);

  function loadSample() {
    setDocumentText(SAMPLE_DOCUMENT);
    setDocumentName("Remote work policy");
    setQuestion("What equipment can a new employee buy, and what needs approval?");
    setResult(null);
    setRating(null);
    setError("");
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed =
      file.type.startsWith("text/") ||
      /\.(txt|md|markdown|csv|json)$/i.test(file.name);
    if (!allowed) {
      setError("Please choose a text, Markdown, CSV, or JSON file.");
      return;
    }
    if (file.size > 250_000) {
      setError("That file is too large. Please use a file under 250 KB.");
      return;
    }

    const text = await file.text();
    if (text.length > MAX_DOCUMENT_CHARS) {
      setError("That file contains too much text. The limit is 60,000 characters.");
      return;
    }

    setDocumentText(text);
    setDocumentName(file.name);
    setResult(null);
    setRating(null);
    setError("");
  }

  async function ask(event: FormEvent) {
    event.preventDefault();
    if (!canAsk) return;

    setLoading(true);
    setError("");
    setResult(null);
    setRating(null);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentName, documentText, question }),
      });
      const data = (await response.json()) as AskResponse | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "The request failed.");
      }
      setResult(data);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function rate(value: FeedbackRating) {
    if (!result || rating) return;
    setRating(value);

    const payload = {
      answerId: result.answerId,
      rating: value,
      mode: result.mode,
    };
    localStorage.setItem(`groundquote-feedback-${result.answerId}`, value);

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Local feedback is retained even when optional remote storage is unavailable.
    }
  }

  return (
    <main>
      <nav className="nav shell">
        <Wordmark />
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a
            className="github-link"
            href="https://github.com/eatusc/groundquote"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </nav>

      <section className="hero shell">
        <div className="eyebrow">
          <span className="status-dot" />
          Private by design · your document is not saved
        </div>
        <h1>
          Ask the text.
          <br />
          <span>Check the source.</span>
        </h1>
        <p className="hero-copy">
          Get a clear answer grounded in your source—with the exact passages
          used, or an honest “not enough information.”
        </p>
        <div className="use-cases" aria-label="Common uses">
          <span>Policies</span>
          <span>Contracts</span>
          <span>Research notes</span>
          <span>Product docs</span>
        </div>
      </section>

      <form className="workspace shell" onSubmit={ask}>
        <section className="input-card">
          <div className="card-heading">
            <div>
              <span className="step-number">1</span>
              <h2>Add a document</h2>
            </div>
            <button className="text-button" type="button" onClick={loadSample}>
              Try an example
            </button>
          </div>

          <textarea
            aria-label="Document text"
            placeholder="Paste the text you want to ask about…"
            value={documentText}
            maxLength={MAX_DOCUMENT_CHARS}
            onChange={(event) => {
              setDocumentText(event.target.value);
              setDocumentName("Pasted document");
              setResult(null);
              setRating(null);
            }}
          />

          <div className="document-actions">
            <label className="upload-button">
              <input
                type="file"
                accept=".txt,.md,.markdown,.csv,.json,text/plain,text/markdown,text/csv,application/json"
                onChange={handleFile}
              />
              <span aria-hidden="true">↑</span>
              Upload text file
            </label>
            <span className={remaining < 1_000 ? "character-count warning" : "character-count"}>
              {documentText.length.toLocaleString()} / {MAX_DOCUMENT_CHARS.toLocaleString()}
            </span>
          </div>
        </section>

        <section className="question-card">
          <div className="card-heading">
            <div>
              <span className="step-number">2</span>
              <h2>Ask one clear question</h2>
            </div>
          </div>
          <div className="question-row">
            <input
              aria-label="Question"
              value={question}
              maxLength={500}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="What does the document say about…?"
            />
            <button className="ask-button" disabled={!canAsk} type="submit">
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Checking
                </>
              ) : (
                <>
                  Ask
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </div>
          {documentText.trim().length > 0 && documentText.trim().length < 80 && (
            <p className="inline-note">Add a little more document text to continue.</p>
          )}
          {error && <p className="error-message">{error}</p>}
        </section>
      </form>

      {result && (
        <section className="result-section shell" aria-live="polite">
          <div className="answer-card">
            <div className="answer-topline">
              <div className="answer-label">
                <span className={result.sufficient ? "answer-icon" : "answer-icon cautious"}>
                  {result.sufficient ? "✓" : "?"}
                </span>
                <span>{result.sufficient ? "Grounded answer" : "Honest answer"}</span>
              </div>
              <span className={`mode-badge ${result.mode}`}>
                {result.mode === "generated" ? "AI + retrieval" : "Evidence mode"}
              </span>
            </div>

            <CitedAnswer answer={result.answer} />

            <TrustRail result={result} />

            <div className="answer-meta">
              <span>
                <span className="meta-dot" />
                {confidenceLabel}
              </span>
              <span>{result.retrieval.elapsedMs} ms</span>
              <span>{result.retrieval.chunkCount} passages checked</span>
            </div>

            <div className="feedback-row">
              <p>{rating ? "Thanks—that helps improve the product." : "Was this answer useful?"}</p>
              {!rating && (
                <div className="rating-buttons">
                  <button
                    type="button"
                    onClick={() => rate("helpful")}
                    aria-label="Helpful"
                    title="Helpful"
                  >
                    <span aria-hidden="true">↑</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => rate("not_helpful")}
                    aria-label="Not helpful"
                    title="Not helpful"
                  >
                    <span aria-hidden="true">↓</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <aside className="evidence-panel">
            <div className="evidence-heading">
              <div>
                <span className="step-number">3</span>
                <h2>Evidence used</h2>
              </div>
              <span>{result.evidence.length} source{result.evidence.length === 1 ? "" : "s"}</span>
            </div>

            {result.evidence.length === 0 ? (
              <div className="empty-evidence">
                No passage was strong enough to support an answer.
              </div>
            ) : (
              <div className="evidence-list">
                {result.evidence.map((item) => (
                  <article id={`evidence-${item.id}`} key={item.id}>
                    <div className="source-topline">
                      <span className="source-number">{item.id}</span>
                      <span>Passage {item.chunkIndex + 1}</span>
                      <span className="source-score">
                        {Math.round(item.score * 100)}% match
                      </span>
                    </div>
                    <p>{item.text}</p>
                    {item.matchedTerms.length > 0 && (
                      <div className="matched-terms">
                        {item.matchedTerms.slice(0, 4).map((term) => (
                          <span key={term}>{term}</span>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </aside>
        </section>
      )}

      <section className="how shell" id="how-it-works">
        <div className="section-kicker">Built for trust, not theater</div>
        <h2>Simple on the surface. Careful underneath.</h2>
        <div className="feature-grid">
          <article>
            <span>01</span>
            <h3>Finds the right passages</h3>
            <p>
              Hybrid retrieval combines keyword precision with semantic
              similarity, then keeps the strongest, most distinct evidence.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Answers only from evidence</h3>
            <p>
              The model receives a small set of untrusted source passages and
              must cite every answer. Unsupported answers are rejected.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Knows when to stop</h3>
            <p>
              Weak retrieval triggers a safe no-answer path instead of a
              confident guess. Your rating closes the evaluation loop.
            </p>
          </article>
        </div>
      </section>

      <footer className="shell">
        <Wordmark />
        <p>Documents are processed for your request and are not stored.</p>
        <a
          href="https://github.com/eatusc/groundquote"
          target="_blank"
          rel="noreferrer"
        >
          View the source ↗
        </a>
      </footer>
    </main>
  );
}
