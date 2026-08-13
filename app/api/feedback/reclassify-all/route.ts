import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantContext, unauthorizedResponse } from "@/lib/tenant-guard";
import { classifyFeedbackItem } from "@/lib/classify-feedback";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Re-runs classification (sentiment + themes + embedding) on every feedback
 * item in the workspace. Exists for backfilling data that was created before
 * classification/embeddings worked correctly, or after switching embedding
 * models — old embeddings have a different vector dimension and silently
 * stop matching anything in Ask LOOP's semantic search.
 *
 * Runs sequentially with a short delay between items rather than in
 * parallel: Voyage's embeddings API has a fairly tight per-account rate
 * limit, and firing many requests at once reliably triggers 429s.
 */
export async function POST() {
  try {
    const tenant = await getTenantContext();

    const items = await db.feedback.findMany({
      where: { workspaceId: tenant.workspaceId },
      select: { id: true, content: true },
    });

    let succeeded = 0;
    const failures: { id: string; error: string }[] = [];

    for (const item of items) {
      try {
        await classifyFeedbackItem(item, tenant.workspaceId);
        succeeded++;
      } catch (err: any) {
        failures.push({ id: item.id, error: err?.message ?? "Unknown error" });
      }

      // Small pacing delay so we don't burst past Voyage's rate limit.
      await sleep(400);
    }

    return NextResponse.json({
      message: `Reclassified ${succeeded} of ${items.length} feedback items`,
      total: items.length,
      succeeded,
      failed: failures.length,
      failures,
    });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return unauthorizedResponse(error.message);
    }
    console.error("POST /api/feedback/reclassify-all error:", error);
    return NextResponse.json({ error: "Failed to reclassify feedback" }, { status: 500 });
  }
}
