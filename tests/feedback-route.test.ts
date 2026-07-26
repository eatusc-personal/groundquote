import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "../app/api/feedback/route";

const originalUrl = process.env.SUPABASE_URL;
const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let requestNumber = 0;

function feedbackRequest(
  body: unknown,
  headers: Record<string, string> = {},
) {
  requestNumber += 1;
  return new Request("http://localhost/api/feedback", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost",
      "x-forwarded-for": `203.0.113.${requestNumber}`,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

afterEach(() => {
  if (originalUrl) process.env.SUPABASE_URL = originalUrl;
  else delete process.env.SUPABASE_URL;
  if (originalKey) process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

describe("POST /api/feedback", () => {
  const validBody = {
    answerId: "f34e6a64-b49d-43b9-a45c-644193615f51",
    rating: "helpful",
    mode: "extractive",
  };

  it("accepts feedback when optional remote storage is not configured", async () => {
    const response = await POST(feedbackRequest(validBody));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    await expect(response.json()).resolves.toEqual({
      accepted: true,
      stored: false,
    });
  });

  it.each([
    { ...validBody, answerId: "not-a-uuid" },
    { ...validBody, rating: "five-stars" },
    { ...validBody, mode: "unknown" },
    { ...validBody, note: "unexpected" },
  ])("rejects malformed or expanded feedback payloads", async (body) => {
    const response = await POST(feedbackRequest(body));

    expect(response.status).toBe(400);
  });

  it("rejects cross-origin feedback", async () => {
    const response = await POST(
      feedbackRequest(validBody, { origin: "https://attacker.example" }),
    );

    expect(response.status).toBe(403);
  });

  it("rejects non-JSON feedback", async () => {
    const response = await POST(
      feedbackRequest(validBody, { "content-type": "text/plain" }),
    );

    expect(response.status).toBe(415);
  });
});
