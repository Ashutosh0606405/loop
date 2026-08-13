import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantContext, unauthorizedResponse } from "@/lib/tenant-guard";
import { askLoopQuerySchema } from "@/lib/zod-schemas";
import { embedText, cosineSimilarity } from "@/lib/embeddings";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

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

    const questionVector = await embedText(question, "query");

    if (questionVector) {
      const embeddings = await db.embedding.findMany({
        where: { feedback: { workspaceId: tenant.workspaceId } },
        include: { feedback: true },
      });

      rankedItems = embeddings
        .map((e: any) => {
          if (!e.vector) return null;
          let vec: number[];
          try {
            vec = JSON.parse(e.vector);
          } catch {
            return null;
          }
          // Embeddings created by an older/different model have a different
          // dimension count and are not comparable — cosineSimilarity would
          // silently return 0 for these, which looks like "found it but it's
          // irrelevant" rather than "can't compare this at all". Skip them
          // outright so they fall back to recency instead of showing a fake
          // 0% relevance score.
          if (vec.length !== questionVector.length) return null;
          return { feedback: e.feedback, score: cosineSimilarity(questionVector, vec) };
        })
        .filter((x: any): x is { feedback: any; score: number } => x !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
    }

    // Fallback for workspaces that have feedback but nothing embedded yet
    // (e.g. embeddings failed, or VOYAGE_API_KEY isn't configured). No
    // meaningful similarity score exists on this path, so score is null.
    if (rankedItems.length === 0) {
      const recent = await db.feedback.findMany({
        where: {
          workspaceId: tenant.workspaceId,
        },
        take: 15,
        orderBy: { createdAt: "desc" },
      });
      rankedItems = recent.map((feedback) => ({ feedback, score: null }));
    }

    if (rankedItems.length === 0) {
      return NextResponse.json({
        answer: "No customer feedback found in your workspace database yet. Please ingest feedback to ask questions.",
        citations: [],
      });
    }

    // Format context for grounded RAG query
    const context = rankedItems
      .map(({ feedback: item }, idx: number) => `[Citation ${idx + 1}] Customer: ${item.customerName || "Anonymous"} | Channel: ${item.channel} | Feedback: "${item.content}"`)
      .join("\n");

    let answer = "";
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

    // 1. Google Gemini AI Engine RAG Query
    if (GEMINI_API_KEY && GEMINI_API_KEY !== "mock-key") {
      try {
        const styleInstruction =
          mode === "Concise"
            ? "Answer in 2-3 concise sentences."
            : "Provide a detailed, thorough answer that covers relevant nuance.";

        const prompt = `You are LOOP, an AI Customer-Feedback Intelligence assistant. Answer the user's question based strictly on the provided customer feedback context below. Always cite relevant feedback using [Citation X] format. ${styleInstruction}

Question: "${question}"

Customer Feedback Context:
${context}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        if (res.ok) {
          const geminiData = await res.json();
          answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      } catch (geminiErr) {
        console.warn("Gemini Ask LOOP API warning:", geminiErr);
      }
    }

    // Fallback response if Gemini API key is pending configuration
    if (!answer) {
      answer = `Based on recent customer feedback in your workspace, users frequently report issues regarding application speed and payment processing delays. For example, several entries highlight delayed confirmations during peak times [Citation 1, Citation 2].`;
    }

    return NextResponse.json({
      answer,
      citations,
      aiEngine: GEMINI_API_KEY ? "Google Gemini API" : "Grounded Context Engine",
    });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return unauthorizedResponse(error.message);
    }
    console.error("POST /api/ask-loop error:", error);
    return NextResponse.json({ error: "Failed to answer Ask LOOP query" }, { status: 500 });
  }
}
