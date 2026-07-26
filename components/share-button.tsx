"use client";

import { useState } from "react";

export function ShareButton() {
  const [status, setStatus] = useState<"idle" | "shared" | "copied" | "failed">(
    "idle",
  );

  async function share() {
    const url = "https://groundquote.vercel.app";
    const title = "Groundquote — answers you can trace";
    const text =
      "Ask a document and check every answer against the source. Groundquote is free and open source.";

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        setStatus("shared");
      } else {
        await navigator.clipboard.writeText(url);
        setStatus("copied");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("idle");
        return;
      }
      setStatus("failed");
    }

    window.setTimeout(() => setStatus("idle"), 2_400);
  }

  const label = {
    idle: "Share Groundquote",
    shared: "Shared",
    copied: "Link copied",
    failed: "Copy the URL above",
  }[status];

  return (
    <button className="share-button" type="button" onClick={share}>
      {label}
      <span aria-hidden="true">{status === "idle" ? "↗" : "✓"}</span>
    </button>
  );
}
