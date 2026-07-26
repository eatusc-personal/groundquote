export function GroundingAnimation() {
  return (
    <div
      className="grounding-animation"
      role="img"
      aria-label="An animated question travels through document passages and becomes a cited answer"
    >
      <div className="animation-chrome">
        <span />
        <span />
        <span />
        <small>live grounding trace</small>
      </div>

      <div className="animation-stage">
        <div className="question-bubble">
          <span className="animation-label">Question</span>
          <strong>What needs approval?</strong>
        </div>

        <div className="trace-connector" aria-hidden="true">
          <span className="travel-dot" />
        </div>

        <div className="source-stack">
          <span className="animation-label">Searching 6 passages</span>
          <div className="source-line short" />
          <div className="source-line highlight">
            <span>manager approval</span>
          </div>
          <div className="source-line medium" />
        </div>

        <div className="trace-connector second" aria-hidden="true">
          <span className="travel-dot" />
        </div>

        <div className="answer-preview">
          <span className="animation-label">Grounded answer</span>
          <p>
            Purchases over $500 need approval.
            <span className="mini-citation">[1]</span>
          </p>
          <div className="verified-chip">
            <span>✓</span>
            Citation checked
          </div>
        </div>
      </div>
    </div>
  );
}
