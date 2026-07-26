import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  clientIp,
  PRIVATE_RESPONSE_HEADERS,
  rejectUnsafeRequest,
} from "@/lib/request-security";

const FeedbackSchema = z
  .object({
    answerId: z.string().uuid(),
    rating: z.enum(["helpful", "not_helpful"]),
    mode: z.enum(["generated", "extractive"]),
  })
  .strict();

export async function POST(request: Request) {
  const unsafeRequest = rejectUnsafeRequest(request, 2_000);
  if (unsafeRequest) return unsafeRequest;

  const limit = checkRateLimit(`feedback:${clientIp(request)}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many feedback requests." },
      {
        status: 429,
        headers: {
          ...PRIVATE_RESPONSE_HEADERS,
          "Retry-After": String(limit.retryAfterSeconds ?? 60),
        },
      },
    );
  }

  let feedback: z.infer<typeof FeedbackSchema>;
  try {
    feedback = FeedbackSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Invalid feedback." },
      { status: 400, headers: PRIVATE_RESPONSE_HEADERS },
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { accepted: true, stored: false },
      { headers: PRIVATE_RESPONSE_HEADERS },
    );
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/groundquote_feedback`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        answer_id: feedback.answerId,
        rating: feedback.rating,
        answer_mode: feedback.mode,
      }),
    });

    if (!response.ok) throw new Error("Feedback storage failed");
    return NextResponse.json(
      { accepted: true, stored: true },
      { headers: PRIVATE_RESPONSE_HEADERS },
    );
  } catch {
    return NextResponse.json(
      { accepted: true, stored: false },
      { headers: PRIVATE_RESPONSE_HEADERS },
    );
  }
}
