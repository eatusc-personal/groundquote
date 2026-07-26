import type { AskResponse } from "@/lib/types";

export function TrustRail({ result }: { result: AskResponse }) {
  const checks = result.sufficient
    ? [
        {
          label: "Retrieved",
          value: `${result.evidence.length} source${result.evidence.length === 1 ? "" : "s"}`,
        },
        {
          label: "Cited",
          value: `${result.citations.length} link${result.citations.length === 1 ? "" : "s"}`,
        },
        { label: "Checked", value: "IDs verified" },
      ]
    : [
        { label: "Retrieved", value: "Weak match" },
        { label: "Cited", value: "No support" },
        { label: "Protected", value: "Safe stop" },
      ];

  return (
    <div className={`trust-rail ${result.sufficient ? "" : "safe-stop"}`}>
      {checks.map((check, index) => (
        <div className="trust-step" key={check.label}>
          <span className="trust-node">{result.sufficient ? "✓" : index === 2 ? "✓" : "–"}</span>
          <span className="trust-copy">
            <strong>{check.label}</strong>
            <small>{check.value}</small>
          </span>
        </div>
      ))}
    </div>
  );
}
