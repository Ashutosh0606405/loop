"use client";

import Link from "next/link";

import {
  signOut,
  useSession,
} from "next-auth/react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type SessionUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  workspaceId?: string | null;
};

export default function ProfileMenu() {
  const { data: session } =
    useSession();

  const menuRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const user =
    session?.user as
      | SessionUser
      | undefined;

  const email =
    user?.email?.trim() ?? "";

  const sessionName =
    user?.name?.trim() ?? "";

  const displayName =
    sessionName ||
    email ||
    "LOOP User";

  const role =
    user?.role?.trim() ||
    "Member";

  const formattedRole =
    role
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase(),
      );

  const initials =
    useMemo(() => {
      const source =
        displayName || "L";

      return (
        source
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
    }, [displayName]);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
      ) {
        setIsOpen(false);
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

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      <button
        type="button"
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen(
            (previous) =>
              !previous,
          )
        }
        className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-bold text-white dark:bg-blue-600">
          {initials}
        </span>

        <span className="hidden min-w-0 text-left lg:block">
          <span className="block max-w-36 truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
            {displayName}
          </span>

          <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-wide text-slate-400">
            {formattedRole}
          </span>
        </span>

        <ChevronIcon
          open={isOpen}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-[120] w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white dark:bg-blue-600">
                {initials}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                  {displayName}
                </p>

                {email && (
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {email}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3">
              <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {formattedRole}
              </span>
            </div>
          </div>

          <div className="p-2">
            <MenuLink
              href="/profile"
              onClick={() =>
                setIsOpen(false)
              }
              icon={
                <UserIcon />
              }
            >
              Profile
            </MenuLink>

            <MenuLink
              href="/settings"
              onClick={() =>
                setIsOpen(false)
              }
              icon={
                <SettingsIcon />
              }
            >
              Settings
            </MenuLink>

            <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);

                void signOut({
                  callbackUrl: "/",
                });
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
            >
              <LogoutIcon />

              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: ReactNode;
  children: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <span className="text-slate-400">
        {icon}
      </span>

      {children}
    </Link>
  );
}

function ChevronIcon({
  open,
}: {
  open: boolean;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-3.5 w-3.5 text-slate-400 transition ${
        open
          ? "rotate-180"
          : ""
      }`}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m6 8 4 4 4-4"
      />
    </svg>
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