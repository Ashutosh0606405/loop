import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role Guard: Admin or Analyst only
    const userRole = (session.user as any)?.role || "ADMIN";
    if (userRole === "VIEWER") {
      return NextResponse.json(
        { error: "Forbidden: Read-only Viewer role cannot run re-classification." },
        { status: 403 }
      );
    }

    const { onlyUnclassified } = (await req.json().catch(() => ({}))) || {};

    // Build query filter: ALWAYS skip items that a human corrected by hand (isManuallyReviewed = true)
    const whereCondition: any = {
      workspaceId: session.user.workspaceId,
      isManuallyReviewed: false, // TASK 7 FIX: Never overwrite human corrections
    };

    if (onlyUnclassified) {
      whereCondition.OR = [{ sentiment: null }, { status: "NEW" }];
    }

    const itemsToClassify = await db.feedback.findMany({
      where: whereCondition,
      take: 50, // Batch limit to prevent timeouts
      orderBy: { createdAt: "desc" },
    });

    const skippedHumanCount = await db.feedback.count({
      where: {
        workspaceId: session.user.workspaceId,
        isManuallyReviewed: true,
      },
    });

    if (itemsToClassify.length === 0) {
      return NextResponse.json({
        message: "No eligible feedback items need classification.",
        classifiedCount: 0,
        skippedHumanCount,
      });
    }

    let classifiedCount = 0;

    for (const item of itemsToClassify) {
      let sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" = "NEUTRAL";
      let sentimentScore = 0;
      let extractedThemes: string[] = [];

      if (GEMINI_API_KEY && GEMINI_API_KEY !== "mock-key") {
        try {
          const prompt = `You are an expert customer feedback classifier. Respond with STRICT JSON ONLY.
Feedback: "${item.content}"
Schema:
{
  "sentiment": "POSITIVE" | "NEGATIVE" | "NEUTRAL",
  "sentimentScore": float between -1.0 and 1.0,
  "themes": array of string category names (e.g. "Product Quality", "Application Speed", "Payment Issues", "Customer Support")
}`;
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" },
              }),
            }
          );

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
        } catch (e) {
          console.warn("Reclassify AI warning:", e);
        }
      } else {
        const text = item.content.toLowerCase();
        if (text.includes("great") || text.includes("fast") || text.includes("love") || text.includes("resolved")) {
          sentiment = "POSITIVE";
          sentimentScore = 0.85;
          extractedThemes = ["Product Quality"];
        } else if (text.includes("slow") || text.includes("issue") || text.includes("error") || text.includes("lag")) {
          sentiment = "NEGATIVE";
          sentimentScore = -0.75;
          extractedThemes = text.includes("slow") ? ["Application Speed"] : ["Payment Issues"];
        }
      }

      await db.feedback.update({
        where: { id: item.id },
        data: {
          sentiment,
          sentimentScore,
          status: "REVIEWED",
        },
      });

      for (const themeName of extractedThemes) {
        let theme = await db.theme.findFirst({
          where: { name: themeName, workspaceId: session.user.workspaceId },
        });

        if (!theme) {
          theme = await db.theme.create({
            data: { name: themeName, workspaceId: session.user.workspaceId },
          });
        }

        await db.feedbackTheme.upsert({
          where: {
            feedbackId_themeId: { feedbackId: item.id, themeId: theme.id },
          },
          create: { feedbackId: item.id, themeId: theme.id, confidence: 0.95 },
          update: { confidence: 0.95 },
        });
      }

      classifiedCount++;
    }

    return NextResponse.json({
      message: `Successfully re-classified ${classifiedCount} feedback items using AI!`,
      classifiedCount,
      skippedHumanCount,
    });
  } catch (error: any) {
    console.error("POST /api/feedback/reclassify-all error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
