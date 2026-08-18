import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantContext, unauthorizedResponse } from "@/lib/tenant-guard";
import { bulkIngestSchema } from "@/lib/zod-schemas";

export async function POST(req: Request) {
  try {
    const tenant = await getTenantContext();
    const body = await req.json();

    const validated = bulkIngestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { items } = validated.data;

    // Mass create feedback items attached strictly to tenant.workspaceId
    const feedbackRecords = items.map((item: { content: string; channel?: string; customerName?: string }) => ({
      content: item.content,
      channel: item.channel || "CSV Import",
      customerName: item.customerName || "Anonymous Customer",
      status: "NEW" as const,
      workspaceId: tenant.workspaceId,
    }));

    const result = await db.feedback.createMany({
      data: feedbackRecords,
    });

    // Deliberately NOT classified inline: each item costs a Gemini call plus a
    // rate-limited embedding call, so a full CSV would blow past the request
    // timeout. These rows exist but have no sentiment, no themes and no
    // embedding, which means Ask LOOP cannot find them semantically until
    // /api/feedback/reclassify-all is run. Say so explicitly rather than
    // letting the UI imply the AI has already processed them.
    return NextResponse.json(
      {
        message: `Successfully ingested ${result.count} feedback entries`,
        count: result.count,
        classification: {
          pending: result.count,
          note: "Imported feedback is not classified or embedded yet. Run reclassify to make it searchable by Ask LOOP.",
          endpoint: "/api/feedback/reclassify-all",
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return unauthorizedResponse(error.message);
    }
    console.error("POST /api/feedback/bulk error:", error);
    return NextResponse.json({ error: "Failed to perform bulk ingestion" }, { status: 500 });
  }
}
