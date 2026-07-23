import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { getTenantContext, unauthorizedResponse } from "@/lib/tenant-guard";
import { askLoopQuerySchema } from "@/lib/zod-schemas";


const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "mock-key",
});

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

    const { question } = validated.data;

    // Retrieve relevant feedback items belonging ONLY to the user's workspaceId
    const feedbackItems: Feedback[] = await db.feedback.findMany({
      where: {
        workspaceId: tenant.workspaceId,
      },
      take: 15,
      orderBy: { createdAt: "desc" },
    });

    if (feedbackItems.length === 0) {
      return NextResponse.json({
        answer: "No customer feedback found in your workspace yet. Please ingest feedback to ask questions.",
        citations: [],
      });
    }

    // Format context for grounded RAG query
    const context = feedbackItems
      .map((item: any, idx: number) => `[Citation ${idx + 1}] Customer: ${item.customerName || "Anonymous"} | Channel: ${item.channel} | Feedback: "${item.content}"`)
  .join("\n");

    let answer = "";
  const citations = feedbackItems.map((item: any, idx: number) => ({
    id: item.id,
    index: idx + 1,
    customer: item.customerName || "Anonymous Customer",
    channel: item.channel,
    content: item.content,
    sentiment: item.sentiment || "NEUTRAL",
  }));

    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "mock-key") {
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 800,
        messages: [
          {
            role: "user",
            content: `You are LOOP, an AI Customer-Feedback Intelligence assistant. Answer the user's question based strictly on the provided customer feedback context below. Always cite relevant feedback using [Citation X] format.

Question: "${question}"

Customer Feedback Context:
${context}`,
          },
        ],
      });

      const textBlock = response.content.find((c: any) => c.type === "text");
      if (textBlock && "text" in textBlock) {
        answer = textBlock.text;
      }
    } else {
      // Mock Fallback response for grounded QA
      answer = `Based on recent customer feedback in your workspace, users frequently report issues regarding application speed and payment processing delays. For example, several entries highlight delayed confirmations during peak times [Citation 1, Citation 2].`;
    }

    return NextResponse.json({
      answer,
      citations,
    });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return unauthorizedResponse(error.message);
    }
    console.error("POST /api/ask-loop error:", error);
    return NextResponse.json({ error: "Failed to answer Ask LOOP query" }, { status: 500 });
  }
}
