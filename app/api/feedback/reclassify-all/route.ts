import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getTenantContext,
  enforceRole,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/tenant-guard";
import { classifyFeedbackItem } from "@/lib/classify-feedback";
import { reclassifyAllSchema } from "@/lib/zod-schemas";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Re-runs classification (sentiment + themes + embedding) on feedback in the
 * workspace. Exists for backfilling data created before classification worked,
 * or after switching embedding models — old embeddings have a different vector
 * dimension and silently stop matching anything in Ask LOOP's semantic search.
 *
 * Deliberately batched rather than "do everything":
 *  - each item costs a Gemini call + a Voyage call + a pacing delay, so a few
 *    hundred items is already past any serverless timeout
 *  - the response returns `nextCursor` when more work remains, so the caller
 *    can resume instead of silently processing a partial set and reporting
 *    success
 *
 * Restricted to ADMIN because it overwrites sentiment, including values a
 * human may have corrected by hand.
 */
export async function POST(req: Request) {
  try {
    const tenant = await getTenantContext();
    enforceRole(tenant.role, ["ADMIN"]);

    // Body is optional — default to a single batch from the start.
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const validated = reclassifyAllSchema.safeParse(body ?? {});
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { limit, cursor } = validated.data;

    const totalInWorkspace = await db.feedback.count({
      where: { workspaceId: tenant.workspaceId },
    });

    // Fetch one extra row to determine whether more work remains, so the
    // caller never has to make a wasted empty call to discover it's finished.
    const fetched = await db.feedback.findMany({
      where: { workspaceId: tenant.workspaceId },
      select: { id: true, content: true },
      orderBy: { id: "asc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = fetched.length > limit;
    const items = hasMore ? fetched.slice(0, limit) : fetched;

    let classified = 0;
    let embedded = 0;
    let usedAI = 0;
    const failures: { id: string; error: string }[] = [];

    for (const item of items) {
      try {
        const result = await classifyFeedbackItem(item, tenant.workspaceId);
        classified++;
        if (result.embedded) embedded++;
        if (result.classifiedByAI) usedAI++;
      } catch (err: any) {
        failures.push({ id: item.id, error: err?.message ?? "Unknown error" });
      }

      // Small pacing delay so we don't burst past Voyage's rate limit.
      await sleep(400);
    }

    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return NextResponse.json({
      message:
        `Processed ${items.length} item(s): ${classified} classified, ` +
        `${embedded} embedded${failures.length ? `, ${failures.length} failed` : ""}.`,
      processed: items.length,
      classified,
      // How many actually got a usable embedding. This is the number that
      // matters for Ask LOOP — an item can classify fine and still fail to
      // embed (e.g. Voyage rate limit), which leaves it invisible to search.
      embedded,
      embeddingFailures: classified - embedded,
      // How many got real AI classification vs the keyword fallback.
      classifiedByAI: usedAI,
      failed: failures.length,
      failures,
      // Non-null when more items remain — POST again with this as `cursor`.
      nextCursor,
      hasMore,
      totalInWorkspace,
    });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return unauthorizedResponse(error.message);
    }
    if (error.message?.startsWith("FORBIDDEN")) {
      return forbiddenResponse(error.message);
    }
    console.error("POST /api/feedback/reclassify-all error:", error);
    return NextResponse.json({ error: "Failed to reclassify feedback" }, { status: 500 });
  }
}
