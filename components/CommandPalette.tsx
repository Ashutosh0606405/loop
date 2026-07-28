"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  useTheme,
  type ThemePreference,
} from "./Providers";

type CommandGroup =
  | "Navigation"
  | "Workspace"
  | "Account"
  | "Appearance";

type CommandItem = {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  group: CommandGroup;
  icon: ReactNode;
  href?: string;
  theme?: ThemePreference;
  shortcut?: string;
};

const commandItems: CommandItem[] = [
  {
    id: "dashboard",
    title: "Open Dashboard",
    description:
      "View feedback metrics and AI insights.",
    keywords: [
      "dashboard",
      "home",
      "metrics",
      "overview",
    ],
    group: "Navigation",
    href: "/dashboard",
    icon: <DashboardIcon />,
    shortcut: "G D",
  },
  {
    id: "feedback",
    title: "Open Feedback",
    description:
      "Review and manage customer feedback.",
    keywords: [
      "feedback",
      "customers",
      "reviews",
      "comments",
    ],
    group: "Navigation",
    href: "/feedback",
    icon: <FeedbackIcon />,
    shortcut: "G F",
  },
  {
    id: "ask-loop",
    title: "Ask LOOP",
    description:
      "Ask questions about customer feedback.",
    keywords: [
      "ask",
      "loop",
      "ai",
      "question",
      "assistant",
    ],
    group: "Navigation",
    href: "/ask-loop",
    icon: <AskIcon />,
    shortcut: "G A",
  },
  {
    id: "reports",
    title: "Open Reports",
    description:
      "Generate and review analytics reports.",
    keywords: [
      "reports",
      "analytics",
      "export",
      "generate",
    ],
    group: "Navigation",
    href: "/reports",
    icon: <ReportsIcon />,
    shortcut: "G R",
  },
  {
    id: "add-feedback",
    title: "Add New Feedback",
    description:
      "Open the feedback workspace.",
    keywords: [
      "add",
      "new",
      "create",
      "feedback",
    ],
    group: "Workspace",
    href: "/feedback",
    icon: <AddIcon />,
  },
  {
    id: "generate-report",
    title: "Generate Customer Report",
    description:
      "Open report generation tools.",
    keywords: [
      "generate",
      "report",
      "download",
      "customer",
    ],
    group: "Workspace",
    href: "/reports",
    icon: <GenerateIcon />,
  },
  {
    id: "profile",
    title: "View Profile",
    description:
      "Open your LOOP contributor profile.",
    keywords: [
      "profile",
      "user",
      "personal",
      "account",
    ],
    group: "Account",
    href: "/profile",
    icon: <UserIcon />,
  },
  {
    id: "settings",
    title: "Account Settings",
    description:
      "Manage account and notification settings.",
    keywords: [
      "settings",
      "account",
      "security",
      "notifications",
    ],
    group: "Account",
    href: "/settings",
    icon: <SettingsIcon />,
    shortcut: "G S",
  },
  {
    id: "light-theme",
    title: "Use Light Mode",
    description:
      "Switch LOOP to the bright appearance.",
    keywords: [
      "light",
      "bright",
      "theme",
      "appearance",
    ],
    group: "Appearance",
    theme: "light",
    icon: <SunIcon />,
  },
  {
    id: "dark-theme",
    title: "Use Dark Mode",
    description:
      "Switch LOOP to the dark appearance.",
    keywords: [
      "dark",
      "night",
      "theme",
      "appearance",
    ],
    group: "Appearance",
    theme: "dark",
    icon: <MoonIcon />,
  },
  {
    id: "system-theme",
    title: "Use System Theme",
    description:
      "Follow your device appearance.",
    keywords: [
      "system",
      "device",
      "automatic",
      "theme",
    ],
    group: "Appearance",
    theme: "system",
    icon: <SystemIcon />,
  },
];

const groupOrder: CommandGroup[] = [
  "Navigation",
  "Workspace",
  "Account",
  "Appearance",
];

export default function CommandPalette() {
  const router = useRouter();
  const { setTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] =
    useState("");
  const [activeIndex, setActiveIndex] =
    useState(0);

  const inputRef =
    useRef<HTMLInputElement | null>(null);

  const filteredCommands = useMemo(() => {
    const normalizedQuery = searchQuery
      .trim()
      .toLowerCase();

    if (!normalizedQuery) {
      return commandItems;
    }

    return commandItems.filter((command) => {
      const searchableText = [
        command.title,
        command.description,
        command.group,
        ...command.keywords,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedQuery,
      );
    });
  }, [searchQuery]);

  const groupedCommands = useMemo(() => {
    return groupOrder
      .map((group) => ({
        group,
        items: filteredCommands.filter(
          (command) =>
            command.group === group,
        ),
      }))
      .filter(
        ({ items }) => items.length > 0,
      );
  }, [filteredCommands]);

  useEffect(() => {
    function handleShortcut(
      event: KeyboardEvent,
    ) {
      const pressedCommandShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k";

      if (pressedCommandShortcut) {
        event.preventDefault();
        event.stopPropagation();

        setIsOpen((previous) => !previous);
      }

      if (
        event.key === "Escape" &&
        isOpen
      ) {
        event.preventDefault();
        setIsOpen(false);
      }
    }

    function handleOpenEvent() {
      setIsOpen(true);
    }

    window.addEventListener(
      "keydown",
      handleShortcut,
      true,
    );

    window.addEventListener(
      "loop-command-palette",
      handleOpenEvent,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleShortcut,
        true,
      );

      window.removeEventListener(
        "loop-command-palette",
        handleOpenEvent,
      );
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setActiveIndex(0);
      return;
    }

    document.body.style.overflow = "hidden";

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

  function runCommand(
    command: CommandItem,
  ) {
    if (command.theme) {
      setTheme(command.theme);
    }

    if (command.href) {
      router.push(command.href);
    }

    setIsOpen(false);
  }

  function handleInputKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (
      event.key === "ArrowDown" &&
      filteredCommands.length > 0
    ) {
      event.preventDefault();

      setActiveIndex((previous) =>
        previous >=
        filteredCommands.length - 1
          ? 0
          : previous + 1,
      );
    }

    if (
      event.key === "ArrowUp" &&
      filteredCommands.length > 0
    ) {
      event.preventDefault();

      setActiveIndex((previous) =>
        previous <= 0
          ? filteredCommands.length - 1
          : previous - 1,
      );
    }

    if (
      event.key === "Enter" &&
      filteredCommands[activeIndex]
    ) {
      event.preventDefault();

      runCommand(
        filteredCommands[activeIndex],
      );
    }
  }

  if (!isOpen) {
    return null;
  }

  let commandPosition = -1;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[10vh] sm:pt-[14vh]">
      <button
        type="button"
        aria-label="Close command palette"
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="LOOP command palette"
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        {/* Search */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 dark:border-slate-700">
          <span className="text-slate-400">
            <SearchIcon />
          </span>

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value,
              )
            }
            onKeyDown={handleInputKeyDown}
            placeholder="Search pages, actions or themes..."
            className="min-w-0 flex-1 bg-transparent py-5 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
          />

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            ESC
          </button>
        </div>

        {/* Command Results */}
        <div className="max-h-[440px] overflow-y-auto p-3">
          {filteredCommands.length > 0 ? (
            groupedCommands.map(
              ({ group, items }) => (
                <div
                  key={group}
                  className="mb-4 last:mb-0"
                >
                  <p className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    {group}
                  </p>

                  <div className="space-y-1">
                    {items.map((command) => {
                      commandPosition += 1;

                      const currentPosition =
                        commandPosition;

                      const isActive =
                        currentPosition ===
                        activeIndex;

                      return (
                        <button
                          key={command.id}
                          type="button"
                          onMouseEnter={() =>
                            setActiveIndex(
                              currentPosition,
                            )
                          }
                          onClick={() =>
                            runCommand(command)
                          }
                          className={`flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition ${
                            isActive
                              ? "bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-950 dark:to-violet-950"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                              isActive
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {command.icon}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-slate-950 dark:text-white">
                              {command.title}
                            </span>

                            <span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">
                              {
                                command.description
                              }
                            </span>
                          </span>

                          {command.shortcut && (
                            <span className="hidden rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-900 sm:block">
                              {command.shortcut}
                            </span>
                          )}

                          <span
                            className={`text-lg ${
                              isActive
                                ? "text-blue-600 dark:text-blue-300"
                                : "text-slate-300 dark:text-slate-600"
                            }`}
                          >
                            →
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ),
            )
          ) : (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <SearchIcon />
              </span>

              <h3 className="mt-4 font-bold text-slate-950 dark:text-white">
                No matching commands
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Try searching for dashboard,
                reports, profile or theme.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-950">
          <p className="text-[10px] font-semibold text-slate-400">
            LOOP Quick Actions
          </p>

          <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400">
            <span>↑ ↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function IconBase({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function SearchIcon() {
  return (
    <IconBase>
      <circle cx="11" cy="11" r="7" />
      <path
        strokeLinecap="round"
        d="m16 16 4 4"
      />
    </IconBase>
  );
}

function DashboardIcon() {
  return (
    <IconBase>
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
    </IconBase>
  );
}

function FeedbackIcon() {
  return (
    <IconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 18.5 3.5 21v-5.2A8.5 8.5 0 1 1 7 18.5Z"
      />
      <path
        strokeLinecap="round"
        d="M8 9h8M8 13h5"
      />
    </IconBase>
  );
}

function AskIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="9" />
      <path
        strokeLinecap="round"
        d="M9.5 9a2.7 2.7 0 1 1 4.4 2.1c-1 .8-1.9 1.2-1.9 2.4M12 17h.01"
      />
    </IconBase>
  );
}

function ReportsIcon() {
  return (
    <IconBase>
      <path
        strokeLinecap="round"
        d="M4 20V10M10 20V4M16 20v-7M22 20H2"
      />
    </IconBase>
  );
}

function AddIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="9" />
      <path
        strokeLinecap="round"
        d="M12 8v8M8 12h8"
      />
    </IconBase>
  );
}

function GenerateIcon() {
  return (
    <IconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3h10l4 4v14H5V3Z"
      />
      <path
        strokeLinecap="round"
        d="M9 14h6M12 11v6"
      />
    </IconBase>
  );
}

function UserIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="8" r="4" />
      <path
        strokeLinecap="round"
        d="M4.5 21a7.5 7.5 0 0 1 15 0"
      />
    </IconBase>
  );
}

function SettingsIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"
      />
    </IconBase>
  );
}

function SunIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
      />
    </IconBase>
  );
}

function MoonIcon() {
  return (
    <IconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 15.5A9 9 0 0 1 8.5 3a9.5 9.5 0 1 0 12.5 12.5Z"
      />
    </IconBase>
  );
}

function SystemIcon() {
  return (
    <IconBase>
      <rect
        x="3"
        y="4"
        width="18"
        height="14"
        rx="2"
      />
      <path
        strokeLinecap="round"
        d="M8 22h8M12 18v4"
      />
    </IconBase>
  );
}