import { describe, expect, it } from "vitest";
import { rejectUnsafeRequest } from "../lib/request-security";

function request(
  headers: Record<string, string> = {
    "content-type": "application/json",
    "content-length": "120",
  },
) {
  return new Request("https://groundquote.vercel.app/api/ask", {
    method: "POST",
    headers,
  });
}

describe("request security", () => {
  it("accepts a same-origin JSON request within the size limit", () => {
    expect(
      rejectUnsafeRequest(
        request({
          "content-type": "application/json",
          "content-length": "120",
          origin: "https://groundquote.vercel.app",
        }),
        1_000,
      ),
    ).toBeNull();
  });

  it("accepts the browser-facing host behind a trusted proxy", () => {
    expect(
      rejectUnsafeRequest(
        request({
          "content-type": "application/json",
          "content-length": "120",
          origin: "https://groundquote.vercel.app",
          host: "internal-host",
          "x-forwarded-host": "groundquote.vercel.app",
          "x-forwarded-proto": "https",
        }),
        1_000,
      ),
    ).toBeNull();
  });

  it("rejects cross-origin browser requests", async () => {
    const response = rejectUnsafeRequest(
      request({
        "content-type": "application/json",
        "content-length": "120",
        origin: "https://example.com",
      }),
      1_000,
    );

    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toEqual({
      error: "Cross-origin requests are not allowed.",
    });
  });

  it("rejects oversized and non-JSON requests", () => {
    expect(
      rejectUnsafeRequest(
        request({
          "content-type": "application/json",
          "content-length": "1001",
        }),
        1_000,
      )?.status,
    ).toBe(413);

    expect(
      rejectUnsafeRequest(
        request({
          "content-type": "text/plain",
          "content-length": "12",
        }),
        1_000,
      )?.status,
    ).toBe(415);
  });
});
