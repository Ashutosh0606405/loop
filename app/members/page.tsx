"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import LoopShell from "@/components/LoopShell";

type Member = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ANALYST" | "VIEWER";
  createdAt: string;
};

export default function MembersPage() {
  const { data: session } = useSession();
  const currentUserRole = (session?.user as any)?.role || "ADMIN";

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Invite Member Form
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "ANALYST" | "VIEWER">("ANALYST");
  const [inviteLoading, setInviteLoading] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/members");
      const data = await res.json();
      if (data?.members && Array.isArray(data.members)) {
        setMembers(data.members);
      }
    } catch (err) {
      console.warn("Error loading members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "ANALYST" | "VIEWER") => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateRole", userId, newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update role");
      } else {
        setSuccess("Role updated successfully!");
        fetchMembers();
      }
    } catch (err) {
      setError("An unexpected error occurred while updating role.");
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setInviteLoading(true);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "invite",
          name: inviteName,
          email: inviteEmail,
          newRole: inviteRole,
        }),
      });
      const data = await res.json();
      setInviteLoading(false);
      if (!res.ok) {
        setError(data.error || "Failed to invite member");
      } else {
        setSuccess(`Successfully added ${inviteName} to team!`);
        setInviteName("");
        setInviteEmail("");
        fetchMembers();
      }
    } catch (err) {
      setInviteLoading(false);
      setError("Error inviting member");
    }
  };

  return (
    <LoopShell
      title="Team & Role-Based Access (RBAC)"
      subtitle="Manage workspace members, assign roles (Admin, Analyst, Viewer), and enforce tenant security."
    >
      <div className="space-y-8">
        {/* Banner Alert for Role */}
        <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-blue-900">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛡️</span>
            <div>
              <p className="text-sm font-bold">Your Current Role: {currentUserRole}</p>
              <p className="text-xs text-blue-700">
                {currentUserRole === "ADMIN"
                  ? "You have full workspace privileges to invite team members and modify RBAC roles."
                  : "You are logged in as " + currentUserRole + ". Role permissions are enforced server-side via API guards."}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            ✅ {success}
          </div>
        )}

        {/* TASK 6 & 7 FIX: Admin Re-indexing & Protection Panel */}
        <div className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <span className="inline-flex rounded-full bg-violet-200 px-3 py-1 text-[11px] font-bold text-violet-900 mb-2">
              ⚡ Admin Maintenance Controls
            </span>
            <h3 className="text-lg font-bold text-slate-900">Bulk Feedback AI Re-Indexing & Classification</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Re-run Gemini AI auto-classification and vector indexing across all workspace feedback entries. 
              <span className="font-bold text-emerald-700"> Human corrections (manually-reviewed items) are automatically flagged and protected from being overwritten.</span>
            </p>
          </div>

          <button
            type="button"
            disabled={currentUserRole === "VIEWER"}
            onClick={async () => {
              setSuccess("Running AI Bulk Re-classification...");
              setError("");
              try {
                const res = await fetch("/api/feedback/reclassify-all", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ onlyUnclassified: false }),
                });
                const data = await res.json();
                if (res.ok) {
                  setSuccess(`✅ ${data.message} (${data.skippedHumanCount || 0} human-reviewed items protected)`);
                } else {
                  setError(data.error || "Failed to run re-classification");
                }
              } catch (e) {
                setError("Error triggering re-classification");
              }
            }}
            className="rounded-xl bg-violet-600 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-violet-700 disabled:opacity-50 shrink-0"
          >
            ⚡ Trigger AI Re-Index
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Members Table */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Workspace Members</h3>
            <p className="text-xs text-slate-500 mb-6">
              Role permissions: Admin (Full control), Analyst (Ingest & Triage), Viewer (Read-only).
            </p>

            {loading ? (
              <div className="py-12 text-center text-sm text-slate-400">Loading team members...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">User</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3.5 font-semibold text-slate-900">
                          {m.name}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">{m.email}</td>
                        <td className="px-4 py-3.5">
                          {currentUserRole === "ADMIN" ? (
                            <select
                              value={m.role}
                              onChange={(e) =>
                                handleRoleChange(m.id, e.target.value as "ADMIN" | "ANALYST" | "VIEWER")
                              }
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm outline-none transition focus:border-blue-500"
                            >
                              <option value="ADMIN">ADMIN</option>
                              <option value="ANALYST">ANALYST</option>
                              <option value="VIEWER">VIEWER</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                m.role === "ADMIN"
                                  ? "bg-purple-100 text-purple-700"
                                  : m.role === "ANALYST"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {m.role}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add / Invite Member Form (Admins only) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Invite Teammate</h3>
            <p className="text-xs text-slate-500 mb-5">
              Add a new member to this workspace with assigned role.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  disabled={currentUserRole !== "ADMIN"}
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  disabled={currentUserRole !== "ADMIN"}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="analyst@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Assign RBAC Role
                </label>
                <select
                  disabled={currentUserRole !== "ADMIN"}
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "ANALYST" | "VIEWER")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white disabled:opacity-50 font-semibold"
                >
                  <option value="ANALYST">ANALYST (Ingest & Manage)</option>
                  <option value="ADMIN">ADMIN (Full Workspace Control)</option>
                  <option value="VIEWER">VIEWER (Read-Only)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={currentUserRole !== "ADMIN" || inviteLoading}
                className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow transition hover:bg-slate-800 disabled:opacity-50"
              >
                {inviteLoading ? "Adding..." : "+ Invite Team Member"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </LoopShell>
  );
}
