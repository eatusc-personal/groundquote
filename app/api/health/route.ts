import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    generation: process.env.OPENAI_API_KEY ? "configured" : "extractive",
  });
}
