"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import type { ReactNode } from "react";

type LoopShellProps = {
  title: string;
  subtitle: string;
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
  {
    name: "Team Members",
    href: "/members",
    icon: "👥",
  },
];

export default function LoopShell({
  title,
  subtitle,
  children,
}: LoopShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName =
    session?.user?.name ||
    session?.user?.email ||
    "User";
  const userRole = (session?.user as any)?.role || "ADMIN";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .substring(0, 2)
    .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden w-72 flex-col bg-slate-950 p-6 text-white lg:flex">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-lg font-bold">
              L
            </div>

            <div>
              <h1 className="text-xl font-bold">LOOP</h1>
              <p className="text-xs text-slate-400">Feedback Intelligence</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-10">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Workspace
            </p>

            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      isActive
                        ? "flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30"
                        : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    }
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* AI Status */}
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">AI Processing</span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              LOOP is analysing customer feedback and identifying useful patterns.
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
            </div>

            <p className="mt-2 text-right text-xs text-slate-500">85% processed</p>
          </div>

          {/* User Profile */}
          <div className="mt-auto border-t border-slate-800 pt-5">
            <div className="flex items-center gap-3 rounded-xl p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white">
                {userInitials}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{userName}</p>
                <p className="truncate text-xs text-slate-400">{userRole}</p>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-3 w-full rounded-xl border border-slate-800 px-4 py-2.5 text-center text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              Logout Session
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          {/* Top Header */}
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                  Project LOOP
                </p>

                <h2 className="mt-1 text-xl font-bold md:text-2xl">{title}</h2>

                <p className="mt-1 hidden text-sm text-slate-500 sm:block">
                  {subtitle}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-block">
                  ● Workspace Active
                </span>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                  {userInitials}
                </div>
              </div>
            </div>
          </header>

          {/* Mobile Navigation */}
          <nav className="flex gap-3 overflow-x-auto border-b border-slate-200 bg-white px-5 py-4 lg:hidden">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    isActive
                      ? "whitespace-nowrap rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
                      : "whitespace-nowrap rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700"
                  }
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Page Content */}
          <div className="mx-auto max-w-[1600px] p-5 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}