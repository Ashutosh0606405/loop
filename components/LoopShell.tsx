"use client";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  useTheme,
  type ThemePreference,
} from "./Providers";

import CommandPalette from "./CommandPalette";
import NotificationCenter from "./NotificationCenter";
import ProductTour from "./ProductTour";
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

const navigationItems:
  NavigationItem[] = [
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

const themeOptions: {
  value: ThemePreference;
  label: string;
}[] = [
  {
    value: "light",
    label: "Light",
  },
  {
    value: "dark",
    label: "Dark",
  },
  {
    value: "system",
    label: "System",
  },
];

export default function LoopShell({
  children,
  title = "Dashboard",
  description,
  subtitle,
}: LoopShellProps) {
  const pathname =
    usePathname();

  const {
    theme,
    resolvedTheme,
    mounted,
    setTheme,
  } = useTheme();

  const [
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  ] = useState(false);

  const [
    isThemeMenuOpen,
    setIsThemeMenuOpen,
  ] = useState(false);

  const themeMenuRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const pageDescription =
    description ??
    subtitle ??
    "Customer feedback intelligence workspace.";

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        themeMenuRef.current &&
        !themeMenuRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsThemeMenuOpen(false);
      }
    }

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
      ) {
        setIsThemeMenuOpen(false);
        setIsMobileSidebarOpen(
          false,
        );
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  useEffect(() => {
    if (
      !isMobileSidebarOpen
    ) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    isMobileSidebarOpen,
  ]);

  function selectTheme(
    selectedTheme:
      ThemePreference,
  ) {
    setTheme(
      selectedTheme,
    );

    setIsThemeMenuOpen(
      false,
    );
  }

  function openCommandPalette() {
    setIsThemeMenuOpen(
      false,
    );

    window.dispatchEvent(
      new Event(
        "loop-command-palette",
      ),
    );
  }

  function openProductTour() {
    setIsThemeMenuOpen(
      false,
    );

    window.dispatchEvent(
      new Event(
        "loop-product-tour",
      ),
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <CommandPalette />

      <ProductTour />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-slate-800 bg-[#0b1220] lg:block">
        <SidebarContent
          pathname={pathname}
        />
      </aside>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-[150] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() =>
              setIsMobileSidebarOpen(
                false,
              )
            }
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <aside className="relative h-full w-[280px] border-r border-slate-800 bg-[#0b1220] shadow-2xl">
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() =>
                setIsMobileSidebarOpen(
                  false,
                )
              }
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 transition hover:bg-slate-800"
            >
              <CloseIcon />
            </button>

            <SidebarContent
              pathname={pathname}
              onNavigate={() =>
                setIsMobileSidebarOpen(
                  false,
                )
              }
            />
          </aside>
        </div>
      )}

      <div className="min-h-screen lg:pl-[264px]">
        <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
          <div className="flex min-h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() =>
                setIsMobileSidebarOpen(
                  true,
                )
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 lg:hidden"
            >
              <MenuIcon />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400 sm:inline">
                  Project LOOP
                </span>

                <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline dark:bg-slate-600" />

                <span className="hidden text-[10px] font-medium text-slate-400 sm:inline">
                  Workspace
                </span>
              </div>

              <h1 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-slate-950 dark:text-white sm:text-xl">
                {title}
              </h1>

              <p className="mt-0.5 hidden max-w-2xl truncate text-xs text-slate-500 dark:text-slate-400 md:block">
                {pageDescription}
              </p>
            </div>

            <button
              type="button"
              onClick={
                openCommandPalette
              }
              aria-label="Open search"
              className="hidden h-10 min-w-[205px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-xs text-slate-400 transition hover:border-slate-300 hover:bg-white xl:flex dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <SearchIcon />

              <span className="flex-1">
                Search workspace
              </span>

              <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                Ctrl K
              </kbd>
            </button>

            <button
              type="button"
              onClick={
                openCommandPalette
              }
              aria-label="Search workspace"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 xl:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <SearchIcon />
            </button>

            <button
              type="button"
              onClick={
                openProductTour
              }
              aria-label="Open product guide"
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 sm:flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <HelpIcon />
            </button>

            <div
              ref={themeMenuRef}
              className="relative"
            >
              <button
                type="button"
                aria-label="Change appearance"
                aria-expanded={
                  isThemeMenuOpen
                }
                onClick={() =>
                  setIsThemeMenuOpen(
                    (
                      previous,
                    ) =>
                      !previous,
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <ThemeIcon
                  theme={
                    mounted
                      ? resolvedTheme
                      : "light"
                  }
                />
              </button>

              {isThemeMenuOpen && (
                <div className="absolute right-0 top-12 z-[120] w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/10 dark:border-slate-700 dark:bg-slate-900">
                  <div className="px-3 pb-2 pt-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Appearance
                    </p>
                  </div>

                  {themeOptions.map(
                    (
                      option,
                    ) => {
                      const selected =
                        theme ===
                        option.value;

                      return (
                        <button
                          key={
                            option.value
                          }
                          type="button"
                          onClick={() =>
                            selectTheme(
                              option.value,
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                            selected
                              ? "bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                              : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span>
                            {
                              option.label
                            }
                          </span>

                          {selected && (
                            <CheckIcon />
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            </div>

            <NotificationCenter />

            <ProfileMenu />
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-800 px-5 py-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-950/30">
            L
          </span>

          <span className="min-w-0">
            <span className="block truncate text-[15px] font-semibold tracking-tight text-white">
              Project LOOP
            </span>

            <span className="mt-0.5 block truncate text-[9px] font-medium uppercase tracking-[0.15em] text-slate-500">
              Feedback Intelligence
            </span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
          Workspace
        </p>

        <div className="space-y-1">
          {navigationItems.map(
            (item) => {
              const active =
                pathname ===
                  item.href ||
                pathname.startsWith(
                  `${item.href}/`,
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={
                    onNavigate
                  }
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"
                      : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      active
                        ? "bg-white/10"
                        : "bg-slate-900"
                    }`}
                  >
                    <NavigationIcon
                      name={
                        item.icon
                      }
                    />
                  </span>

                  {
                    item.name
                  }
                </Link>
              );
            },
          )}
        </div>
      </nav>

      <div className="border-t border-slate-800 p-3">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            pathname ===
            "/settings"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
            <SettingsIcon />
          </span>

          Settings
        </Link>

        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            <p className="text-[10px] font-semibold text-slate-300">
              Workspace connected
            </p>
          </div>

          <p className="mt-2 text-[10px] leading-5 text-slate-600">
            Data shown in LOOP is scoped to the authenticated workspace.
          </p>
        </div>

        <p className="mt-3 text-center text-[9px] text-slate-700">
          © 2026 Project LOOP
        </p>
      </div>
    </div>
  );
}

function NavigationIcon({
  name,
}: {
  name: IconName;
}) {
  if (
    name ===
    "dashboard"
  ) {
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

  if (
    name ===
    "feedback"
  ) {
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

  if (
    name === "ask"
  ) {
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
          d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
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

function ThemeIcon({
  theme,
}: {
  theme:
    | "light"
    | "dark";
}) {
  if (
    theme === "dark"
  ) {
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
          d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"
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

function SearchIcon() {
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
        cx="11"
        cy="11"
        r="6"
      />

      <path
        strokeLinecap="round"
        d="m20 20-4-4"
      />
    </svg>
  );
}

function HelpIcon() {
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
        d="M9.8 9a2.4 2.4 0 1 1 3.5 2.2c-.8.5-1.3 1-1.3 1.8M12 17h.01"
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

function MenuIcon() {
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
        d="M4 7h16M4 12h16M4 17h16"
      />
    </svg>
  );
}

function CloseIcon() {
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
        d="m6 6 12 12M18 6 6 18"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 10 3 3 7-7"
      />
    </svg>
  );
}