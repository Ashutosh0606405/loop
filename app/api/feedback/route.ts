import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantContext, unauthorizedResponse } from "@/lib/tenant-guard";
import { createFeedbackSchema, feedbackQuerySchema } from "@/lib/zod-schemas";

export const dynamic = "force-dynamic";

/**
 * GET /api/feedback
 * Returns paginated & filtered feedback items scoped STRICTLY to authenticated workspaceId.
 */
export async function GET(req: Request) {
  try {
    const tenant = await getTenantContext();
    const { searchParams } = new URL(req.url);

    const queryValidation = feedbackQuerySchema.safeParse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
      search: searchParams.get("search") ?? undefined,
      channel: searchParams.get("channel") ?? undefined,
      sentiment: searchParams.get("sentiment") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      themeId: searchParams.get("themeId") ?? undefined,
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryValidation.error.format() },
        { status: 400 }
      );
    }

    const { page, limit, search, channel, sentiment, status, themeId } = queryValidation.data;
    const skip = (page - 1) * limit;

    // MANDATORY TENANT FILTERING
    const where: any = {
      workspaceId: tenant.workspaceId,
    };

    if (search) {
      where.OR = [
        { content: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (channel) {
      where.channel = channel;
    }

    if (sentiment) {
      where.sentiment = sentiment;
    }

    if (status) {
      where.status = status;
    }

    if (themeId) {
      where.themes = {
        some: {
          themeId: themeId,
        },
      };
    }

    const [total, feedbacks] = await Promise.all([
      db.feedback.count({ where }),
      db.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          themes: {
            include: {
              theme: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: feedbacks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return unauthorizedResponse(error.message);
    }
    console.error("GET /api/feedback error:", error);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}

/**
 * POST /api/feedback
 * Ingest single feedback entry scoped STRICTLY to authenticated workspaceId.
 */
export async function POST(req: Request) {
  try {
    const tenant = await getTenantContext();
    const body = await req.json();

    const validated = createFeedbackSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { content, channel, customerName } = validated.data;

    // Create feedback scoped strictly to tenant workspace
    const newFeedback = await db.feedback.create({
      data: {
        content,
        channel: channel || "Web Form",
        customerName: customerName || "Anonymous Customer",
        status: "NEW",
        workspaceId: tenant.workspaceId,
      },
    });

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return unauthorizedResponse(error.message);
    }
    console.error("POST /api/feedback error:", error);
    return NextResponse.json({ error: "Failed to ingest feedback" }, { status: 500 });
  }
}

/**
 * PATCH /api/feedback
 * Update feedback item fields (status, sentiment) and flag as human-reviewed.
 */
export async function PATCH(req: Request) {
  try {
    const tenant = await getTenantContext();
    const { id, status, sentiment, sentimentScore } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Feedback id is required" }, { status: 400 });
    }

    const updated = await db.feedback.updateMany({
      where: {
        id,
        workspaceId: tenant.workspaceId,
      },
      data: {
        ...(status && { status }),
        ...(sentiment && { sentiment }),
        ...(typeof sentimentScore === "number" && { sentimentScore }),
        isManuallyReviewed: true, // TASK 7 FIX: Mark as human reviewed so bulk re-classify will not overwrite
      },
    });

    return NextResponse.json({ message: "Feedback updated and marked as human reviewed", count: updated.count });
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return unauthorizedResponse(error.message);
    }
    console.error("PATCH /api/feedback error:", error);
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
  }
}
