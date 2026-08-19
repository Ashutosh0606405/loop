import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantContext, unauthorizedResponse } from "@/lib/tenant-guard";

export const dynamic = "force-dynamic";
import { classifyFeedbackItem } from "@/lib/classify-feedback";
import { classifyRequestSchema } from "@/lib/zod-schemas";

export async function POST(req: Request) {
  try {
    const tenant = await getTenantContext();
    const body = await req.json();

    const validated = classifyRequestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { feedbackId } = validated.data;

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
