import { describe, expect, it } from "vitest";
import { checkRateLimit } from "../lib/rate-limit";

describe("rate limiting", () => {
  it("allows the first 20 requests and blocks the next one", () => {
    const key = `test:${crypto.randomUUID()}`;
    const allowed = Array.from({ length: 20 }, () => checkRateLimit(key));
    const blocked = checkRateLimit(key);

    expect(allowed.every((result) => result.allowed)).toBe(true);
    expect(allowed.at(-1)?.remaining).toBe(0);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("keeps request buckets separate", () => {
    const first = checkRateLimit(`test:${crypto.randomUUID()}`);
    const second = checkRateLimit(`test:${crypto.randomUUID()}`);

    expect(first).toEqual({ allowed: true, remaining: 19 });
    expect(second).toEqual({ allowed: true, remaining: 19 });
  });
});
