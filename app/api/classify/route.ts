import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantContext, unauthorizedResponse } from "@/lib/tenant-guard";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

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

    // 1. Google Gemini AI Engine
    if (GEMINI_API_KEY && GEMINI_API_KEY !== "mock-key") {
      try {
        const prompt = `You are an expert customer feedback intelligence AI. Analyze the following feedback item and respond with STRICT JSON ONLY.

Feedback: "${feedback.content}"

JSON Schema:
{
  "sentiment": "POSITIVE" | "NEGATIVE" | "NEUTRAL",
  "sentimentScore": float between -1.0 and 1.0,
  "themes": array of string category names (e.g. "Product Quality", "Application Speed", "Payment Issues", "Customer Support")
}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          }),
        });

        if (res.ok) {
          const geminiData = await res.json();
          const jsonText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            sentiment = parsed.sentiment ?? "NEUTRAL";
            sentimentScore = typeof parsed.sentimentScore === "number" ? parsed.sentimentScore : 0;
            extractedThemes = Array.isArray(parsed.themes) ? parsed.themes : [];
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API call warning:", geminiErr);
      }
    } else {
      // Mock Intelligent Fallback Classifier if key is pending configuration
      const contentLower = feedback.content.toLowerCase();
      if (contentLower.includes("great") || contentLower.includes("easy") || contentLower.includes("resolved") || contentLower.includes("fast")) {
        sentiment = "POSITIVE";
        sentimentScore = 0.85;
        extractedThemes = ["Product Quality"];
      } else if (contentLower.includes("slow") || contentLower.includes("issue") || contentLower.includes("delayed") || contentLower.includes("error")) {
        sentiment = "NEGATIVE";
        sentimentScore = -0.75;
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
      aiEngine: GEMINI_API_KEY ? "Google Gemini API" : "Rule Engine Fallback",
    });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return unauthorizedResponse(error.message);
    }
    console.error("POST /api/classify error:", error);
    return NextResponse.json({ error: "Failed to classify feedback" }, { status: 500 });
  }
}
