"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import ProfileMenu from "./ProfileMenu";

type LoopShellProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  subtitle?: string;
};

type IconName =
  | "dashboard"
  | "feedback"
  | "ask"
  | "reports";

type NavigationItem = {
  name: string;
  href: string;
  icon: IconName;
};

const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
  },
  {
    name: "Feedback",
    href: "/feedback",
    icon: "feedback",
  },
  {
    name: "Ask LOOP",
    href: "/ask-loop",
    icon: "ask",
  },
  {
    name: "Reports",
    href: "/reports",
    icon: "reports",
  },
];

function NavigationIcon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  if (name === "dashboard") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
      >
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="2"
        />

        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="2"
        />

        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="2"
        />

        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="2"
        />
      </svg>
    );
  }

  if (name === "feedback") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 18.5 3.5 21v-5.2A8.5 8.5 0 1 1 7 18.5Z"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 9h8M8 13h5"
        />
      </svg>
    );
  }

  if (name === "ask") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3a8.5 8.5 0 0 0-5.2 15.2L5.5 21l3.4-1.3A8.5 8.5 0 1 0 12 3Z"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.5 9.2a2.7 2.7 0 1 1 4.3 2.2c-1 .7-1.8 1.1-1.8 2.1"
        />

        <circle
          cx="12"
          cy="16.8"
          r=".8"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 20V10M10 20V4M16 20v-7M22 20H2"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4 7 6-4 6 5 5-4"
      />
    </svg>
  );
}

function SidebarContent({
  pathname,
  closeSidebar,
}: {
  pathname: string;
  closeSidebar?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="border-b border-white/10 px-6 py-6">
        <Link
          href="/dashboard"
          onClick={closeSidebar}
          className="flex items-center gap-3"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-lg font-black text-white shadow-lg shadow-blue-950/40">
            L
          </span>

          <span>
            <span className="block text-xl font-bold text-white">
              LOOP
            </span>

            <span className="block text-sm text-slate-400">
              Feedback Intelligence
            </span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="px-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>

        <div className="mt-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-950/30"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                  }`}
                >
                  <NavigationIcon name={item.icon} />
                </span>

                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* AI Status */}
      <div className="p-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">
              AI Analysis
            </p>

            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            LOOP AI is actively analysing customer
            feedback.
          </p>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
          </div>

          <p className="mt-2 text-right text-[10px] font-semibold text-slate-500">
            75% processed
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-600">
          © 2026 Project LOOP
        </p>
      </div>
    </>
  );
}

export default function LoopShell({
  children,
  title = "Dashboard",
  description,
  subtitle,
}: LoopShellProps) {
  const pathname = usePathname();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState(false);

  const pageDescription =
    description ??
    subtitle ??
    "Monitor customer feedback and insights.";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col overflow-hidden bg-slate-950 lg:flex">
        <div className="absolute -left-20 top-28 h-56 w-56 rounded-full bg-blue-600/15 blur-3xl" />

        <div className="absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />

        <div className="relative z-10 flex min-h-screen flex-col">
          <SidebarContent pathname={pathname} />
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() =>
            setIsMobileSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-hidden bg-slate-950 transition-transform duration-300 lg:hidden ${
          isMobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="absolute -left-20 top-28 h-56 w-56 rounded-full bg-blue-600/15 blur-3xl" />

        <div className="absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />

        <div className="relative z-10 flex min-h-screen flex-col">
          <button
            type="button"
            onClick={() =>
              setIsMobileSidebarOpen(false)
            }
            aria-label="Close sidebar"
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6 6 18"
              />
            </svg>
          </button>

          <SidebarContent
            pathname={pathname}
            closeSidebar={() =>
              setIsMobileSidebarOpen(false)
            }
          />
        </div>
      </aside>

      {/* Main Area */}
      <div className="min-h-screen lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="flex min-h-[84px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            {/* Header Left */}
            <div className="flex min-w-0 items-center gap-4">
              {/* Mobile Menu */}
              <button
                type="button"
                onClick={() =>
                  setIsMobileSidebarOpen(true)
                }
                aria-label="Open navigation menu"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 lg:hidden"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 7h16M4 12h16M4 17h16"
                  />
                </svg>
              </button>

              {/* Page Heading */}
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                  Project LOOP
                </p>

                <h1 className="mt-1 truncate text-xl font-bold text-slate-950 sm:text-2xl">
                  {title}
                </h1>

                <p className="mt-1 hidden truncate text-sm text-slate-500 sm:block">
                  {pageDescription}
                </p>
              </div>
            </div>

            {/* Header Right */}
            <div className="flex shrink-0 items-center gap-3">
              {/* Search */}
              <div className="hidden items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 xl:flex">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="mr-2 h-4 w-4 text-slate-400"
                  aria-hidden="true"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />

                  <path
                    strokeLinecap="round"
                    d="m16 16 4 4"
                  />
                </svg>

                <input
                  type="text"
                  placeholder="Search insights..."
                  className="w-36 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Notification */}
              <button
                type="button"
                aria-label="Notifications"
                className="relative hidden h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:flex"
              >
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
                    d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 21h4"
                  />
                </svg>

                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              {/* Profile Dropdown */}
              <ProfileMenu />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}