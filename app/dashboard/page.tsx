"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import LoopShell from "../../components/LoopShell";

type RangeKey = "7D" | "30D" | "90D";

type Sentiment =
  | "POSITIVE"
  | "NEGATIVE"
  | "NEUTRAL";

type FeedbackStatus =
  | "NEW"
  | "REVIEWED"
  | "ACTIONED";

type ThemeRelation = {
  theme?: {
    id?: string;
    name?: string;
  } | null;
};

type FeedbackItem = {
  id: string;
  content: string;
  customerName?: string | null;
  channel?: string | null;
  sentiment?: Sentiment | null;
  status?: FeedbackStatus | null;
  createdAt: string;
  themes?: ThemeRelation[];
};

type FeedbackResponse = {
  data: FeedbackItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type ActivityItem = {
  label: string;
  count: number;
};

const ranges: {
  key: RangeKey;
  days: number;
}[] = [
  {
    key: "7D",
    days: 7,
  },
  {
    key: "30D",
    days: 30,
  },
  {
    key: "90D",
    days: 90,
  },
];

function startOfDay(value: Date) {
  const date = new Date(value);

  date.setHours(0, 0, 0, 0);

  return date;
}

function endOfDay(value: Date) {
  const date = new Date(value);

  date.setHours(
    23,
    59,
    59,
    999,
  );

  return date;
}

function getRangeDays(
  range: RangeKey,
) {
  return (
    ranges.find(
      (item) =>
        item.key === range,
    )?.days ?? 7
  );
}

function getRangeDates(
  days: number,
) {
  const end =
    endOfDay(new Date());

  const start =
    startOfDay(new Date());

  start.setDate(
    start.getDate() -
      (days - 1),
  );

  return {
    start,
    end,
  };
}

function filterByRange(
  items: FeedbackItem[],
  start: Date,
  end: Date,
) {
  return items.filter(
    (item) => {
      const date =
        new Date(
          item.createdAt,
        );

      if (
        Number.isNaN(
          date.getTime(),
        )
      ) {
        return false;
      }

      return (
        date >= start &&
        date <= end
      );
    },
  );
}

function isClassified(
  item: FeedbackItem,
): item is FeedbackItem & {
  sentiment: Sentiment;
} {
  return (
    item.sentiment === "POSITIVE" ||
    item.sentiment === "NEUTRAL" ||
    item.sentiment === "NEGATIVE"
  );
}

function percentage(
  value: number,
  total: number,
) {
  if (total <= 0) {
    return 0;
  }

  return Math.round(
    (value / total) * 100,
  );
}

function formatDate(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function formatShortDate(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
    },
  ).format(date);
}

function getInitials(
  name?: string | null,
) {
  const value =
    name?.trim() ||
    "Anonymous Customer";

  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part
          .charAt(0)
          .toUpperCase(),
      )
      .join("") || "AC"
  );
}

async function fetchAllFeedback(
  signal: AbortSignal,
) {
  const results:
    FeedbackItem[] = [];

  let page = 1;
  let totalPages = 1;

  do {
    const response =
      await fetch(
        `/api/feedback?page=${page}&limit=100`,
        {
          cache: "no-store",
          signal,
        },
      );

    if (!response.ok) {
      const body =
        await response
          .json()
          .catch(
            () => null,
          );

      const message =
        body &&
        typeof body ===
          "object" &&
        "error" in body &&
        typeof body.error ===
          "string"
          ? body.error
          : "Unable to load dashboard data.";

      throw new Error(
        message,
      );
    }

    const payload =
      (await response.json()) as
        FeedbackResponse;

    if (
      !Array.isArray(
        payload.data,
      )
    ) {
      throw new Error(
        "Unexpected feedback response.",
      );
    }

    results.push(
      ...payload.data,
    );

    totalPages =
      Math.max(
        1,
        payload.meta
          ?.totalPages ?? 1,
      );

    page += 1;
  } while (
    page <= totalPages
  );

  return results;
}

function createActivity(
  feedback: FeedbackItem[],
  days: number,
) {
  const end =
    endOfDay(new Date());

  if (days === 7) {
    return Array.from(
      {
        length: 7,
      },
      (_, index) => {
        const day =
          startOfDay(end);

        day.setDate(
          day.getDate() -
            (6 - index),
        );

        return {
          label:
            new Intl.DateTimeFormat(
              "en-IN",
              {
                weekday:
                  "short",
              },
            ).format(day),

          count:
            filterByRange(
              feedback,
              day,
              endOfDay(day),
            ).length,
        };
      },
    );
  }

  const bucketCount = 6;

  const bucketSize =
    Math.ceil(
      days /
        bucketCount,
    );

  const requestedStart =
    startOfDay(end);

  requestedStart.setDate(
    requestedStart.getDate() -
      (days - 1),
  );

  return Array.from(
    {
      length:
        bucketCount,
    },
    (_, index) => {
      const bucketEnd =
        endOfDay(end);

      bucketEnd.setDate(
        bucketEnd.getDate() -
          (bucketCount -
            index -
            1) *
            bucketSize,
      );

      const bucketStart =
        startOfDay(
          bucketEnd,
        );

      bucketStart.setDate(
        bucketStart.getDate() -
          (bucketSize - 1),
      );

      if (
        bucketStart <
        requestedStart
      ) {
        bucketStart.setTime(
          requestedStart.getTime(),
        );
      }

      return {
        label:
          formatShortDate(
            bucketStart,
          ),

        count:
          filterByRange(
            feedback,
            bucketStart,
            bucketEnd,
          ).length,
      };
    },
  );
}

export default function DashboardPage() {
  const [
    selectedRange,
    setSelectedRange,
  ] =
    useState<RangeKey>(
      "7D",
    );

  const [
    feedback,
    setFeedback,
  ] =
    useState<
      FeedbackItem[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    refreshKey,
    setRefreshKey,
  ] =
    useState(0);

  useEffect(() => {
    const controller =
      new AbortController();

    fetchAllFeedback(
      controller.signal,
    )
      .then(
        (items) => {
          setFeedback(
            items,
          );

          setError("");
        },
      )
      .catch(
        (
          requestError:
            unknown,
        ) => {
          if (
            requestError instanceof
              DOMException &&
            requestError.name ===
              "AbortError"
          ) {
            return;
          }

          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "Unable to load dashboard data.",
          );
        },
      )
      .finally(() => {
        if (
          !controller
            .signal
            .aborted
        ) {
          setLoading(
            false,
          );
        }
      });

    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  const days =
    getRangeDays(
      selectedRange,
    );

  const range =
    useMemo(
      () =>
        getRangeDates(
          days,
        ),
      [days],
    );

  const currentFeedback =
    useMemo(
      () =>
        filterByRange(
          feedback,
          range.start,
          range.end,
        ),
      [
        feedback,
        range,
      ],
    );

  const metrics =
    useMemo(() => {
      const classified =
        currentFeedback.filter(
          isClassified,
        );

      const positive =
        classified.filter(
          (item) =>
            item.sentiment ===
            "POSITIVE",
        ).length;

      const neutral =
        classified.filter(
          (item) =>
            item.sentiment ===
            "NEUTRAL",
        ).length;

      const negative =
        classified.filter(
          (item) =>
            item.sentiment ===
            "NEGATIVE",
        ).length;

      const newCount =
        currentFeedback.filter(
          (item) =>
            !item.status ||
            item.status ===
              "NEW",
        ).length;

      const reviewed =
        currentFeedback.filter(
          (item) =>
            item.status ===
            "REVIEWED",
        ).length;

      const actioned =
        currentFeedback.filter(
          (item) =>
            item.status ===
            "ACTIONED",
        ).length;

      const open =
        currentFeedback.filter(
          (item) =>
            item.status !==
            "ACTIONED",
        ).length;

      const themeCounts =
        new Map<
          string,
          number
        >();

      const channelCounts =
        new Map<
          string,
          number
        >();

      currentFeedback.forEach(
        (item) => {
          item.themes?.forEach(
            (
              relation,
            ) => {
              const theme =
                relation.theme?.name?.trim();

              if (!theme) {
                return;
              }

              themeCounts.set(
                theme,
                (themeCounts.get(
                  theme,
                ) ?? 0) + 1,
              );
            },
          );

          const channel =
            item.channel?.trim();

          if (channel) {
            channelCounts.set(
              channel,
              (channelCounts.get(
                channel,
              ) ?? 0) + 1,
            );
          }
        },
      );

      return {
        total:
          currentFeedback.length,

        classified:
          classified.length,

        pending:
          Math.max(
            0,
            currentFeedback.length -
              classified.length,
          ),

        positive,
        neutral,
        negative,

        positiveRate:
          percentage(
            positive,
            classified.length,
          ),

        neutralRate:
          percentage(
            neutral,
            classified.length,
          ),

        negativeRate:
          percentage(
            negative,
            classified.length,
          ),

        newCount,
        reviewed,
        actioned,
        open,

        themes: [
          ...themeCounts.entries(),
        ]
          .sort(
            (a, b) =>
              b[1] -
              a[1],
          )
          .slice(
            0,
            4,
          ),

        channels: [
          ...channelCounts.entries(),
        ]
          .sort(
            (a, b) =>
              b[1] -
              a[1],
          )
          .slice(
            0,
            4,
          ),
      };
    }, [
      currentFeedback,
    ]);

  const activity =
    useMemo<ActivityItem[]>(
      () =>
        createActivity(
          currentFeedback,
          days,
        ),
      [
        currentFeedback,
        days,
      ],
    );

  const maxActivity =
    Math.max(
      ...activity.map(
        (item) =>
          item.count,
      ),
      1,
    );

  const recent =
    useMemo(
      () =>
        [
          ...currentFeedback,
        ]
          .sort(
            (a, b) =>
              new Date(
                b.createdAt,
              ).getTime() -
              new Date(
                a.createdAt,
              ).getTime(),
          )
          .slice(
            0,
            5,
          ),
      [
        currentFeedback,
      ],
    );

  function refreshDashboard() {
    setLoading(true);

    setError("");

    setRefreshKey(
      (current) =>
        current + 1,
    );
  }

  return (
    <LoopShell
      title="Dashboard"
      subtitle="Monitor customer feedback, sentiment and themes from your workspace."
    >
      <div className="mx-auto max-w-[1500px] space-y-5">
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-950 dark:text-white">
              Workspace overview
            </p>

            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {formatShortDate(
                range.start,
              )}{" "}
              —{" "}
              {formatShortDate(
                range.end,
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {ranges.map(
                (item) => (
                  <button
                    key={
                      item.key
                    }
                    type="button"
                    onClick={() =>
                      setSelectedRange(
                        item.key,
                      )
                    }
                    className={`rounded-lg px-4 py-2 text-[11px] font-semibold transition ${
                      selectedRange ===
                      item.key
                        ? "bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                    }`}
                  >
                    {item.key}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={
                refreshDashboard
              }
              disabled={loading}
              className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshIcon
                spinning={
                  loading
                }
              />

              Refresh
            </button>

            <Link
              href="/feedback"
              className="flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-3.5 text-[11px] font-semibold text-white transition hover:bg-blue-500"
            >
              <PlusIcon />

              Add feedback
            </Link>
          </div>
        </section>

        {error && (
          <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-rose-900/50 dark:bg-rose-950/20">
            <div>
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                Unable to load dashboard
              </p>

              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={
                refreshDashboard
              }
              className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-[11px] font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
            >
              Retry
            </button>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total feedback"
            value={
              loading
                ? "—"
                : metrics.total.toLocaleString()
            }
            helper={`Last ${days} days`}
            icon={
              <FeedbackIcon />
            }
            tone="blue"
          />

          <MetricCard
            title="Classified"
            value={
              loading
                ? "—"
                : `${metrics.classified}/${metrics.total}`
            }
            helper={
              metrics.pending >
              0
                ? `${metrics.pending} pending`
                : metrics.total >
                    0
                  ? "Classification complete"
                  : "No feedback yet"
            }
            icon={
              <AnalysisIcon />
            }
            tone="violet"
          />

          <MetricCard
            title="Open workflow"
            value={
              loading
                ? "—"
                : metrics.open.toLocaleString()
            }
            helper={`${metrics.newCount} new · ${metrics.reviewed} reviewed`}
            icon={
              <WorkflowIcon />
            }
            tone="amber"
          />

          <MetricCard
            title="Themes"
            value={
              loading
                ? "—"
                : metrics.themes.length.toLocaleString()
            }
            helper={
              metrics.themes
                .length > 0
                ? "Detected themes"
                : "No themes detected"
            }
            icon={
              <ThemeIcon />
            }
            tone="emerald"
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
          <Panel
            title="Feedback activity"
            description={`Feedback received during the selected ${days}-day period.`}
            action={
              <Link
                href="/feedback"
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                View feedback →
              </Link>
            }
          >
            {loading ? (
              <Skeleton className="h-[260px]" />
            ) : metrics.total ===
              0 ? (
              <EmptyState
                title="No feedback activity"
                description="Activity will appear after feedback is added to the workspace."
                href="/feedback"
                action="Add feedback"
              />
            ) : (
              <div>
                <div className="mb-5 flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                      {
                        metrics.total
                      }
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {metrics.total ===
                      1
                        ? "feedback received"
                        : "feedback records received"}
                    </p>
                  </div>
                </div>

                <div className="relative h-[210px]">
                  <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between">
                    {[1, 2, 3, 4].map(
                      (
                        line,
                      ) => (
                        <div
                          key={
                            line
                          }
                          className="border-t border-dashed border-slate-100 dark:border-slate-800"
                        />
                      ),
                    )}
                  </div>

                  <div
                    className={`relative grid h-full items-end gap-3 ${
                      days === 7
                        ? "grid-cols-7"
                        : "grid-cols-6"
                    }`}
                  >
                    {activity.map(
                      (
                        item,
                        index,
                      ) => {
                        const height =
                          item.count ===
                          0
                            ? 3
                            : Math.max(
                                14,
                                Math.round(
                                  (item.count /
                                    maxActivity) *
                                    100,
                                ),
                              );

                        return (
                          <div
                            key={`${item.label}-${index}`}
                            className="flex h-full flex-col items-center justify-end"
                          >
                            <span className="mb-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              {
                                item.count
                              }
                            </span>

                            <div className="flex h-[150px] w-full max-w-12 items-end">
                              <div
                                className={`w-full rounded-t-lg ${
                                  item.count >
                                  0
                                    ? "bg-blue-600"
                                    : "bg-slate-100 dark:bg-slate-800"
                                }`}
                                style={{
                                  height: `${height}%`,
                                }}
                              />
                            </div>

                            <span className="mt-2 text-[10px] text-slate-400">
                              {
                                item.label
                              }
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            )}
          </Panel>

          <Panel
            title="Sentiment"
            description="Sentiment across classified feedback."
          >
            {loading ? (
              <Skeleton className="h-[260px]" />
            ) : metrics.classified ===
              0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <AnalysisIcon />
                </span>

                <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
                  Awaiting classification
                </p>

                <p className="mt-2 max-w-xs text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                  Sentiment insights will appear after feedback receives classification data.
                </p>

                {metrics.pending >
                  0 && (
                  <span className="mt-4 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                    {
                      metrics.pending
                    }{" "}
                    pending
                  </span>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex justify-center py-2">
                  <div
                    className="relative flex h-36 w-36 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(
                        #10b981 0 ${metrics.positiveRate}%,
                        #f59e0b ${metrics.positiveRate}% ${
                          metrics.positiveRate +
                          metrics.neutralRate
                        }%,
                        #f43f5e ${
                          metrics.positiveRate +
                          metrics.neutralRate
                        }% 100%
                      )`,
                    }}
                  >
                    <div className="flex h-[102px] w-[102px] flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
                      <span className="text-2xl font-semibold text-slate-950 dark:text-white">
                        {
                          metrics.classified
                        }
                      </span>

                      <span className="text-[9px] uppercase tracking-wider text-slate-400">
                        classified
                      </span>
                    </div>
                  </div>
                </div>

                <SentimentRow
                  label="Positive"
                  value={
                    metrics.positive
                  }
                  percentageValue={
                    metrics.positiveRate
                  }
                  color="bg-emerald-500"
                />

                <SentimentRow
                  label="Neutral"
                  value={
                    metrics.neutral
                  }
                  percentageValue={
                    metrics.neutralRate
                  }
                  color="bg-amber-400"
                />

                <SentimentRow
                  label="Negative"
                  value={
                    metrics.negative
                  }
                  percentageValue={
                    metrics.negativeRate
                  }
                  color="bg-rose-500"
                />
              </div>
            )}
          </Panel>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <Panel
            title="Recent feedback"
            description="Latest feedback captured in this period."
            action={
              <Link
                href="/feedback"
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                View all →
              </Link>
            }
          >
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : recent.length ===
              0 ? (
              <EmptyState
                title="No feedback yet"
                description="Recently captured feedback will appear here."
                href="/feedback"
                action="Add feedback"
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recent.map(
                  (
                    item,
                  ) => (
                    <article
                      key={
                        item.id
                      }
                      className="flex gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {getInitials(
                          item.customerName,
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                              {item.customerName ||
                                "Anonymous Customer"}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              {item.channel ||
                                "Unknown source"}{" "}
                              ·{" "}
                              {formatDate(
                                item.createdAt,
                              )}
                            </p>
                          </div>

                          <SentimentBadge
                            sentiment={
                              item.sentiment
                            }
                          />
                        </div>

                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                          {
                            item.content
                          }
                        </p>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </Panel>

          <div className="space-y-5">
            <Panel
              title="Workflow"
              description="Review progress."
            >
              <div className="grid grid-cols-3 gap-2">
                <MiniStat
                  label="New"
                  value={
                    metrics.newCount
                  }
                />

                <MiniStat
                  label="Reviewed"
                  value={
                    metrics.reviewed
                  }
                />

                <MiniStat
                  label="Actioned"
                  value={
                    metrics.actioned
                  }
                />
              </div>
            </Panel>

            <Panel
              title="Top themes"
              description="Most common linked themes."
            >
              {metrics.themes
                .length === 0 ? (
                <p className="py-6 text-center text-[11px] leading-5 text-slate-400">
                  No themes detected yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {metrics.themes.map(
                    (
                      [
                        theme,
                        count,
                      ],
                    ) => (
                      <div
                        key={
                          theme
                        }
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60"
                      >
                        <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                          {
                            theme
                          }
                        </span>

                        <span className="ml-3 text-xs font-semibold text-slate-950 dark:text-white">
                          {
                            count
                          }
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}

              <Link
                href="/reports"
                className="mt-4 flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Open reports
              </Link>
            </Panel>

            {metrics.channels
              .length > 0 && (
              <Panel
                title="Sources"
                description="Feedback channels."
              >
                <div className="space-y-3">
                  {metrics.channels.map(
                    (
                      [
                        channel,
                        count,
                      ],
                    ) => (
                      <div
                        key={
                          channel
                        }
                        className="flex items-center justify-between"
                      >
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {
                            channel
                          }
                        </span>

                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {
                            count
                          }
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </Panel>
            )}
          </div>
        </section>
      </div>
    </LoopShell>
  );
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/[0.02] dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
            {title}
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
            {
              description
            }
          </p>
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

function MetricCard({
  title,
  value,
  helper,
  icon,
  tone,
}: {
  title: string;
  value: string;
  helper: string;
  icon: ReactNode;
  tone:
    | "blue"
    | "violet"
    | "amber"
    | "emerald";
}) {
  const styles = {
    blue:
      "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/[0.02] dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {value}
          </p>
        </div>

        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles[tone]}`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-3 text-[10px] text-slate-400">
        {helper}
      </p>
    </article>
  );
}

function SentimentRow({
  label,
  value,
  percentageValue,
  color,
}: {
  label: string;
  value: number;
  percentageValue: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`h-2 w-2 rounded-full ${color}`}
      />

      <span className="flex-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
        {label}
      </span>

      <span className="text-[10px] text-slate-400">
        {value}
      </span>

      <span className="w-9 text-right text-[11px] font-semibold text-slate-900 dark:text-white">
        {percentageValue}%
      </span>
    </div>
  );
}

function SentimentBadge({
  sentiment,
}: {
  sentiment?: Sentiment | null;
}) {
  if (!sentiment) {
    return (
      <span className="w-fit rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        Unclassified
      </span>
    );
  }

  const styles: Record<
    Sentiment,
    string
  > = {
    POSITIVE:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",

    NEUTRAL:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",

    NEGATIVE:
      "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300",
  };

  const labels: Record<
    Sentiment,
    string
  > = {
    POSITIVE:
      "Positive",
    NEUTRAL:
      "Neutral",
    NEGATIVE:
      "Negative",
  };

  return (
    <span
      className={`w-fit rounded-full px-2 py-1 text-[9px] font-semibold ${styles[sentiment]}`}
    >
      {labels[sentiment]}
    </span>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-3 text-center dark:bg-slate-800/60">
      <p className="text-lg font-semibold text-slate-950 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-medium text-slate-400">
        {label}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 text-center dark:border-slate-700 dark:bg-slate-800/20">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm dark:bg-slate-800">
        <FeedbackIcon />
      </span>

      <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
        {title}
      </p>

      <p className="mt-2 max-w-sm text-[11px] leading-5 text-slate-500 dark:text-slate-400">
        {
          description
        }
      </p>

      <Link
        href={href}
        className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      >
        {action}
      </Link>
    </div>
  );
}

function Skeleton({
  className,
}: {
  className: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800 ${className}`}
    />
  );
}

function RefreshIcon({
  spinning,
}: {
  spinning: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-3.5 w-3.5 ${
        spinning
          ? "animate-spin"
          : ""
      }`}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        d="M20 11a8 8 0 0 0-14.9-4M4 5v5h5M4 13a8 8 0 0 0 14.9 4M20 19v-5h-5"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        d="M12 5v14M5 12h14"
      />
    </svg>
  );
}

function FeedbackIcon() {
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

function AnalysisIcon() {
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
        d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 18l-1.8-6.2L5 10l5.2-1.8L12 3Z"
      />
    </svg>
  );
}

function WorkflowIcon() {
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
        y="14"
        width="6"
        height="6"
        rx="1.5"
      />

      <path
        strokeLinecap="round"
        d="M10 7h3a4 4 0 0 1 4 4v3"
      />
    </svg>
  );
}

function ThemeIcon() {
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
        d="m12 4 8 4-8 4-8-4 8-4ZM4 13l8 4 8-4M4 18l8 4 8-4"
      />
    </svg>
  );
}