import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://groundquote.vercel.app";

export const metadata: Metadata = {
  title: "RAG explained without the hand-waving",
  description:
    "A plain-English guide to retrieval-augmented generation: how retrieval, grounding, citations, evaluation, and safe no-answer behavior fit together.",
  keywords: [
    "what is RAG",
    "RAG explained",
    "retrieval augmented generation tutorial",
    "RAG hallucinations",
    "RAG evaluation",
  ],
  alternates: {
    canonical: "/learn/rag",
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "RAG explained without the hand-waving",
  description:
    "A plain-English guide to retrieval, grounding, citations, evaluation, and safe no-answer behavior.",
  url: `${siteUrl}/learn/rag`,
  datePublished: "2026-07-26",
  dateModified: "2026-07-26",
  author: {
    "@type": "Person",
    name: "Eric Lai",
    url: "https://github.com/eatusc",
  },
  publisher: {
    "@type": "Organization",
    name: "Groundquote",
    url: siteUrl,
  },
};

export default function RagGuidePage() {
  return (
    <main className="guide-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData).replace(/</g, "\\u003c"),
        }}
      />

      <nav className="nav shell">
        <Wordmark />
        <div className="guide-nav">
          <Link href="/#learn-rag">Interactive lesson</Link>
          <Link className="guide-try-link" href="/#workspace">
            Try Groundquote
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </nav>

      <article className="guide-content shell">
        <header className="guide-hero">
          <div className="section-kicker">A practical guide</div>
          <h1>RAG explained without the hand-waving.</h1>
          <p>
            RAG is a simple idea with a lot of engineering hiding underneath:
            find the right source material first, then answer from that material.
          </p>
        </header>

        <section className="guide-summary" aria-label="RAG summary">
          <div>
            <span>01</span>
            <strong>Retrieve</strong>
            <p>Find the passages most likely to answer the question.</p>
          </div>
          <i aria-hidden="true">→</i>
          <div>
            <span>02</span>
            <strong>Answer</strong>
            <p>Use those passages as the model&apos;s working evidence.</p>
          </div>
          <i aria-hidden="true">→</i>
          <div>
            <span>03</span>
            <strong>Verify</strong>
            <p>Check the citations or stop when support is too weak.</p>
          </div>
        </section>

        <div className="guide-body">
          <aside className="guide-toc">
            <span>On this page</span>
            <a href="#what-rag-does">What RAG actually does</a>
            <a href="#real-example">A real example</a>
            <a href="#hallucinations">Why hallucinations still happen</a>
            <a href="#evaluation">What to test</a>
            <a href="#groundquote">How Groundquote handles it</a>
          </aside>

          <div className="guide-article">
            <section id="what-rag-does">
              <span className="guide-section-number">01</span>
              <h2>What RAG actually does</h2>
              <p>
                A normal language model answers from patterns learned during
                training. A RAG system gives it fresh source material at the
                moment someone asks a question.
              </p>
              <p>
                The document is split into passages. The system ranks those
                passages against the question, keeps a small set, and places them
                beside the question in the model request. The answer can then be
                tied back to text the user can inspect.
              </p>
              <div className="plain-note">
                <strong>The useful part is not “chat with a document.”</strong>
                It is having evidence, places to measure quality, and a safe way
                to refuse unsupported questions.
              </div>
            </section>

            <section id="real-example">
              <span className="guide-section-number">02</span>
              <h2>A small example</h2>
              <div className="example-source">
                <span>Policy passage</span>
                <p>
                  “Purchases above $500 require written manager approval before
                  the purchase is made.”
                </p>
              </div>
              <div className="example-row">
                <div>
                  <span>Question</span>
                  <p>“Does a $700 monitor need approval?”</p>
                </div>
                <div className="example-good">
                  <span>Supported answer</span>
                  <p>Yes. A $700 purchase needs prior written approval. [1]</p>
                </div>
              </div>
              <div className="example-row">
                <div>
                  <span>Question</span>
                  <p>“Which monitor brand should I buy?”</p>
                </div>
                <div className="example-stop">
                  <span>Safe answer</span>
                  <p>The policy does not provide enough information.</p>
                </div>
              </div>
            </section>

            <section id="hallucinations">
              <span className="guide-section-number">03</span>
              <h2>Why hallucinations can still happen</h2>
              <p>
                RAG lowers the risk of unsupported answers. It does not remove
                that risk by itself. Failure can enter at several points:
              </p>
              <div className="failure-grid">
                <article>
                  <strong>The right passage was never retrieved.</strong>
                  <p>
                    The answer may exist, but chunking or ranking failed to find
                    it.
                  </p>
                </article>
                <article>
                  <strong>The source is incomplete.</strong>
                  <p>
                    A related passage can look convincing while still missing the
                    detail the question needs.
                  </p>
                </article>
                <article>
                  <strong>The model adds an unsupported detail.</strong>
                  <p>
                    Good evidence can still be followed by a sentence the source
                    never said.
                  </p>
                </article>
                <article>
                  <strong>The documents disagree or are stale.</strong>
                  <p>
                    Retrieval cannot decide which policy is current unless the
                    system tracks that context.
                  </p>
                </article>
              </div>
            </section>

            <section id="evaluation">
              <span className="guide-section-number">04</span>
              <h2>What a useful test suite checks</h2>
              <ul className="evaluation-list">
                <li>
                  <span>Retrieval</span>
                  Did the relevant passage reach the top results?
                </li>
                <li>
                  <span>Coverage</span>
                  Does the evidence support every part of the question?
                </li>
                <li>
                  <span>Grounding</span>
                  Can every factual claim be traced to a source?
                </li>
                <li>
                  <span>Abstention</span>
                  Does the system refuse questions the source cannot answer?
                </li>
                <li>
                  <span>Adversarial input</span>
                  Does document text fail to override the system&apos;s rules?
                </li>
                <li>
                  <span>User value</span>
                  Did a person find the answer useful and easy to verify?
                </li>
              </ul>
            </section>

            <section id="groundquote">
              <span className="guide-section-number">05</span>
              <h2>How Groundquote handles it</h2>
              <p>
                Groundquote uses keyword retrieval, optional semantic retrieval,
                rank fusion, evidence thresholds, structured model output, and
                application-level citation checks. If retrieval is weak or a
                citation is invalid, the answer stops.
              </p>
              <p>
                You can inspect each part in the public repository or try both an
                answerable and unanswerable question in the app.
              </p>
              <div className="guide-actions">
                <Link className="primary-link" href="/#workspace">
                  Try Groundquote <span aria-hidden="true">→</span>
                </Link>
                <a href="https://github.com/eatusc/groundquote">
                  Read the source ↗
                </a>
              </div>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}
