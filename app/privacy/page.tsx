import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Groundquote processes documents, questions, answer feedback, and model-provider requests.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <nav className="nav shell">
        <Wordmark />
        <Link className="back-link" href="/">
          Back to the app
          <span aria-hidden="true">↗</span>
        </Link>
      </nav>

      <article className="legal-content shell">
        <div className="section-kicker">Plain-language privacy</div>
        <h1>Your document is for your request—not our library.</h1>
        <p className="legal-lede">
          Groundquote is designed as a request-scoped utility. It does not
          create user accounts, build document profiles, or persist your
          document text and questions in its application database.
        </p>

        <section>
          <h2>What Groundquote processes</h2>
          <p>
            When you ask a question, Groundquote receives the document name,
            document text, and question. It cleans and chunks the text, retrieves
            relevant passages, and produces a response. The public service limits
            documents to 60,000 characters.
          </p>
        </section>

        <section>
          <h2>Generated answers and model providers</h2>
          <p>
            When AI-generated mode is configured, Groundquote sends your
            question and the retrieved passages—not a stored document
            collection—to the configured model provider. That provider handles
            the request under its own data and retention policies. Evidence-only
            mode does not make a generation request.
          </p>
        </section>

        <section>
          <h2>Feedback</h2>
          <p>
            A helpful or not-helpful rating is remembered in your browser. If
            aggregate feedback storage is enabled, Groundquote may also store an
            anonymous answer ID, the rating, the answer mode, and a timestamp.
            Document text and questions are not included in that feedback
            record.
          </p>
        </section>

        <section>
          <h2>Operational data</h2>
          <p>
            The hosting platform may process standard request information such
            as IP address, user agent, timing, and error logs for security and
            service operation. Groundquote uses an IP-derived key for
            rate-limiting but does not add IP addresses to its feedback table.
          </p>
        </section>

        <section>
          <h2>Use good judgment</h2>
          <p>
            The public demo is not intended for passwords, API keys, government
            identifiers, health records, privileged legal material, or other
            regulated secrets. Review your organization&apos;s policies before
            sending sensitive information to any hosted AI service.
          </p>
        </section>

        <section>
          <h2>Questions or security reports</h2>
          <p>
            The project is open source. For privacy questions, open a
            non-sensitive discussion on GitHub. Report suspected vulnerabilities
            privately through the project&apos;s security advisory form.
          </p>
          <div className="legal-actions">
            <a href="https://github.com/eatusc/groundquote/issues">
              Project issues ↗
            </a>
            <a href="https://github.com/eatusc/groundquote/security/advisories/new">
              Private security report ↗
            </a>
          </div>
        </section>

        <p className="legal-updated">Last updated July 26, 2026.</p>
      </article>
    </main>
  );
}
