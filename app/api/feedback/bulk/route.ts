import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantContext, unauthorizedResponse } from "@/lib/tenant-guard";
import { bulkIngestSchema } from "@/lib/zod-schemas";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const tenant = await getTenantContext();
    const body = await req.json();

    const rawItems = Array.isArray(body?.items) ? body.items : [];
    
    // Sanitize incoming items to ensure non-empty content
    const sanitizedItems = rawItems
      .map((item: any) => ({
        content: String(item?.content || item?.feedback || item?.message || "").trim(),
        channel: String(item?.channel || item?.source || "CSV Import").trim() || "CSV Import",
        customerName: String(item?.customerName || item?.customer || item?.name || "Anonymous Customer").trim() || "Anonymous Customer",
      }))
      .filter((item: { content: string }) => item.content.length > 0);

    if (sanitizedItems.length === 0) {
      return NextResponse.json(
        { error: "No valid non-empty feedback entries found in the request." },
        { status: 400 }
      );
    }

    const validated = bulkIngestSchema.safeParse({ items: sanitizedItems });
    if (!validated.success) {
      return NextResponse.json(
        { error: "CSV validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { items } = validated.data;

    // Ensure workspace record exists to prevent Foreign Key constraint error
    await db.workspace.upsert({
      where: { id: tenant.workspaceId },
      update: {},
      create: {
        id: tenant.workspaceId,
        name: "Acme Corp Feedback Intelligence",
      },
    }).catch((e) => console.warn("Auto-create workspace non-fatal warning:", e));

    // Mass create feedback items attached strictly to tenant.workspaceId
    const feedbackRecords = items.map((item: { content: string; channel?: string; customerName?: string }) => ({
      content: item.content,
      channel: item.channel || "CSV Import",
      customerName: item.customerName || "Anonymous Customer",
      status: "NEW" as const,
      workspaceId: tenant.workspaceId,
    }));

    let createdCount = 0;

    try {
      const result = await db.feedback.createMany({
        data: feedbackRecords,
      });
      createdCount = result.count;
    } catch (createManyErr) {
      console.warn("createMany failed, falling back to batch create:", createManyErr);
      // Fallback for Supabase PgBouncer pooler environments where createMany is unsupported
      for (const rec of feedbackRecords) {
        await db.feedback.create({ data: rec });
        createdCount++;
      }
    }

    return NextResponse.json(
      {
        message: `Successfully ingested ${createdCount} feedback entries`,
        count: createdCount,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return unauthorizedResponse(error.message);
    }
    console.error("POST /api/feedback/bulk error:", error);
    return NextResponse.json({ error: error?.message || "Failed to perform bulk ingestion" }, { status: 500 });
  }
}
