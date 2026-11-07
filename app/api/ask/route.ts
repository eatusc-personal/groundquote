import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import {
  extractiveAnswer,
  NO_ANSWER,
  validateGroundedAnswer,
} from "@/lib/answer";
import { chunkDocument } from "@/lib/chunk";
import {
  answerProvider,
  generateWithClaude,
  generateWithOpenAI,
} from "@/lib/generate";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  clientIp,
  PRIVATE_RESPONSE_HEADERS,
  rejectUnsafeRequest,
} from "@/lib/request-security";
import {
  hasEnoughEvidence,
  rankByBm25,
  rankByEmbedding,
  retrievalConfidence,
  selectEvidence,
} from "@/lib/retrieval";
import type { AskResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

// Status and message only; never log request headers or the API key.
function describeError(error: unknown) {
  if (error && typeof error === "object") {
    const e = error as { status?: number; code?: string; message?: string };
    return { status: e.status, code: e.code, message: e.message?.slice(0, 300) };
  }
  return { message: String(error).slice(0, 300) };
}

const RequestSchema = z
  .object({
    documentName: z.string().trim().min(1).max(200).default("Document"),
    documentText: z.string().trim().min(80).max(60_000),
    question: z.string().trim().min(3).max(500),
  })
  .strict();

export async function POST(request: Request) {
  const startedAt = performance.now();
  const unsafeRequest = rejectUnsafeRequest(request, 300_000);
  if (unsafeRequest) return unsafeRequest;

  const limit = checkRateLimit(`ask:${clientIp(request)}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      {
        status: 429,
        headers: {
          ...PRIVATE_RESPONSE_HEADERS,
          "Retry-After": String(limit.retryAfterSeconds ?? 60),
        },
      },
    );
  }

  let parsed: z.infer<typeof RequestSchema>;
  try {
    parsed = RequestSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Please provide a document and a clear question." },
      { status: 400, headers: PRIVATE_RESPONSE_HEADERS },
    );
  }

  const answerId = crypto.randomUUID();
  const chunks = chunkDocument(parsed.documentText);
  const lexicalRanking = rankByBm25(chunks, parsed.question);
  const apiKey = process.env.OPENAI_API_KEY;
  const client = apiKey ? new OpenAI({ apiKey }) : null;

  let semanticRanking;
  let semanticUsed = false;

  if (client && chunks.length <= 80) {
    try {
      const embeddings = await client.embeddings.create({
        model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
        input: [parsed.question, ...chunks.map((chunk) => chunk.text)],
        encoding_format: "float",
      });
      const vectors = embeddings.data.map((item) => item.embedding);
      semanticRanking = rankByEmbedding(chunks, vectors[0], vectors.slice(1));
      semanticUsed = true;
    } catch (error) {
      // Keyword retrieval remains available if the embedding service is unavailable,
      // but say so: a quiet fallback looks exactly like a healthy hybrid search.
      console.error("[ask] embeddings failed, using keyword retrieval:", describeError(error));
    }
  }

  const evidence = selectEvidence(lexicalRanking, semanticRanking);
  const confidence = retrievalConfidence(evidence, parsed.question, semanticUsed);
  const enoughEvidence = hasEnoughEvidence(
    evidence,
    parsed.question,
    semanticUsed,
  );
  const retrieval = {
    method: semanticUsed ? ("hybrid" as const) : ("keyword" as const),
    chunkCount: chunks.length,
    confidence,
    elapsedMs: 0,
  };

  if (!enoughEvidence) {
    const response: AskResponse = {
      answerId,
      answer: NO_ANSWER,
      citations: [],
      evidence: [],
      sufficient: false,
      mode: "extractive",
      retrieval: {
        ...retrieval,
        elapsedMs: Math.round(performance.now() - startedAt),
      },
    };
    return NextResponse.json(response, { headers: PRIVATE_RESPONSE_HEADERS });
  }

  const provider = answerProvider();
  if (provider) {
    try {
      const generated =
        provider === "anthropic"
          ? await generateWithClaude(parsed.documentName, parsed.question, evidence)
          : await generateWithOpenAI(
              client ?? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
              parsed.documentName,
              parsed.question,
              evidence,
            );
      const checked = validateGroundedAnswer(generated, evidence);
      const response: AskResponse = {
        answerId,
        ...checked,
        evidence: checked.sufficient ? evidence : [],
        mode: "generated",
        retrieval: {
          ...retrieval,
          elapsedMs: Math.round(performance.now() - startedAt),
        },
      };
      return NextResponse.json(response, { headers: PRIVATE_RESPONSE_HEADERS });
    } catch (error) {
      // A cited extractive answer is safer than returning an unverified generation.
      console.error(`[ask] ${provider} generation failed, using extractive answer:`, describeError(error));
    }
  }

  const fallback = extractiveAnswer(evidence);
  const citedEvidence = evidence.filter((item) =>
    fallback.citations.includes(item.id),
  );
  const response: AskResponse = {
    answerId,
    ...fallback,
    evidence: citedEvidence,
    mode: "extractive",
    retrieval: {
      ...retrieval,
      elapsedMs: Math.round(performance.now() - startedAt),
    },
  };
  return NextResponse.json(response, { headers: PRIVATE_RESPONSE_HEADERS });
}
