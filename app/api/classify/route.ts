import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantContext, unauthorizedResponse } from "@/lib/tenant-guard";
import { classifyFeedbackItem } from "@/lib/classify-feedback";

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

    const result = await classifyFeedbackItem(feedback, tenant.workspaceId);

    return NextResponse.json({
      message: "Feedback auto-classified successfully",
      feedback: result.feedback,
      themes: result.themes,
      aiEngine: result.aiEngine,
    });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return unauthorizedResponse(error.message);
    }
    console.error("POST /api/classify error:", error);
    return NextResponse.json({ error: "Failed to classify feedback" }, { status: 500 });
  }
}
