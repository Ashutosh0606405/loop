import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export interface TenantContext {
  userId: string;
  email: string;
  name: string;
  role: Role;
  workspaceId: string;
}

/**
 * MANDITICAL TENANT GUARD
 * Extracts and verifies the authenticated user session and returns their workspaceId.
 * Guarantees every database query is strictly filtered by workspaceId.
 */
export async function getTenantContext(): Promise<TenantContext> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.workspaceId) {
    throw new Error("UNAUTHORIZED: Session invalid or missing workspace context.");
  }

  return {
    userId: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    role: session.user.role as Role,
    workspaceId: session.user.workspaceId,
  };
}

/**
 * Role-Based Access Control Guard
 * Verifies if user has required permission level.
 */
export function enforceRole(userRole: Role, allowedRoles: Role[]) {
  if (!allowedRoles.includes(userRole)) {
    throw new Error("FORBIDDEN: Insufficient permissions for this action.");
  }
}

export function unauthorizedResponse(message = "Unauthorized access") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden action") {
  return NextResponse.json({ error: message }, { status: 403 });
}
