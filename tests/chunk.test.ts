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

  it("normalizes Windows line endings and repeated whitespace", () => {
    const chunks = chunkDocument(
      "First   policy line.\r\n\r\n\r\nSecond\tpolicy line.",
      200,
      20,
    );

    expect(chunks).toHaveLength(1);
    expect(chunks[0].text).toBe(
      "First policy line.\n\nSecond policy line.",
    );
  });

  it("splits a single oversized sentence without losing the length limit", () => {
    const input = "x".repeat(610);
    const chunks = chunkDocument(input, 200, 30);

    expect(chunks).toHaveLength(4);
    expect(chunks.every((chunk) => chunk.text.length <= 200)).toBe(true);
    expect(chunks.slice(0, 3).every((chunk) => chunk.text.length === 200)).toBe(
      true,
    );
    expect(chunks[3].text.endsWith("x".repeat(10))).toBe(true);
  });

  it("keeps a small overlap between adjacent passages when it fits", () => {
    const input = [
      "Alpha policy contains a useful first detail.",
      "Beta policy contains a useful second detail.",
      "Gamma policy contains a useful third detail.",
    ].join("\n\n");
    const chunks = chunkDocument(input, 95, 24);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[1].text).toContain("detail.");
  });
});
