"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type NotificationType =
  | "feedback"
  | "report"
  | "urgent"
  | "system";

type NotificationItem = {
  id: number;
  title: string;
  description: string;
  time: string;
  type: NotificationType;
  href: string;
  isRead: boolean;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "New negative feedback",
    description:
      "A customer reported a payment confirmation delay.",
    time: "5 min ago",
    type: "urgent",
    href: "/feedback",
    isRead: false,
  },
  {
    id: 2,
    title: "Report generated",
    description:
      "Your monthly customer experience report is ready.",
    time: "25 min ago",
    type: "report",
    href: "/reports",
    isRead: false,
  },
  {
    id: 3,
    title: "12 feedback records classified",
    description:
      "LOOP AI completed sentiment and theme analysis.",
    time: "1 hour ago",
    type: "feedback",
    href: "/feedback",
    isRead: false,
  },
  {
    id: 4,
    title: "Workspace updated",
    description:
      "Your notification preferences were updated.",
    time: "Yesterday",
    type: "system",
    href: "/settings",
    isRead: true,
  },
];

export default function NotificationCenter() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(
      initialNotifications,
    );

  const [isOpen, setIsOpen] = useState(false);

  const notificationRef =
    useRef<HTMLDivElement | null>(null);

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) => !notification.isRead,
    ).length;
  }, [notifications]);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  function markAsRead(id: number) {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              isRead: true,
            }
          : notification,
      ),
    );
  }

  function markAllAsRead() {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );
  }

  function clearNotifications() {
    setNotifications([]);
  }

  return (
    <div
      ref={notificationRef}
      className="relative"
    >
      {/* Bell Button */}
      <button
        type="button"
        aria-label="Open notifications"
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen((previous) => !previous)
        }
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <BellIcon />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-14 z-[100] w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:w-[390px]">
          {/* Header */}
          <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-violet-50 p-5 dark:border-slate-700 dark:from-blue-950 dark:to-violet-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-950 dark:text-white">
                    Notifications
                  </h2>

                  {unreadCount > 0 && (
                    <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Latest workspace activity and
                  updates.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
              >
                ×
              </button>
            </div>

            {notifications.length > 0 && (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-blue-700 shadow-sm transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800 dark:text-blue-300"
                >
                  Mark all as read
                </button>

                <button
                  type="button"
                  onClick={clearNotifications}
                  className="rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-rose-700 shadow-sm transition hover:bg-rose-100 dark:bg-slate-800 dark:text-rose-300"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Notification List */}
          {notifications.length > 0 ? (
            <div className="max-h-[430px] overflow-y-auto">
              {notifications.map(
                (notification) => (
                  <Link
                    key={notification.id}
                    href={notification.href}
                    onClick={() => {
                      markAsRead(
                        notification.id,
                      );
                      setIsOpen(false);
                    }}
                    className={`group flex gap-4 border-b border-slate-100 p-4 transition last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${
                      notification.isRead
                        ? "bg-white dark:bg-slate-900"
                        : "bg-blue-50/60 dark:bg-blue-950/30"
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${getNotificationStyle(
                        notification.type,
                      )}`}
                    >
                      <NotificationTypeIcon
                        type={notification.type}
                      />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {notification.title}
                        </p>

                        {!notification.isRead && (
                          <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                        )}
                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {
                          notification.description
                        }
                      </p>

                      <p className="mt-2 text-[10px] font-semibold text-slate-400">
                        {notification.time}
                      </p>
                    </div>
                  </Link>
                ),
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <BellIcon />
              </span>

              <h3 className="mt-4 font-bold text-slate-950 dark:text-white">
                No notifications
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                New workspace updates will appear
                here.
              </p>
            </div>
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="block border-t border-slate-200 px-5 py-4 text-center text-xs font-bold text-blue-700 transition hover:bg-blue-50 dark:border-slate-700 dark:text-blue-300 dark:hover:bg-slate-800"
            >
              Manage notification preferences
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function getNotificationStyle(
  type: NotificationType,
) {
  if (type === "urgent") {
    return "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300";
  }

  if (type === "report") {
    return "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300";
  }

  if (type === "feedback") {
    return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
  }

  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

function NotificationTypeIcon({
  type,
}: {
  type: NotificationType;
}) {
  if (type === "urgent") {
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
          d="M12 3 3 20h18L12 3Z"
        />

        <path
          strokeLinecap="round"
          d="M12 9v4M12 16h.01"
        />
      </svg>
    );
  }

  if (type === "report") {
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
          d="M6 3h9l4 4v14H6V3Z"
        />

        <path
          strokeLinecap="round"
          d="M9 17v-4M13 17V9M17 17v-6"
        />
      </svg>
    );
  }

  if (type === "feedback") {
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
          d="M5 19.5 3.5 21v-5A8.5 8.5 0 1 1 7 19"
        />

        <path
          strokeLinecap="round"
          d="M8 10h8M8 14h5"
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
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />

      <path
        strokeLinecap="round"
        d="M12 11v5M12 8h.01"
      />
    </svg>
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
        d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"
      />

      <path
        strokeLinecap="round"
        d="M10 21h4"
      />
    </svg>
  );
}