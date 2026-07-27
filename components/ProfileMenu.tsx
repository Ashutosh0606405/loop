"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileMenu() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  function handleLogout() {
    setIsOpen(false);

    // Frontend navigation only
    router.push("/login");
  }

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      {/* Profile Button */}
      <button
        type="button"
        onClick={() =>
          setIsOpen((previous) => !previous)
        }
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md"
      >
        {/* Avatar */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md shadow-blue-200">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="8"
              r="4"
            />

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 21a7.5 7.5 0 0 1 15 0"
            />
          </svg>
        </div>

        {/* User Details */}
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-bold text-slate-950">
            Lakshmipriya D
          </p>

          <p className="truncate text-sm text-slate-500">
            Analyst
          </p>
        </div>

        {/* Arrow */}
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/50">
          {/* User Header */}
          <div className="flex items-center gap-4 border-b border-slate-100 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md shadow-blue-200">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 21a7.5 7.5 0 0 1 15 0"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-bold text-slate-950">
                Lakshmipriya D
              </p>

              <p className="truncate text-sm text-slate-500">
                Analyst · Project LOOP
              </p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
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
                    cy="8"
                    r="4"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 21a7.5 7.5 0 0 1 15 0"
                  />
                </svg>
              </span>

              My Profile
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
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
                    r="3"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20.5h-3v-.28a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 5 15.74a1.7 1.7 0 0 0-1.56-1.03H3.2v-3h.24A1.7 1.7 0 0 0 5 10.68a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.12-2.12.06.06A1.7 1.7 0 0 0 8.66 7a1.7 1.7 0 0 0 1.03-1.56V5.2h3v.24A1.7 1.7 0 0 0 13.72 7a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.26v3h-.26A1.7 1.7 0 0 0 19.4 15Z"
                  />
                </svg>
              </span>

              Account Settings
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
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
                    d="M10 17l5-5-5-5"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12H3"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"
                  />
                </svg>
              </span>

              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}