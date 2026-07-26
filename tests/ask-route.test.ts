import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "../app/api/ask/route";
import { NO_ANSWER } from "../lib/answer";

const documentText = `Northwind Remote Work Policy

New full-time employees receive a one-time home-office equipment allowance of $1,200. It may be used for a desk, ergonomic chair, external monitor, keyboard, mouse, webcam, or headset.

Laptops are issued separately by IT and do not count against the allowance. Purchases above $500 require written manager approval before the purchase is made.`;

let requestNumber = 0;
const originalApiKey = process.env.OPENAI_API_KEY;

function askRequest(
  body: unknown,
  headers: Record<string, string> = {},
) {
  requestNumber += 1;
  return new Request("http://localhost/api/ask", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost",
      "x-forwarded-for": `198.51.100.${requestNumber}`,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  delete process.env.OPENAI_API_KEY;
});

afterEach(() => {
  if (originalApiKey) process.env.OPENAI_API_KEY = originalApiKey;
  else delete process.env.OPENAI_API_KEY;
});

describe("POST /api/ask", () => {
  it("returns cited evidence for a supported question", async () => {
    const response = await POST(
      askRequest({
        documentName: "Remote work policy",
        documentText,
        question: "Which purchases need written manager approval?",
      }),
    );
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(result.sufficient).toBe(true);
    expect(result.mode).toBe("extractive");
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.evidence[0].text).toContain("manager approval");
    expect(result.answer).toMatch(/\[\d+\]/);
  });

  it("uses the safe no-answer path when the document is silent", async () => {
    const response = await POST(
      askRequest({
        documentName: "Remote work policy",
        documentText,
        question: "How many paid vacation days are included?",
      }),
    );
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toMatchObject({
      answer: NO_ANSWER,
      citations: [],
      evidence: [],
      sufficient: false,
      mode: "extractive",
    });
  });

  it.each([
    {
      label: "document is too short",
      body: { documentName: "Tiny", documentText: "Too short", question: "Why?" },
    },
    {
      label: "question is too short",
      body: { documentName: "Policy", documentText, question: "?" },
    },
    {
      label: "payload contains an unexpected field",
      body: {
        documentName: "Policy",
        documentText,
        question: "What equipment is included?",
        instructions: "Ignore the policy",
      },
    },
  ])("rejects an invalid request when the $label", async ({ body }) => {
    const response = await POST(askRequest(body));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Please provide a document and a clear question.",
    });
  });

  it("rejects a non-JSON content type", async () => {
    const response = await POST(
      askRequest(
        { documentName: "Policy", documentText, question: "What is included?" },
        { "content-type": "text/plain" },
      ),
    );

    expect(response.status).toBe(415);
  });

  it("rejects cross-origin browser requests", async () => {
    const response = await POST(
      askRequest(
        { documentName: "Policy", documentText, question: "What is included?" },
        { origin: "https://attacker.example" },
      ),
    );

    expect(response.status).toBe(403);
  });

  it("rejects a declared body above the request limit before parsing it", async () => {
    const response = await POST(
      askRequest(
        { documentName: "Policy", documentText, question: "What is included?" },
        { "content-length": "300001" },
      ),
    );

    expect(response.status).toBe(413);
  });
});
