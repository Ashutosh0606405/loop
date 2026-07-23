import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { db } from "@/lib/db";
import { getTenantContext, unauthorizedResponse } from "@/lib/tenant-guard";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "mock-key",
});

// Brief Section 05 specifies this model — keep it in sync with ask-loop/route.ts
const CLAUDE_MODEL = "claude-sonnet-4-6";

function hasRealApiKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY) && process.env.ANTHROPIC_API_KEY !== "mock-key";
}

// --- Embedding (AI3 groundwork) ---
// Turns feedback text into a vector so Ask LOOP can find it later by
// meaning, not just recency. Falls back to a deterministic mock vector
// if VOYAGE_API_KEY isn't set yet — keeps this endpoint runnable either way.
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

async function embedAndStoreFeedback(feedbackId: string, content: string) {
  const vector = await embedText(content);
  const serialized = JSON.stringify(vector);
  const existing = await db.embedding.findFirst({ where: { feedbackId } });

  if (existing) {
    await db.embedding.update({ where: { id: existing.id }, data: { vector: serialized } });
  } else {
    await db.embedding.create({ data: { feedbackId, vector: serialized } });
  }
}

// AI1 — strict, validated shape for Claude's classification output.
// If Claude's JSON doesn't match this, we fall back instead of saving garbage
// (brief Section 09.1: "validate it with Zod... fall back gracefully").
const classificationSchema = z.object({
  sentiment: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.string()).default([]),
});
type ClassificationResult = z.infer<typeof classificationSchema>;

function mockClassify(content: string): ClassificationResult {
  const lower = content.toLowerCase();
  if (lower.includes("great") || lower.includes("easy") || lower.includes("resolved")) {
    return { sentiment: "POSITIVE", sentimentScore: 0.8, themes: ["Product Quality"] };
  }
  if (lower.includes("slow") || lower.includes("issue") || lower.includes("delayed")) {
    return {
      sentiment: "NEGATIVE",
      sentimentScore: -0.7,
      themes: [lower.includes("slow") ? "Application Speed" : "Payment Issues"],
    };
  }
  return { sentiment: "NEUTRAL", sentimentScore: 0, themes: [] };
}

async function classifyFeedback(content: string): Promise<ClassificationResult> {
  if (!hasRealApiKey()) {
    return mockClassify(content);
  }

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `You are an expert customer feedback intelligence AI. Analyze the following feedback item and respond with STRICT JSON ONLY — no markdown fences, no extra commentary.

Feedback: "${content}"

JSON Schema:
{
  "sentiment": "POSITIVE" | "NEGATIVE" | "NEUTRAL",
  "sentimentScore": float between -1.0 and 1.0,
  "themes": array of short category names (e.g. "Product Quality", "Application Speed", "Payment Issues", "Customer Support")
}`,
      },
    ],
  });

  const textBlock = response.content.find((c) => c.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    const validated = classificationSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn("classify: Zod validation failed, falling back to mock.", validated.error.flatten());
      return mockClassify(content);
    }
    return validated.data;
  } catch {
    console.warn("classify: failed to parse Claude JSON output:", raw);
    return mockClassify(content);
  }
}

export async function POST(req: Request) {
  try {
    const tenant = await getTenantContext();
    const { feedbackId } = await req.json();

    if (!feedbackId) {
      return NextResponse.json({ error: "feedbackId is required" }, { status: 400 });
    }

    // Retrieve feedback ensuring strict tenant workspaceId filtering
    const feedback = await db.feedback.findFirst({
      where: {
        id: feedbackId,
        workspaceId: tenant.workspaceId,
      },
    });

    if (!feedback) {
      return NextResponse.json({ error: "Feedback item not found" }, { status: 404 });
    }

    const result = await classifyFeedback(feedback.content);

    const updatedFeedback = await db.feedback.update({
      where: { id: feedback.id },
      data: {
        sentiment: result.sentiment,
        sentimentScore: result.sentimentScore,
        status: "REVIEWED",
      },
    });

    // Ensure themes exist in current workspace and link them
    for (const themeName of result.themes) {
      let theme = await db.theme.findFirst({
        where: {
          name: themeName,
          workspaceId: tenant.workspaceId,
        },
      });

      if (!theme) {
        theme = await db.theme.create({
          data: {
            name: themeName,
            workspaceId: tenant.workspaceId,
          },
        });
      }

      await db.feedbackTheme.upsert({
        where: {
          feedbackId_themeId: {
            feedbackId: feedback.id,
            themeId: theme.id,
          },
        },
        create: {
          feedbackId: feedback.id,
          themeId: theme.id,
          confidence: 0.95,
        },
        update: {
          confidence: 0.95,
        },
      });
    }

    // Embed now so this feedback is actually findable by Ask LOOP later
    await embedAndStoreFeedback(feedback.id, feedback.content);

    return NextResponse.json({
      message: "Feedback auto-classified successfully",
      feedback: updatedFeedback,
      themes: result.themes,
    });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return unauthorizedResponse(error.message);
    }
    console.error("POST /api/classify error:", error);
    return NextResponse.json({ error: "Failed to classify feedback" }, { status: 500 });
  }
}
