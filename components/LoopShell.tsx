"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

type LoopShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "⌂",
  },
  {
    name: "Feedback",
    href: "/feedback",
    icon: "▤",
  },
  {
    name: "Ask LOOP",
    href: "/ask-loop",
    icon: "✦",
  },
  {
    name: "Reports",
    href: "/reports",
    icon: "▥",
  },
];

function ProfileAvatar({
  className = "h-10 w-10",
}: {
  className?: string;
}) {
  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-sm`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-1/2 w-1/2"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
        />
      </svg>
    </div>
  );
}

export default function LoopShell({
  title,
  subtitle,
  children,
}: LoopShellProps) {
  const pathname = usePathname();

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  function handleLogout() {
    setShowProfileMenu(false);

    window.alert(
      "Logout will be connected after authentication is ready.",
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-slate-950 text-white lg:flex">
        {/* Logo */}
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold">
              L
            </div>

            <div>
              <h1 className="text-lg font-bold">
                LOOP
              </h1>

              <p className="text-xs text-slate-400">
                Feedback Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Workspace
          </p>

          <div className="mt-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive =
                pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setShowProfileMenu(false)
                  }
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs">
                    {item.icon}
                  </span>

                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* AI Status */}
        <div className="mx-4 rounded-2xl border border-white/10 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">
              AI Analysis
            </p>

            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            LOOP AI is actively analysing customer
            feedback.
          </p>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-3/4 rounded-full bg-blue-500" />
          </div>

          <p className="mt-2 text-right text-[10px] text-slate-500">
            75% processed
          </p>
        </div>

        {/* Sidebar Profile */}
        <div className="mt-4 border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <ProfileAvatar className="h-10 w-10" />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                Lakshmipriya D
              </p>

              <p className="text-xs text-slate-400">
                Analyst
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-[82px] items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
            {/* Page Heading */}
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                Project LOOP
              </p>

              <h1 className="mt-1 truncate text-lg font-bold sm:text-2xl">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-1 hidden text-sm text-slate-500 sm:block">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Header Right Section */}
            <div className="relative flex shrink-0 items-center gap-3">
              {/* Search */}
              <div className="hidden items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 xl:flex">
                <span className="mr-2 text-xs text-slate-400">
                  Search
                </span>

                <input
                  type="text"
                  placeholder="Search insights..."
                  className="w-36 bg-transparent text-sm outline-none"
                />
              </div>

              {/* Notification */}
              <button
                type="button"
                aria-label="Notifications"
                className="hidden h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg transition hover:bg-slate-50 md:flex"
              >
                ♢
              </button>

              {/* Profile Button */}
              <button
                type="button"
                onClick={() =>
                  setShowProfileMenu(
                    (previous) => !previous,
                  )
                }
                aria-expanded={showProfileMenu}
                aria-label="Open profile menu"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 transition hover:bg-slate-50 sm:gap-3 sm:pr-3"
              >
                <ProfileAvatar className="h-9 w-9" />

                <span className="hidden text-left md:block">
                  <span className="block text-sm font-semibold text-slate-800">
                    Lakshmipriya D
                  </span>

                  <span className="block text-xs text-slate-400">
                    Analyst
                  </span>
                </span>

                <span className="hidden text-xs text-slate-400 sm:block">
                  {showProfileMenu ? "▲" : "▼"}
                </span>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 top-14 z-50 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-100 p-4">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar className="h-11 w-11" />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          Lakshmipriya D
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Analyst · Project LOOP
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() =>
                        window.alert(
                          "Profile page will be added later.",
                        )
                      }
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                        ◉
                      </span>

                      My Profile
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        window.alert(
                          "Account settings will be added later.",
                        )
                      }
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                        ⚙
                      </span>

                      Account Settings
                    </button>
                  </div>

                  <div className="border-t border-slate-100 p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
                        ↪
                      </span>

                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="border-t border-slate-100 px-4 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setShowProfileMenu(false)
                    }
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                      isActive
                        ? "bg-slate-950 text-white"
                        : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}