import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { getTenantContext, unauthorizedResponse } from "@/lib/tenant-guard";
import { askLoopQuerySchema } from "@/lib/zod-schemas";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "mock-key",
});

// Brief Section 05 specifies this model — keep it in sync with classify/route.ts
const CLAUDE_MODEL = "claude-sonnet-4-6";

function hasRealApiKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY) && process.env.ANTHROPIC_API_KEY !== "mock-key";
}

// --- Embedding + similarity (AI3) ---
// Same embedding approach as classify/route.ts (kept duplicated on purpose for
// now, rather than a shared lib file — see internship diary for why. Worth
// extracting to lib/search.ts together once we build the next AI feature.)
const EMBEDDING_DIMENSIONS = 512;

async function embedText(text: string): Promise<number[]> {
  if (!process.env.VOYAGE_API_KEY) {
    const vector = new Array(EMBEDDING_DIMENSIONS).fill(0);
    for (let i = 0; i < text.length; i++) {
      vector[i % EMBEDDING_DIMENSIONS] += text.charCodeAt(i) / 255;
    }
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map((v) => v / magnitude);
  }

  const response = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: [text], model: "voyage-3-lite" }),
  });

  if (!response.ok) {
    throw new Error(`Voyage embeddings request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding as number[];
}

// Standard cosine similarity: 1 = identical meaning, 0 = unrelated.
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export async function POST(req: Request) {
  try {
    const tenant = await getTenantContext();
    const body = await req.json();

    const validated = askLoopQuerySchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { question } = validated.data;

    // --- Real retrieval step (replaces the old "grab 15 most recent" logic) ---
    const questionVector = await embedText(question);

    const embeddings = await db.embedding.findMany({
      where: { feedback: { workspaceId: tenant.workspaceId } },
      include: { feedback: true },
    });

    const retrieved = embeddings
      .filter((e) => e.vector)
      .map((e) => ({
        feedback: e.feedback,
        score: cosineSimilarity(questionVector, JSON.parse(e.vector as string)),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    if (retrieved.length === 0) {
      return NextResponse.json({
        answer:
          "No customer feedback found in your workspace yet. Please ingest and classify feedback before asking questions.",
        citations: [],
      });
    }

    // --- Generation step: Claude only ever sees these retrieved items ---
    let answer: string;

    if (!hasRealApiKey()) {
      answer = `(Demo mode — no ANTHROPIC_API_KEY set) Found ${retrieved.length} relevant feedback item(s) for this question.`;
    } else {
      const context = retrieved
        .map(
          (r, idx) =>
            `[Citation ${idx + 1}] Customer: ${r.feedback.customerName || "Anonymous"} | Channel: ${r.feedback.channel} | Feedback: "${r.feedback.content}"`,
        )
        .join("\n");

      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 800,
        messages: [
          {
            role: "user",
            content: `You are LOOP, an AI customer-feedback intelligence assistant. Answer the question using ONLY the feedback provided below. Cite specific items using [Citation X] format. If the provided feedback does not contain the answer, say so plainly — never invent feedback that isn't listed here.

Question: "${question}"

Retrieved customer feedback:
${context}`,
          },
        ],
      });

      const textBlock = response.content.find((c) => c.type === "text");
      answer = textBlock && "text" in textBlock ? textBlock.text : "Unable to generate an answer.";
    }

    const citations = retrieved.map((r, idx) => ({
      id: r.feedback.id,
      index: idx + 1,
      customer: r.feedback.customerName || "Anonymous Customer",
      channel: r.feedback.channel,
      content: r.feedback.content,
      sentiment: r.feedback.sentiment || "NEUTRAL",
      relevanceScore: Math.round(r.score * 100) / 100,
    }));

    return NextResponse.json({ answer, citations });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return unauthorizedResponse(error.message);
    }
    console.error("POST /api/ask-loop error:", error);
    return NextResponse.json({ error: "Failed to answer Ask LOOP query" }, { status: 500 });
  }
}
