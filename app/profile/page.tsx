"use client";

import Link from "next/link";

import {
  useSession,
} from "next-auth/react";

import {
  useMemo,
  type ReactNode,
} from "react";

import LoopShell from "../../components/LoopShell";

type SessionUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  workspaceId?: string | null;
};

export default function ProfilePage() {
  const {
    data: session,
    status,
  } = useSession();

  const user =
    session?.user as
      | SessionUser
      | undefined;

  const displayName =
    user?.name?.trim() ||
    user?.email?.trim() ||
    "LOOP User";

  const email =
    user?.email?.trim() || "";

  const role =
    formatRole(
      user?.role,
    );

  const initials =
    useMemo(
      () =>
        getInitials(
          displayName,
        ),
      [displayName],
    );

  const workspaceConnected =
    Boolean(
      user?.workspaceId,
    );

  const isLoading =
    status === "loading";

  const isAuthenticated =
    status ===
      "authenticated" &&
    Boolean(user);

  return (
    <LoopShell
      title="Profile"
      subtitle="View your signed-in LOOP account and workspace access."
    >
      <div className="mx-auto max-w-6xl space-y-5">
        {isLoading ? (
          <ProfileSkeleton />
        ) : !isAuthenticated ? (
          <SignedOutState />
        ) : (
          <>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.02] dark:border-slate-800 dark:bg-slate-900">
              <div className="relative overflow-hidden bg-[#0b1220] px-6 py-8 sm:px-8 sm:py-10">
                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-violet-600/15 blur-3xl" />

                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl font-semibold text-white shadow-xl">
                      {initials}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                          {displayName}
                        </h2>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                          Signed in
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-400">
                        {role}
                      </p>

                      {email && (
                        <p className="mt-1 text-xs text-slate-500">
                          {email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/settings"
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white transition hover:bg-white/10"
                    >
                      <SettingsIcon />

                      Settings
                    </Link>

                    <Link
                      href="/dashboard"
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-slate-950 transition hover:bg-slate-100"
                    >
                      Dashboard

                      <ArrowIcon />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid gap-px bg-slate-200 dark:bg-slate-800 sm:grid-cols-3">
                <ProfileStat
                  label="Workspace role"
                  value={role}
                  icon={
                    <RoleIcon />
                  }
                />

                <ProfileStat
                  label="Account"
                  value="Signed in"
                  icon={
                    <AccountIcon />
                  }
                />

                <ProfileStat
                  label="Workspace"
                  value={
                    workspaceConnected
                      ? "Connected"
                      : "Not available"
                  }
                  icon={
                    <WorkspaceIcon />
                  }
                />
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              <Panel
                title="Account information"
                description="Identity information available from your current authenticated session."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <InformationCard
                    label="Display name"
                    value={
                      user?.name?.trim() ||
                      "Not provided"
                    }
                    icon={
                      <UserIcon />
                    }
                  />

                  <InformationCard
                    label="Email address"
                    value={
                      email ||
                      "Not provided"
                    }
                    icon={
                      <MailIcon />
                    }
                  />

                  <InformationCard
                    label="Workspace role"
                    value={role}
                    icon={
                      <RoleIcon />
                    }
                  />

                  <InformationCard
                    label="Session status"
                    value="Authenticated"
                    icon={
                      <CheckIcon />
                    }
                  />
                </div>

                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                  <div className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      <InfoIcon />
                    </span>

                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        Profile data source
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-400">
                        This page displays information from your authenticated LOOP session. It does not create local placeholder profile details.
                      </p>
                    </div>
                  </div>
                </div>
              </Panel>

              <div className="space-y-5">
                <Panel
                  title="Workspace access"
                  description="Your current connection to the LOOP workspace."
                >
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          workspaceConnected
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                        }`}
                      >
                        <WorkspaceIcon />
                      </span>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {workspaceConnected
                            ? "Workspace connected"
                            : "Workspace unavailable"}
                        </p>

                        <p className="mt-1 text-[10px] leading-5 text-slate-500 dark:text-slate-400">
                          {workspaceConnected
                            ? "Your authenticated session is linked to a LOOP workspace."
                            : "No workspace identifier is available in the current session."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Access role
                      </span>

                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {role}
                      </span>
                    </div>
                  </div>
                </Panel>

                <Panel
                  title="Quick access"
                  description="Continue working in your workspace."
                >
                  <div className="space-y-2">
                    <QuickLink
                      href="/dashboard"
                      title="Dashboard"
                      description="View workspace feedback metrics."
                      icon={
                        <DashboardIcon />
                      }
                    />

                    <QuickLink
                      href="/feedback"
                      title="Feedback"
                      description="Search and review customer feedback."
                      icon={
                        <FeedbackIcon />
                      }
                    />

                    <QuickLink
                      href="/ask-loop"
                      title="Ask LOOP"
                      description="Ask questions against workspace feedback."
                      icon={
                        <SparkleIcon />
                      }
                    />

                    <QuickLink
                      href="/reports"
                      title="Reports"
                      description="Explore feedback trends and summaries."
                      icon={
                        <ReportIcon />
                      }
                    />
                  </div>
                </Panel>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/[0.02] dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    <LockIcon />
                  </span>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                      Account settings
                    </h3>

                    <p className="mt-1 max-w-2xl text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                      Profile editing is not shown here because the current frontend does not have a verified profile-update API. Account preferences remain available from Settings.
                    </p>
                  </div>
                </div>

                <Link
                  href="/settings"
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Open settings

                  <ArrowIcon />
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </LoopShell>
  );
}

function formatRole(
  role?: string | null,
) {
  const value =
    role?.trim();

  if (!value) {
    return "Member";
  }

  return value
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function getInitials(
  value: string,
) {
  const initials =
    value
      .split(
        /[\s@._-]+/,
      )
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part
          .charAt(0)
          .toUpperCase(),
      )
      .join("");

  return initials || "L";
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/[0.02] dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
          {title}
        </h2>

        <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}

function ProfileStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 bg-white px-5 py-4 dark:bg-slate-900">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[10px] font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-xs font-semibold text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function InformationCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
          {icon}
        </span>

        <div className="min-w-0">
          <p className="text-[10px] font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-xs font-semibold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50/40 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/40"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-blue-950/40 dark:group-hover:text-blue-300">
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[10px] text-slate-400">
          {description}
        </p>
      </div>

      <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500">
        <ArrowIcon />
      </span>
    </Link>
  );
}

function SignedOutState() {
  return (
    <section className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <UserIcon />
      </span>

      <h2 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">
        Account session unavailable
      </h2>

      <p className="mt-2 max-w-md text-xs leading-6 text-slate-500 dark:text-slate-400">
        LOOP could not find an authenticated user session for this page.
      </p>

      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-500"
      >
        Return to sign in

        <ArrowIcon />
      </Link>
    </section>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-56 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="h-[360px] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />

        <div className="space-y-5">
          <div className="h-44 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />

          <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
      />

      <path
        strokeLinecap="round"
        d="M5 21a7 7 0 0 1 14 0"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4 7 8 6 8-6"
      />
    </svg>
  );
}

function RoleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="7"
        width="16"
        height="12"
        rx="2"
      />

      <path
        strokeLinecap="round"
        d="M9 7V5h6v2M4 12h16"
      />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8 12 2.5 2.5L16 9"
      />
    </svg>
  );
}

function WorkspaceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
      />

      <path
        strokeLinecap="round"
        d="M8 8h8M8 12h8M8 16h5"
      />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1.5"
      />

      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1.5"
      />

      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1.5"
      />

      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1.5"
      />
    </svg>
  );
}

function FeedbackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 5h14v10H9l-4 4V5Z"
      />

      <path
        strokeLinecap="round"
        d="M8 9h8M8 12h5"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
      />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        d="M5 20V11m7 9V5m7 15v-7"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="3"
      />

      <path
        strokeLinecap="round"
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />

      <path
        strokeLinecap="round"
        d="M8 10V7a4 4 0 0 1 8 0v3"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path
        strokeLinecap="round"
        d="M12 10v6M12 7h.01"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 12 4 4L19 6"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 5 7 7-7 7"
      />
    </svg>
  );
}
