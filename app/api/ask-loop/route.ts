import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantContext, unauthorizedResponse } from "@/lib/tenant-guard";
import { askLoopQuerySchema } from "@/lib/zod-schemas";
import { embedText, cosineSimilarity } from "@/lib/embeddings";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

// Cosine scores below this are treated as "not actually about this question".
// Voyage scores tend to sit in the 0.3-0.7 band even for good matches, so this
// is deliberately low — it exists to drop clearly unrelated feedback, not to
// fine-tune ranking.
const MINIMUM_SIMILARITY = 0.15;

const MAX_CITATIONS = 8;

export async function POST(req: Request) {
  try {
    const tenant = await getTenantContext();
    const body = await req.json();

    const validated = askLoopQuerySchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { question, mode } = validated.data;

    // Semantic retrieval: embed the question, score every stored embedding in
    // this workspace by cosine similarity, and take the top matches. This is
    // what makes the retrieved context actually relevant to what was asked,
    // rather than just whatever feedback is most recent.
    let rankedItems: { feedback: any; score: number | null }[] = [];

    // "How much of the workspace could we actually search?" — surfaced in the
    // response so a partial backfill can't silently look like a full search.
    let searchableCount = 0;
    let skippedIncompatible = 0;
    let skippedUnreadable = 0;
    let belowThreshold = 0;
    let retrievalMode: "semantic" | "recency" | "no_match" = "recency";

    const questionVector = await embedText(question, "query");
    const totalFeedback = await db.feedback.count({
      where: { workspaceId: tenant.workspaceId },
    });

    if (questionVector) {
      const embeddings = await db.embedding.findMany({
        where: { feedback: { workspaceId: tenant.workspaceId } },
        include: { feedback: true },
      });

      const scored = embeddings
        .map((e: any) => {
          if (!e.vector) {
            skippedUnreadable++;
            return null;
          }
          let vec: number[];
          try {
            vec = JSON.parse(e.vector);
          } catch {
            skippedUnreadable++;
            return null;
          }
          // Embeddings created by an older/different model have a different
          // dimension count and are not comparable — cosineSimilarity would
          // silently return 0 for these, which looks like "found it but it's
          // irrelevant" rather than "can't compare this at all". Skip them
          // outright so they fall back to recency instead of showing a fake
          // 0% relevance score.
          if (vec.length !== questionVector.length) {
            skippedIncompatible++;
            return null;
          }
          return { feedback: e.feedback, score: cosineSimilarity(questionVector, vec) };
        })
        .filter((x: any): x is { feedback: any; score: number } => x !== null);

      searchableCount = scored.length;

      const aboveFloor = scored.filter((x) => x.score >= MINIMUM_SIMILARITY);
      belowThreshold = scored.length - aboveFloor.length;

      rankedItems = aboveFloor
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_CITATIONS);

      if (rankedItems.length > 0) {
        retrievalMode = "semantic";
      } else if (searchableCount > 0) {
        // Semantic search ran fine and simply found nothing related to this
        // question. That is a real answer in itself — do NOT quietly fall
        // back to "here are 15 recent items", which would hand the model
        // unrelated feedback and tell it to answer from them.
        retrievalMode = "no_match";
      }
    }

    // Fallback ONLY when there was nothing searchable at all (no embeddings
    // yet, or VOYAGE_API_KEY unset). No meaningful similarity score exists on
    // this path, so score is null.
    if (rankedItems.length === 0 && retrievalMode === "recency") {
      const recent = await db.feedback.findMany({
        where: {
          workspaceId: tenant.workspaceId,
        },
        take: MAX_CITATIONS,
        orderBy: { createdAt: "desc" },
      });
      rankedItems = recent.map((feedback) => ({ feedback, score: null }));
    }

    const retrieval = {
      mode: retrievalMode,
      totalFeedback,
      // How many items were actually comparable against this question. If this
      // is well below totalFeedback, the answer is grounded on a slice of the
      // data and the caller should say so.
      searchable: searchableCount,
      // These three account for every embedding row that wasn't usable, so
      // searchable + skipped* reconciles against the total row count.
      skippedIncompatible,
      skippedUnreadable,
      belowThreshold,
      used: rankedItems.length,
    };

    if (retrievalMode === "no_match") {
      return NextResponse.json({
        answer: null,
        message: `No feedback in this workspace is closely related to that question. Searched ${searchableCount} record(s).`,
        citations: [],
        retrieval,
        aiEngine: null,
      });
    }

    if (rankedItems.length === 0) {
      return NextResponse.json({
        answer: null,
        message:
          "No customer feedback found in your workspace database yet. Please ingest feedback to ask questions.",
        citations: [],
        retrieval,
        aiEngine: null,
      });
    }

    // Format context for grounded RAG query
    const context = rankedItems
      .map(({ feedback: item }, idx: number) => `[Citation ${idx + 1}] Customer: ${item.customerName || "Anonymous"} | Channel: ${item.channel} | Feedback: "${item.content}"`)
      .join("\n");

    const citations = rankedItems.map(({ feedback: item, score }, idx: number) => ({
      id: item.id,
      index: idx + 1,
      customer: item.customerName || "Anonymous Customer",
      channel: item.channel,
      content: item.content,
      sentiment: item.sentiment || "NEUTRAL",
      // 0-100 similarity score when real semantic search ran, null on the
      // recency-fallback path where there's nothing meaningful to report.
      relevance: score != null ? Math.round(Math.max(0, Math.min(1, score)) * 100) : null,
    }));

    if (!GEMINI_API_KEY || GEMINI_API_KEY === "mock-key") {
      // No AI configured. Return the retrieved evidence and say plainly that
      // there's no generated answer — never invent one.
      return NextResponse.json(
        {
          error: "AI_NOT_CONFIGURED",
          answer: null,
          message:
            "The AI engine is not configured, so no answer could be generated. The most relevant feedback is included below.",
          citations,
          retrieval,
          aiEngine: null,
        },
        { status: 503 },
      );
    }

    const styleInstruction =
      mode === "Concise"
        ? "Answer in 2-3 concise sentences."
        : "Provide a detailed, thorough answer that covers relevant nuance.";

    const prompt = `You are LOOP, an AI Customer-Feedback Intelligence assistant. Answer the user's question based strictly on the provided customer feedback context below. Always cite relevant feedback using [Citation X] format. ${styleInstruction}

Question: "${question}"

Customer Feedback Context:
${context}`;

    let answer = "";
    let failureDetail = "";

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
          signal: AbortSignal.timeout(30_000),
        },
      );

      if (res.ok) {
        const geminiData = await res.json();
        answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (!answer) {
          failureDetail = "The AI engine returned an empty response.";
          console.warn("Ask LOOP: Gemini returned no text", JSON.stringify(geminiData));
        }
      } else {
        const errorBody = await res.text();
        failureDetail = `The AI engine returned an error (HTTP ${res.status}).`;
        console.warn("Ask LOOP: Gemini error", res.status, errorBody);
      }
    } catch (geminiErr: any) {
      failureDetail =
        geminiErr?.name === "TimeoutError"
          ? "The AI engine timed out."
          : "Could not reach the AI engine.";
      console.warn("Ask LOOP: Gemini call failed", geminiErr);
    }

    if (!answer) {
      // Previously this fell through to a hardcoded paragraph describing
      // problems the workspace may not even have, rendered next to real
      // citations and still labelled as a Gemini answer. Never fabricate —
      // return the retrieved evidence and a clear failure instead.
      return NextResponse.json(
        {
          error: "AI_UNAVAILABLE",
          answer: null,
          message: `${failureDetail} The most relevant feedback is included below.`,
          citations,
          retrieval,
          aiEngine: null,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      answer,
      citations,
      retrieval,
      aiEngine: "Google Gemini API",
    });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return unauthorizedResponse(error.message);
    }
    console.error("POST /api/ask-loop error:", error);
    return NextResponse.json({ error: "Failed to answer Ask LOOP query" }, { status: 500 });
  }
}
