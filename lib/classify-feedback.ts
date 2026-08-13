import { db } from "@/lib/db";
import { classificationSchema } from "@/lib/zod-schemas";
import { embedAndStoreFeedback } from "@/lib/embeddings";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

/**
 * Classifies a single feedback item: sentiment + themes via Gemini (with a
 * validated schema and a rule-based fallback), links themes, and refreshes
 * its embedding. Shared by the single-item classify route and the bulk
 * reclassify-all route so there's exactly one place this logic lives.
 */
export async function classifyFeedbackItem(
  feedback: { id: string; content: string },
  workspaceId: string,
) {
  let sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" = "NEUTRAL";
  let sentimentScore = 0;
  let extractedThemes: string[] = [];
  let classifiedByAI = false;
  let aiEngineUsed = "Rule Engine Fallback";

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
            generationConfig: { responseMimeType: "application/json" },
          }),
        },
      );

      if (res.ok) {
        const geminiData = await res.json();
        const jsonText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          // Never trust the model's JSON directly — validate before using it.
          const validated = classificationSchema.safeParse(JSON.parse(jsonText));
          if (validated.success) {
            sentiment = validated.data.sentiment;
            sentimentScore = validated.data.sentimentScore;
            extractedThemes = validated.data.themes;
            classifiedByAI = true;
            aiEngineUsed = "Google Gemini API";
          } else {
            console.warn("Gemini classification failed schema validation:", validated.error.flatten());
          }
        }
      }
    } catch (geminiErr) {
      console.warn("Gemini API call warning:", geminiErr);
    }
  }

  if (!classifiedByAI) {
    // Mock Intelligent Fallback Classifier — used when the key is missing,
    // the call fails, or the model's output didn't pass validation.
    const contentLower = feedback.content.toLowerCase();
    if (
      contentLower.includes("great") ||
      contentLower.includes("easy") ||
      contentLower.includes("resolved") ||
      contentLower.includes("fast")
    ) {
      sentiment = "POSITIVE";
      sentimentScore = 0.85;
      extractedThemes = ["Product Quality"];
    } else if (
      contentLower.includes("slow") ||
      contentLower.includes("issue") ||
      contentLower.includes("delayed") ||
      contentLower.includes("error")
    ) {
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
        workspaceId,
      },
    });

    if (!theme) {
      theme = await db.theme.create({
        data: {
          name: themeName,
          workspaceId,
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

  // Generate and store a vector embedding for this feedback item so
  // Ask LOOP can find it later via semantic search. Never let a failure
  // here break the classification response.
  await embedAndStoreFeedback(feedback.id, feedback.content);

  return {
    feedback: updatedFeedback,
    themes: extractedThemes,
    aiEngine: aiEngineUsed,
  };
}
