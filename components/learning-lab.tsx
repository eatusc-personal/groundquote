"use client";

import { useState } from "react";
import Link from "next/link";

const lessons = [
  {
    number: "01",
    title: "Retrieve",
    description:
      "Break the document into useful passages, then find the few that best match the question.",
    tryThis: "Ask one specific question instead of asking for a full summary.",
    visual: (
      <div className="lesson-visual retrieve-visual" aria-hidden="true">
        <span />
        <span className="active" />
        <span />
        <span />
      </div>
    ),
  },
  {
    number: "02",
    title: "Ground",
    description:
      "Give the model only the strongest passages and require evidence beside every claim.",
    tryThis: "Click a citation to compare the answer with the original wording.",
    visual: (
      <div className="lesson-visual ground-visual" aria-hidden="true">
        <span>claim</span>
        <i>→</i>
        <span className="citation-box">[1]</span>
      </div>
    ),
  },
  {
    number: "03",
    title: "Verify",
    description:
      "Check citation IDs in code and refuse the answer when the source does not support it.",
    tryThis: "Ask about something missing and watch Groundquote safely stop.",
    visual: (
      <div className="lesson-visual verify-visual" aria-hidden="true">
        <span>✓</span>
        <span>cited</span>
        <span>checked</span>
      </div>
    ),
  },
];

export function LearningLab() {
  const [choice, setChoice] = useState<"answer" | "abstain" | null>(null);

  return (
    <section className="learning-lab shell" id="learn-rag">
      <div className="learning-intro">
        <div>
          <div className="section-kicker">RAG in about 60 seconds</div>
          <h2>Learn the recipe by using it.</h2>
        </div>
        <div className="learning-intro-copy">
          <p>
            Retrieval-augmented generation is easier to understand when you can
            see each decision. Groundquote keeps the important parts visible.
          </p>
          <Link href="/learn/rag">Read the plain-English RAG guide →</Link>
        </div>
      </div>

      <div className="lesson-grid">
        {lessons.map((lesson) => (
          <article className="lesson-card" key={lesson.title}>
            <div className="lesson-topline">
              <span>{lesson.number}</span>
              <small>RAG step</small>
            </div>
            {lesson.visual}
            <h3>{lesson.title}</h3>
            <p>{lesson.description}</p>
            <div className="try-tip">
              <strong>Try it</strong>
              {lesson.tryThis}
            </div>
          </article>
        ))}
      </div>

      <div className="mini-challenge">
        <div className="challenge-source">
          <span>Source passage</span>
          <p>“Returns are accepted within 30 days with the original receipt.”</p>
        </div>
        <div className="challenge-question">
          <div>
            <span>Quick challenge</span>
            <h3>“Are exchanges free?”</h3>
            <p>What should a trustworthy RAG system do?</p>
          </div>
          <div className="challenge-actions">
            <button
              className={choice === "answer" ? "selected incorrect" : ""}
              type="button"
              onClick={() => setChoice("answer")}
            >
              Answer it
            </button>
            <button
              className={choice === "abstain" ? "selected correct" : ""}
              type="button"
              onClick={() => setChoice("abstain")}
            >
              Say “not enough info”
            </button>
          </div>
          {choice && (
            <div
              className={`challenge-result ${choice === "abstain" ? "correct" : "incorrect"}`}
              aria-live="polite"
            >
              {choice === "abstain"
                ? "Exactly. The passage covers returns, not exchange fees."
                : "That would be a guess—the source never mentions exchange fees."}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
