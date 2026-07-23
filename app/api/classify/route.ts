import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { getTenantContext, unauthorizedResponse } from "@/lib/tenant-guard";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "mock-key",
});

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

    let sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" = "NEUTRAL";
    let sentimentScore = 0;
    let extractedThemes: string[] = [];

    // Anthropic Claude Structured Analysis
    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "mock-key") {
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `You are an expert customer feedback intelligence AI. Analyze the following feedback item and respond with STRICT JSON ONLY.

Feedback: "${feedback.content}"

JSON Schema:
{
  "sentiment": "POSITIVE" | "NEGATIVE" | "NEUTRAL",
  "sentimentScore": float between -1.0 and 1.0,
  "themes": array of string category names (e.g. "Product Quality", "Application Speed", "Payment Issues", "Customer Support")
}`,
          },
        ],
      });

      const textBlock = response.content.find((c) => c.type === "text");
      if (textBlock) {
        try {
          const parsed = JSON.parse(textBlock.text);
          sentiment = parsed.sentiment ?? "NEUTRAL";
          sentimentScore = typeof parsed.sentimentScore === "number" ? parsed.sentimentScore : 0;
          extractedThemes = Array.isArray(parsed.themes) ? parsed.themes : [];
        } catch (e) {
          console.warn("Failed to parse Claude JSON output:", textBlock.text);
        }
      }
    } else {
      // Mock Fallback Classifier if key is pending configuration
      const contentLower = feedback.content.toLowerCase();
      if (contentLower.includes("great") || contentLower.includes("easy") || contentLower.includes("resolved")) {
        sentiment = "POSITIVE";
        sentimentScore = 0.8;
        extractedThemes = ["Product Quality"];
      } else if (contentLower.includes("slow") || contentLower.includes("issue") || contentLower.includes("delayed")) {
        sentiment = "NEGATIVE";
        sentimentScore = -0.7;
        extractedThemes = contentLower.includes("slow") ? ["Application Speed"] : ["Payment Issues"];
      }
    }

    // Update feedback with classification results
    const updatedFeedback = await db.feedback.update({
      where: { id: feedback.id },
      data: {
        sentiment,
        sentimentScore,
        status: "REVIEWED",
      },
    });

    // Ensure themes exist in current workspace and link them
    for (const themeName of extractedThemes) {
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

    return NextResponse.json({
      message: "Feedback auto-classified successfully",
      feedback: updatedFeedback,
      themes: extractedThemes,
    });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return unauthorizedResponse(error.message);
    }
    console.error("POST /api/classify error:", error);
    return NextResponse.json({ error: "Failed to classify feedback" }, { status: 500 });
  }
}
