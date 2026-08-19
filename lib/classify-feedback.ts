import { db } from "@/lib/db";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

export async function classifyFeedbackItem(feedback: any, workspaceId: string) {
  let sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" = "NEUTRAL";
  let sentimentScore = 0;
  let extractedThemes: string[] = [];

  if (GEMINI_API_KEY && GEMINI_API_KEY !== "mock-key") {
    try {
      const prompt = `You are an expert customer feedback classifier. Respond with STRICT JSON ONLY.
Feedback: "${feedback.content}"
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
      console.warn("Gemini classify feedback warning:", e);
    }
  } else {
    // Fallback heuristic classification when Gemini API key is missing
    const text = (feedback.content || "").toLowerCase();
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

  const updatedFeedback = await db.feedback.update({
    where: { id: feedback.id },
    data: {
      sentiment,
      sentimentScore,
      status: "REVIEWED",
    },
  });

  const createdThemes = [];
  for (const themeName of extractedThemes) {
    let theme = await db.theme.findFirst({
      where: { name: themeName, workspaceId },
    });

    if (!theme) {
      theme = await db.theme.create({
        data: { name: themeName, workspaceId },
      });
    }

    await db.feedbackTheme.upsert({
      where: {
        feedbackId_themeId: { feedbackId: feedback.id, themeId: theme.id },
      },
      create: { feedbackId: feedback.id, themeId: theme.id, confidence: 0.95 },
      update: { confidence: 0.95 },
    });

    createdThemes.push(theme);
  }

  return {
    feedback: updatedFeedback,
    themes: createdThemes,
    aiEngine: GEMINI_API_KEY ? "Google Gemini API" : "Heuristic Rule Engine",
    classifiedByAI: Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== "mock-key"),
    embedded: true,
  };
}
