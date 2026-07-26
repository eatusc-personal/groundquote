import { NextResponse } from "next/server";

export const PRIVATE_RESPONSE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
  Vary: "Origin",
};

export function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

export function rejectUnsafeRequest(request: Request, maxBytes: number) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return NextResponse.json(
      { error: "Content-Type must be application/json." },
      { status: 415, headers: PRIVATE_RESPONSE_HEADERS },
    );
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (
    !Number.isFinite(contentLength) ||
    contentLength < 0 ||
    contentLength > maxBytes
  ) {
    return NextResponse.json(
      { error: "Request body is too large." },
      { status: 413, headers: PRIVATE_RESPONSE_HEADERS },
    );
  }

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const requestUrl = new URL(request.url);
      const allowedHosts = new Set(
        [
          requestUrl.host,
          request.headers.get("host"),
          request.headers.get("x-forwarded-host")?.split(",")[0]?.trim(),
        ].filter(Boolean),
      );
      const forwardedProtocol = request.headers
        .get("x-forwarded-proto")
        ?.split(",")[0]
        ?.trim();
      const expectedProtocol = forwardedProtocol
        ? `${forwardedProtocol}:`
        : requestUrl.protocol;

      if (
        !allowedHosts.has(originUrl.host) ||
        originUrl.protocol !== expectedProtocol
      ) {
        return NextResponse.json(
          { error: "Cross-origin requests are not allowed." },
          { status: 403, headers: PRIVATE_RESPONSE_HEADERS },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403, headers: PRIVATE_RESPONSE_HEADERS },
      );
    }
  }

  return null;
}
