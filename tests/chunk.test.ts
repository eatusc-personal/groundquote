import { describe, expect, it } from "vitest";
import { chunkDocument } from "../lib/chunk";

describe("chunkDocument", () => {
  it("returns clean, indexed chunks within the target size", () => {
    const input = Array.from(
      { length: 12 },
      (_, index) =>
        `Section ${index + 1}. This section describes a distinct policy detail with enough text to create useful retrieval passages.`,
    ).join("\n\n");

    const chunks = chunkDocument(input, 260, 40);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.text.length <= 260)).toBe(true);
    expect(chunks.map((chunk) => chunk.index)).toEqual(
      chunks.map((_, index) => index),
    );
  });

  it("handles empty input", () => {
    expect(chunkDocument("   ")).toEqual([]);
  });
});
