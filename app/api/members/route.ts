import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await db.user.findMany({
      where: { workspaceId: session.user.workspaceId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ members });
  } catch (error: any) {
    console.error("GET /api/members error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role guard: Only ADMIN can invite or change roles
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only workspace Admins can manage members and roles." },
        { status: 403 }
      );
    }

    const { action, userId, newRole, email, name } = await req.json();

    if (action === "updateRole" && userId && newRole) {
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { role: newRole },
      });
      return NextResponse.json({ message: "User role updated", user: updatedUser });
    }

    if (action === "invite" && email && name && newRole) {
      const existing = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
      if (existing) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
      }

      const newUser = await db.user.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          passwordHash: "INVITED_TEAM_MEMBER",
          role: newRole,
          workspaceId: session.user.workspaceId,
        },
      });

      return NextResponse.json({ message: "Member invited successfully", user: newUser });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/members error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
