"use client";

import Link from "next/link";

import {
  useEffect,
  useRef,
  useState,
} from "react";

export default function NotificationCenter() {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const ref =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        ref.current &&
        !ref.current.contains(
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
      ref={ref}
      className="relative"
    >
      <button
        type="button"
        aria-label="Open notifications"
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen(
            (previous) =>
              !previous,
          )
        }
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <BellIcon />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-[120] w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10 dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
              Notifications
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Workspace activity
            </p>
          </div>

          <div className="px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <BellIcon />
            </div>

            <h4 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
              You&apos;re all caught up
            </h4>

            <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">
              There are no current workspace notifications to display.
            </p>
          </div>

          <div className="grid grid-cols-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/feedback"
              onClick={() =>
                setIsOpen(false)
              }
              className="border-r border-slate-100 px-4 py-3 text-center text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Feedback
            </Link>

            <Link
              href="/reports"
              onClick={() =>
                setIsOpen(false)
              }
              className="px-4 py-3 text-center text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Reports
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function BellIcon() {
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
        d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7ZM10 20h4"
      />
    </svg>
  );
}