import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create };
  },
}));

const { POST } = await import("../app/api/ask/route");
const { answerProvider } = await import("../lib/generate");

const documentText = `Refund Policy. Customers may request a full refund within 30 days of purchase if the product is unused and in its original packaging. After 30 days, refunds are issued as store credit only. Shipping fees are non-refundable.`;

let n = 0;
function ask(question: string) {
  n += 1;
  return new Request("http://localhost/api/ask", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost",
      "x-forwarded-for": `203.0.113.${n}`,
    },
    body: JSON.stringify({ documentName: "Refund policy", documentText, question }),
  });
}

beforeEach(() => {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  vi.stubEnv("OPENAI_API_KEY", "");
  create.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Claude answer generation", () => {
  it("prefers Claude when its key is set", () => {
    expect(answerProvider()).toBe("anthropic");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("OPENAI_API_KEY", "x");
    expect(answerProvider()).toBe("openai");
  });

  it("returns Claude's cited answer with structured output", async () => {
    create.mockResolvedValue({
      stop_reason: "end_turn",
      content: [
        {
          type: "text",
          text: JSON.stringify({
            answer: "No. Shipping fees are non-refundable [1].",
            citations: [1],
            sufficient: true,
          }),
        },
      ],
    });

    const result = await (await POST(ask("Are shipping fees non-refundable?"))).json();

    expect(result.mode).toBe("generated");
    expect(result.answer).toContain("non-refundable");
    expect(result.citations).toEqual([1]);
    const params = create.mock.calls[0][0];
    expect(params.output_config.format.type).toBe("json_schema");
    expect(params.system).toContain("untrusted data");
  });

  it("falls back to the extractive answer when Claude refuses", async () => {
    create.mockResolvedValue({ stop_reason: "refusal", content: [] });
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await (await POST(ask("Are shipping fees non-refundable?"))).json();

    expect(result.mode).toBe("extractive");
    expect(errors).toHaveBeenCalledWith(
      expect.stringContaining("anthropic generation failed"),
      expect.objectContaining({ code: "refusal" }),
    );
    errors.mockRestore();
  });
});
