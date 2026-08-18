"use client";

import Link from "next/link";

import {
  signOut,
  useSession,
} from "next-auth/react";

import {
  useState,
  type ReactNode,
} from "react";

import LoopShell from "../../components/LoopShell";

import {
  useTheme,
  type ThemePreference,
} from "../../components/Providers";

type SettingsTab =
  | "account"
  | "appearance"
  | "security";

type SessionUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  workspaceId?: string | null;
};

const themeOptions: {
  value: ThemePreference;
  title: string;
  description: string;
  icon: "light" | "dark" | "system";
}[] = [
  {
    value: "light",
    title: "Light",
    description:
      "Use a bright interface throughout LOOP.",
    icon: "light",
  },
  {
    value: "dark",
    title: "Dark",
    description:
      "Use a darker interface for reduced glare.",
    icon: "dark",
  },
  {
    value: "system",
    title: "System",
    description:
      "Follow your device appearance automatically.",
    icon: "system",
  },
];

export default function SettingsPage() {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<SettingsTab>(
      "account",
    );

  const {
    data: session,
    status,
  } = useSession();

  const {
    theme,
    resolvedTheme,
    mounted,
    setTheme,
  } = useTheme();

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

  const workspaceConnected =
    Boolean(
      user?.workspaceId,
    );

  const isAuthenticated =
    status ===
      "authenticated" &&
    Boolean(user);

  const initials =
    getInitials(
      displayName,
    );

  const currentThemeLabel =
    !mounted
      ? "Loading"
      : theme === "system"
        ? `System · ${
            resolvedTheme ===
            "dark"
              ? "Dark"
              : "Light"
          }`
        : theme === "dark"
          ? "Dark"
          : "Light";

  return (
    <LoopShell
      title="Settings"
      subtitle="Manage verified account information and workspace appearance."
    >
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.02] dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-[#0b1220] px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-lg font-semibold text-white">
                  {initials}
                </span>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-400">
                    Account settings
                  </p>

                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
                    {displayName}
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    {role} · Project LOOP
                  </p>
                </div>
              </div>

              <Link
                href="/profile"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                <UserIcon />

                View profile
              </Link>
            </div>
          </div>

          <div className="flex overflow-x-auto border-t border-slate-800 bg-[#0b1220] px-3 sm:px-5">
            <TabButton
              label="Account"
              active={
                activeTab ===
                "account"
              }
              onClick={() =>
                setActiveTab(
                  "account",
                )
              }
              icon={
                <UserIcon />
              }
            />

            <TabButton
              label="Appearance"
              active={
                activeTab ===
                "appearance"
              }
              onClick={() =>
                setActiveTab(
                  "appearance",
                )
              }
              icon={
                <AppearanceIcon />
              }
            />

            <TabButton
              label="Security"
              active={
                activeTab ===
                "security"
              }
              onClick={() =>
                setActiveTab(
                  "security",
                )
              }
              icon={
                <SecurityIcon />
              }
            />
          </div>
        </section>

        {status ===
        "loading" ? (
          <SettingsSkeleton />
        ) : !isAuthenticated ? (
          <SignedOutState />
        ) : (
          <>
            {activeTab ===
              "account" && (
              <AccountSettings
                displayName={
                  displayName
                }
                email={email}
                role={role}
                workspaceConnected={
                  workspaceConnected
                }
              />
            )}

            {activeTab ===
              "appearance" && (
              <AppearanceSettings
                theme={theme}
                mounted={
                  mounted
                }
                currentThemeLabel={
                  currentThemeLabel
                }
                onThemeChange={
                  setTheme
                }
              />
            )}

            {activeTab ===
              "security" && (
              <SecuritySettings
                email={email}
                workspaceConnected={
                  workspaceConnected
                }
              />
            )}
          </>
        )}
      </div>
    </LoopShell>
  );
}

function AccountSettings({
  displayName,
  email,
  role,
  workspaceConnected,
}: {
  displayName: string;
  email: string;
  role: string;
  workspaceConnected: boolean;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
      <Panel
        title="Account information"
        description="Information provided by your authenticated LOOP session."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <InformationCard
            label="Display name"
            value={
              displayName
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
            label="Account session"
            value="Authenticated"
            icon={
              <CheckIcon />
            }
          />
        </div>

        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              <InfoIcon />
            </span>

            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Read-only account information
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-400">
                LOOP currently reads these values from your authenticated session. Profile editing is not enabled because the frontend does not have a verified account-update API.
              </p>
            </div>
          </div>
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel
          title="Workspace"
          description="Current workspace connection."
        >
          <div
            className={`rounded-xl border p-4 ${
              workspaceConnected
                ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  workspaceConnected
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                    : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                }`}
              >
                <WorkspaceIcon />
              </span>

              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {workspaceConnected
                    ? "Workspace connected"
                    : "Workspace unavailable"}
                </p>

                <p className="mt-1 text-[10px] leading-5 text-slate-500 dark:text-slate-400">
                  {workspaceConnected
                    ? "Your authenticated account is associated with a LOOP workspace."
                    : "No workspace identifier is available in the current session."}
                </p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          title="Account actions"
          description="Available account destinations."
        >
          <div className="space-y-2">
            <SettingsLink
              href="/profile"
              title="Profile"
              description="View authenticated account information."
              icon={
                <UserIcon />
              }
            />

            <SettingsLink
              href="/dashboard"
              title="Dashboard"
              description="Return to workspace overview."
              icon={
                <DashboardIcon />
              }
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function AppearanceSettings({
  theme,
  mounted,
  currentThemeLabel,
  onThemeChange,
}: {
  theme: ThemePreference;
  mounted: boolean;
  currentThemeLabel: string;
  onThemeChange: (
    theme:
      ThemePreference,
  ) => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
      <Panel
        title="Appearance"
        description="Choose how Project LOOP looks on this device."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {themeOptions.map(
            (option) => {
              const active =
                mounted &&
                theme ===
                  option.value;

              return (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  onClick={() =>
                    onThemeChange(
                      option.value,
                    )
                  }
                  aria-pressed={
                    active
                  }
                  className={`rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500 dark:border-blue-500 dark:bg-blue-950/30"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        active
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <ThemeChoiceIcon
                        type={
                          option.icon
                        }
                      />
                    </span>

                    {active && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                        <CheckIcon />
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
                    {
                      option.title
                    }
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                    {
                      option.description
                    }
                  </p>
                </button>
              );
            },
          )}
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
              <AppearanceIcon />
            </span>

            <div>
              <p className="text-[10px] font-medium text-slate-400">
                Current appearance
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">
                {
                  currentThemeLabel
                }
              </p>
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title="Theme preview"
        description="A simple preview of the selected interface style."
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex h-9 items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-3 dark:border-slate-700 dark:bg-slate-800">
            <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />

            <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />

            <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>

          <div className="grid min-h-48 grid-cols-[64px_1fr] bg-white dark:bg-slate-900">
            <div className="bg-[#0b1220] p-2">
              <div className="h-7 rounded-md bg-blue-600" />

              <div className="mt-2 h-7 rounded-md bg-slate-800" />

              <div className="mt-2 h-7 rounded-md bg-slate-800" />
            </div>

            <div className="p-3">
              <div className="h-3 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="h-14 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800" />

                <div className="h-14 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800" />
              </div>

              <div className="mt-2 h-20 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800" />
            </div>
          </div>
        </div>

        <p className="mt-4 text-[10px] leading-5 text-slate-400">
          Appearance changes apply across LOOP immediately.
        </p>
      </Panel>
    </div>
  );
}

function SecuritySettings({
  email,
  workspaceConnected,
}: {
  email: string;
  workspaceConnected: boolean;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
      <Panel
        title="Account security"
        description="Security information available from the current frontend session."
      >
        <div className="space-y-3">
          <SecurityRow
            title="Authentication session"
            description="Your browser currently has an authenticated LOOP session."
            status="Active"
            tone="success"
            icon={
              <SecurityIcon />
            }
          />

          <SecurityRow
            title="Account email"
            description={
              email ||
              "No email address is available in the current session."
            }
            status={
              email
                ? "Available"
                : "Unavailable"
            }
            tone={
              email
                ? "neutral"
                : "warning"
            }
            icon={
              <MailIcon />
            }
          />

          <SecurityRow
            title="Workspace access"
            description={
              workspaceConnected
                ? "Your session is linked to a workspace."
                : "No workspace identifier is available."
            }
            status={
              workspaceConnected
                ? "Connected"
                : "Unavailable"
            }
            tone={
              workspaceConnected
                ? "success"
                : "warning"
            }
            icon={
              <WorkspaceIcon />
            }
          />
        </div>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              <InfoIcon />
            </span>

            <div>
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                Security controls are read-only
              </p>

              <p className="mt-1 text-[11px] leading-5 text-amber-800 dark:text-amber-300">
                Password changes, two-factor authentication, device sessions and login-alert controls are not displayed because verified backend endpoints for those actions are not available to this frontend.
              </p>
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title="Session"
        description="Manage your current signed-in session."
      >
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckIcon />
            </span>

            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Current session
              </p>

              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                Signed in to Project LOOP
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            void signOut({
              callbackUrl: "/",
            });
          }}
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300 dark:hover:bg-rose-950/40"
        >
          <LogoutIcon />

          Sign out
        </button>
      </Panel>
    </div>
  );
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

function TabButton({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-w-fit items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-semibold transition ${
        active
          ? "border-blue-500 text-white"
          : "border-transparent text-slate-500 hover:text-slate-200"
      }`}
    >
      {icon}

      {label}
    </button>
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

function SettingsLink({
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
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-blue-950/40 dark:group-hover:text-blue-300">
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

      <ArrowIcon />
    </Link>
  );
}

function SecurityRow({
  title,
  description,
  status,
  tone,
  icon,
}: {
  title: string;
  description: string;
  status: string;
  tone:
    | "success"
    | "neutral"
    | "warning";
  icon: ReactNode;
}) {
  const statusStyle =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
      : tone ===
          "warning"
        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-900 dark:text-white">
          {title}
        </p>

        <p className="mt-1 break-words text-[10px] leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <span
        className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold ${statusStyle}`}
      >
        {status}
      </span>
    </div>
  );
}

function SignedOutState() {
  return (
    <section className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <SecurityIcon />
      </span>

      <h2 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">
        Account session unavailable
      </h2>

      <p className="mt-2 max-w-md text-xs leading-6 text-slate-500 dark:text-slate-400">
        LOOP could not find an authenticated session for account settings.
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

function SettingsSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="h-[390px] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />

      <div className="space-y-5">
        <div className="h-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />

        <div className="h-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
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
  return (
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
      .join("") || "L"
  );
}

function ThemeChoiceIcon({
  type,
}: {
  type:
    | "light"
    | "dark"
    | "system";
}) {
  if (
    type === "dark"
  ) {
    return (
      <MoonIcon />
    );
  }

  if (
    type === "system"
  ) {
    return (
      <SystemIcon />
    );
  }

  return <SunIcon />;
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

function AppearanceIcon() {
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
        r="4"
      />

      <path
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2"
      />
    </svg>
  );
}

function SecurityIcon() {
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
        d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 12 2 2 4-4"
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
        d="M12 11v5M12 8h.01"
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
      strokeWidth="2"
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

function LogoutIcon() {
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
        d="M10 17l5-5-5-5M15 12H3M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"
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
      className="h-3.5 w-3.5 text-slate-400"
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

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="4"
      />

      <path
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="13"
        rx="2"
      />

      <path
        strokeLinecap="round"
        d="M8 21h8M12 17v4"
      />
    </svg>
  );
}