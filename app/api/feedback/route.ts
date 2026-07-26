import { NextResponse } from "next/server";
import { z } from "zod";

const FeedbackSchema = z.object({
  answerId: z.string().uuid(),
  rating: z.enum(["helpful", "not_helpful"]),
  mode: z.enum(["generated", "extractive"]),
});

export async function POST(request: Request) {
  let feedback: z.infer<typeof FeedbackSchema>;
  try {
    feedback = FeedbackSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid feedback." }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ accepted: true, stored: false });
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
    return NextResponse.json({ accepted: true, stored: true });
  } catch {
    return NextResponse.json({ accepted: true, stored: false });
  }
}
