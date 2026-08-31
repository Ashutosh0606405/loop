import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { classifyFeedbackItem } from "@/lib/classify-feedback";
import { feedbackStore } from "@/lib/db-store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const workspaceId = session?.user?.workspaceId || "ws-demo-001";

    const userRole = (session?.user as any)?.role || "ADMIN";
    if (userRole === "VIEWER") {
      return NextResponse.json(
        { error: "Forbidden: Read-only Viewer role cannot run re-classification." },
        { status: 403 }
      );
    }

    const { onlyUnclassified } = (await req.json().catch(() => ({}))) || {};

    let itemsToClassify: any[] = [];
    let skippedHumanCount = 0;

    try {
      const whereCondition: any = {
        workspaceId,
        isManuallyReviewed: false,
      };

      if (onlyUnclassified) {
        whereCondition.OR = [{ sentiment: null }, { status: "NEW" }];
      }

      itemsToClassify = await db.feedback.findMany({
        where: whereCondition,
        take: 50,
        orderBy: { createdAt: "desc" },
      });

      skippedHumanCount = await db.feedback.count({
        where: {
          workspaceId,
          isManuallyReviewed: true,
        },
      });
    } catch (e) {
      itemsToClassify = await feedbackStore.list(workspaceId);
      itemsToClassify = itemsToClassify.filter((f) => !f.isManuallyReviewed);
    }

    if (itemsToClassify.length === 0) {
      return NextResponse.json({
        message: "No eligible feedback items need classification.",
        classifiedCount: 0,
        skippedHumanCount,
      });
    }

    let classifiedCount = 0;

    for (const item of itemsToClassify) {
      await classifyFeedbackItem(item, workspaceId);
      classifiedCount++;
    }

    return NextResponse.json({
      message: `Successfully re-classified ${classifiedCount} feedback items with high accuracy!`,
      classifiedCount,
      skippedHumanCount,
    });
  } catch (error: any) {
    console.error("POST /api/feedback/reclassify-all error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
