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

type ActivityBucket = {
  label: string;
  count: number;
};

const rangeOptions: {
  key: RangeKey;
  label: string;
  days: number;
}[] = [
  {
    key: "7D",
    label: "7D",
    days: 7,
  },
  {
    key: "30D",
    label: "30D",
    days: 30,
  },
  {
    key: "90D",
    label: "90D",
    days: 90,
  },
];

function startOfDay(
  value: Date,
) {
  const date = new Date(value);

  date.setHours(
    0,
    0,
    0,
    0,
  );

  return date;
}

function endOfDay(
  value: Date,
) {
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
    rangeOptions.find(
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
  feedback: FeedbackItem[],
  start: Date,
  end: Date,
) {
  return feedback.filter(
    (item) => {
      const createdAt =
        new Date(
          item.createdAt,
        );

      if (
        Number.isNaN(
          createdAt.getTime(),
        )
      ) {
        return false;
      }

      return (
        createdAt >= start &&
        createdAt <= end
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

function createActivityBuckets(
  feedback: FeedbackItem[],
  days: number,
): ActivityBucket[] {
  const today =
    endOfDay(new Date());

  if (days === 7) {
    return Array.from(
      {
        length: 7,
      },
      (_, index) => {
        const day =
          startOfDay(today);

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
    startOfDay(today);

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
        endOfDay(today);

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
          method: "GET",
          cache: "no-store",
          signal,
        },
      );

    if (!response.ok) {
      const errorBody =
        await response
          .json()
          .catch(
            () => null,
          );

      const message =
        errorBody &&
        typeof errorBody ===
          "object" &&
        "error" in errorBody &&
        typeof errorBody.error ===
          "string"
          ? errorBody.error
          : "Unable to load report data.";

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

function escapeCsv(
  value:
    | string
    | number
    | null
    | undefined,
) {
  const text =
    value === null ||
    value === undefined
      ? ""
      : String(value);

  return `"${text.replace(
    /"/g,
    '""',
  )}"`;
}

export default function ReportsPage() {
  const [
    selectedRange,
    setSelectedRange,
  ] =
    useState<RangeKey>(
      "30D",
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
              : "Unable to load reports.",
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

  const rangeDays =
    getRangeDays(
      selectedRange,
    );

  const range =
    useMemo(
      () =>
        getRangeDates(
          rangeDays,
        ),
      [rangeDays],
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

  const report =
    useMemo(() => {
      const total =
        currentFeedback.length;

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

      const themeCounts =
        new Map<
          string,
          number
        >();

      let themedRecords = 0;

      const channelCounts =
        new Map<
          string,
          number
        >();

      currentFeedback.forEach(
        (item) => {
          const themes =
            (
              item.themes ??
              []
            ).filter(
              (
                relation,
              ) =>
                Boolean(
                  relation.theme
                    ?.name?.trim(),
                ),
            );

          if (
            themes.length >
            0
          ) {
            themedRecords += 1;
          }

          themes.forEach(
            (
              relation,
            ) => {
              const name =
                relation.theme
                  ?.name?.trim();

              if (!name) {
                return;
              }

              themeCounts.set(
                name,
                (themeCounts.get(
                  name,
                ) ?? 0) + 1,
              );
            },
          );

          const channel =
            item.channel
              ?.trim() ||
            "Unknown";

          channelCounts.set(
            channel,
            (channelCounts.get(
              channel,
            ) ?? 0) + 1,
          );
        },
      );

      const themes = [
        ...themeCounts.entries(),
      ]
        .sort(
          (a, b) =>
            b[1] - a[1],
        )
        .slice(
          0,
          6,
        );

      const channels = [
        ...channelCounts.entries(),
      ]
        .sort(
          (a, b) =>
            b[1] - a[1],
        )
        .slice(
          0,
          6,
        );

      const needsAttention =
        currentFeedback
          .filter(
            (item) =>
              item.sentiment ===
                "NEGATIVE" ||
              (!item.status ||
                item.status ===
                  "NEW"),
          )
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
            4,
          );

      return {
        total,
        classified:
          classified.length,
        unclassified:
          Math.max(
            0,
            total -
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

        classificationCoverage:
          percentage(
            classified.length,
            total,
          ),

        newCount,
        reviewed,
        actioned,

        themeCount:
          themeCounts.size,

        themeCoverage:
          percentage(
            themedRecords,
            total,
          ),

        themes,
        channels,
        needsAttention,
      };
    }, [
      currentFeedback,
    ]);

  const activity =
    useMemo(
      () =>
        createActivityBuckets(
          currentFeedback,
          rangeDays,
        ),
      [
        currentFeedback,
        rangeDays,
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

  function refreshReports() {
    setLoading(true);

    setError("");

    setRefreshKey(
      (value) =>
        value + 1,
    );
  }

  function exportCsv() {
    if (
      currentFeedback.length ===
      0
    ) {
      return;
    }

    const rows = [
      [
        "Customer",
        "Channel",
        "Sentiment",
        "Status",
        "Themes",
        "Created At",
        "Feedback",
      ],

      ...currentFeedback.map(
        (item) => [
          item.customerName ||
            "Anonymous Customer",

          item.channel ||
            "Unknown",

          item.sentiment ||
            "UNCLASSIFIED",

          item.status ||
            "NEW",

          (
            item.themes ??
            []
          )
            .map(
              (
                relation,
              ) =>
                relation.theme
                  ?.name,
            )
            .filter(Boolean)
            .join("; "),

          formatDate(
            item.createdAt,
          ),

          item.content,
        ],
      ),
    ];

    const csv =
      rows
        .map((row) =>
          row
            .map(
              (
                value,
              ) =>
                escapeCsv(
                  value,
                ),
            )
            .join(","),
        )
        .join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type: "text/csv;charset=utf-8;",
        },
      );

    const url =
      window.URL.createObjectURL(
        blob,
      );

    const anchor =
      document.createElement(
        "a",
      );

    anchor.href = url;

    anchor.download =
      `loop-feedback-${selectedRange.toLowerCase()}.csv`;

    document.body.appendChild(
      anchor,
    );

    anchor.click();

    anchor.remove();

    window.URL.revokeObjectURL(
      url,
    );
  }

  return (
    <LoopShell
      title="Reports"
      subtitle="Explore customer feedback trends using real workspace data."
    >
      <div className="mx-auto max-w-[1500px] space-y-5">
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-950 dark:text-white">
              Feedback report
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
              {rangeOptions.map(
                (
                  option,
                ) => (
                  <button
                    key={
                      option.key
                    }
                    type="button"
                    onClick={() =>
                      setSelectedRange(
                        option.key,
                      )
                    }
                    className={`rounded-lg px-4 py-2 text-[11px] font-semibold transition ${
                      selectedRange ===
                      option.key
                        ? "bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {
                      option.label
                    }
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={
                refreshReports
              }
              disabled={
                loading
              }
              className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshIcon
                spinning={
                  loading
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={
                exportCsv
              }
              disabled={
                loading ||
                currentFeedback.length ===
                  0
              }
              className="flex h-9 items-center gap-2 rounded-xl bg-slate-950 px-3.5 text-[11px] font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              <DownloadIcon />

              Export CSV
            </button>
          </div>
        </section>

        {error && (
          <ErrorBanner
            message={
              error
            }
            onRetry={
              refreshReports
            }
          />
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Feedback"
            value={
              loading
                ? "—"
                : report.total.toLocaleString()
            }
            helper={`Last ${rangeDays} days`}
            icon={
              <FeedbackIcon />
            }
            tone="blue"
          />

          <MetricCard
            label="Classified"
            value={
              loading
                ? "—"
                : `${report.classificationCoverage}%`
            }
            helper={`${report.classified} of ${report.total} records`}
            icon={
              <AnalysisIcon />
            }
            tone="violet"
          />

          <MetricCard
            label="Positive sentiment"
            value={
              loading
                ? "—"
                : report.classified >
                    0
                  ? `${report.positiveRate}%`
                  : "—"
            }
            helper={
              report.classified >
              0
                ? `${report.positive} positive records`
                : "Awaiting classification"
            }
            icon={
              <PositiveIcon />
            }
            tone="emerald"
          />

          <MetricCard
            label="Themes"
            value={
              loading
                ? "—"
                : report.themeCount.toLocaleString()
            }
            helper={`${report.themeCoverage}% feedback coverage`}
            icon={
              <ThemeIcon />
            }
            tone="amber"
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
          <Panel
            title="Feedback volume"
            description={`Feedback activity across the selected ${rangeDays}-day period.`}
          >
            {loading ? (
              <Skeleton className="h-[275px]" />
            ) : report.total ===
              0 ? (
              <EmptyState
                icon={
                  <FeedbackIcon />
                }
                title="No report data yet"
                description="Feedback volume will appear after records are added to the workspace."
                href="/feedback"
                action="Add feedback"
              />
            ) : (
              <div>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                      {
                        report.total
                      }
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {report.total ===
                      1
                        ? "feedback record"
                        : "feedback records"}
                    </p>
                  </div>

                  <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    {
                      selectedRange
                    }
                  </span>
                </div>

                <div className="relative h-[220px]">
                  <div className="absolute inset-0 flex flex-col justify-between">
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
                      selectedRange === "7D"
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

                            <div className="flex h-[160px] w-full max-w-14 items-end">
                              <div
                                className={`w-full rounded-t-lg transition-all ${
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

                            <span className="mt-2 max-w-full truncate text-[10px] text-slate-400">
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
            title="Sentiment distribution"
            description="Sentiment across classified feedback records."
          >
            {loading ? (
              <Skeleton className="h-[275px]" />
            ) : report.classified ===
              0 ? (
              <div className="flex min-h-[275px] flex-col items-center justify-center px-4 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <AnalysisIcon />
                </span>

                <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
                  No sentiment data
                </p>

                <p className="mt-2 max-w-xs text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                  Sentiment distribution will appear when feedback classification is available.
                </p>

                {report.unclassified >
                  0 && (
                  <span className="mt-4 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                    {
                      report.unclassified
                    }{" "}
                    pending
                  </span>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-center py-3">
                  <div
                    className="relative flex h-40 w-40 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(
                        #10b981 0 ${report.positiveRate}%,
                        #f59e0b ${report.positiveRate}% ${
                          report.positiveRate +
                          report.neutralRate
                        }%,
                        #f43f5e ${
                          report.positiveRate +
                          report.neutralRate
                        }% 100%
                      )`,
                    }}
                  >
                    <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
                      <span className="text-2xl font-semibold text-slate-950 dark:text-white">
                        {
                          report.classified
                        }
                      </span>

                      <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                        Classified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <SentimentRow
                    label="Positive"
                    count={
                      report.positive
                    }
                    percentageValue={
                      report.positiveRate
                    }
                    color="bg-emerald-500"
                  />

                  <SentimentRow
                    label="Neutral"
                    count={
                      report.neutral
                    }
                    percentageValue={
                      report.neutralRate
                    }
                    color="bg-amber-400"
                  />

                  <SentimentRow
                    label="Negative"
                    count={
                      report.negative
                    }
                    percentageValue={
                      report.negativeRate
                    }
                    color="bg-rose-500"
                  />
                </div>
              </div>
            )}
          </Panel>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <Panel
            title="Top themes"
            description="Most frequently linked themes in this period."
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
              <div className="space-y-3">
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
            ) : report.themes
                .length ===
              0 ? (
              <EmptyState
                icon={
                  <ThemeIcon />
                }
                title="No themes detected"
                description="Theme rankings will appear after feedback records receive linked themes."
                href="/feedback"
                action="View feedback"
              />
            ) : (
              <div className="space-y-3">
                {report.themes.map(
                  (
                    [
                      theme,
                      count,
                    ],
                    index,
                  ) => (
                    <div
                      key={
                        theme
                      }
                      className="flex items-center gap-4 rounded-xl border border-slate-200 p-3.5 dark:border-slate-800"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                        {index +
                          1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {
                              theme
                            }
                          </span>

                          <span className="text-xs font-semibold text-slate-950 dark:text-white">
                            {
                              count
                            }
                          </span>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{
                              width: `${Math.max(
                                8,
                                percentage(
                                  count,
                                  report.total,
                                ),
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </Panel>

          <Panel
            title="Channel distribution"
            description="Feedback sources represented in the selected period."
          >
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
            ) : report.channels
                .length ===
              0 ? (
              <EmptyState
                icon={
                  <ChannelIcon />
                }
                title="No source data"
                description="Feedback channel distribution will appear after records are available."
                href="/feedback"
                action="Add feedback"
              />
            ) : (
              <div className="space-y-3">
                {report.channels.map(
                  (
                    [
                      channel,
                      count,
                    ],
                  ) => {
                    const share =
                      percentage(
                        count,
                        report.total,
                      );

                    return (
                      <div
                        key={
                          channel
                        }
                        className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                              <ChannelIcon />
                            </span>

                            <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {
                                channel
                              }
                            </span>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-semibold text-slate-950 dark:text-white">
                              {
                                count
                              }
                            </p>

                            <p className="mt-0.5 text-[9px] text-slate-400">
                              {
                                share
                              }
                              %
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{
                              width: `${share}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </Panel>
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
          <Panel
            title="Data coverage"
            description="How much of this report has structured insight data."
          >
            <div className="space-y-5">
              <CoverageRow
                label="Sentiment classification"
                value={
                  report.classificationCoverage
                }
                detail={`${report.classified}/${report.total}`}
                color="bg-violet-500"
              />

              <CoverageRow
                label="Theme coverage"
                value={
                  report.themeCoverage
                }
                detail={`${report.themeCount} themes`}
                color="bg-blue-500"
              />

              <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Workflow
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <MiniStat
                    label="New"
                    value={
                      report.newCount
                    }
                  />

                  <MiniStat
                    label="Reviewed"
                    value={
                      report.reviewed
                    }
                  />

                  <MiniStat
                    label="Actioned"
                    value={
                      report.actioned
                    }
                  />
                </div>
              </div>
            </div>
          </Panel>

          <Panel
            title="Needs attention"
            description="Recent negative or unreviewed feedback in this period."
            action={
              <Link
                href="/feedback"
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Open inbox →
              </Link>
            }
          >
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : report
                .needsAttention
                .length ===
              0 ? (
              <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <CheckIcon />
                </span>

                <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
                  Nothing requiring attention
                </p>

                <p className="mt-2 max-w-sm text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                  No recent negative or unreviewed feedback is available in this period.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {report.needsAttention.map(
                  (
                    item,
                  ) => (
                    <article
                      key={
                        item.id
                      }
                      className="py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-3">
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

                        <AttentionBadge
                          sentiment={
                            item.sentiment
                          }
                          status={
                            item.status
                          }
                        />
                      </div>

                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                        {
                          item.content
                        }
                      </p>
                    </article>
                  ),
                )}
              </div>
            )}
          </Panel>
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
      <div className="mb-5 flex items-start justify-between gap-4">
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

        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </div>

      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
  tone:
    | "blue"
    | "violet"
    | "emerald"
    | "amber";
}) {
  const styles = {
    blue:
      "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",

    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300",

    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",

    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/[0.02] dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {label}
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
  count,
  percentageValue,
  color,
}: {
  label: string;
  count: number;
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
        {count}
      </span>

      <span className="w-9 text-right text-[11px] font-semibold text-slate-950 dark:text-white">
        {percentageValue}%
      </span>
    </div>
  );
}

function CoverageRow({
  label,
  value,
  detail,
  color,
}: {
  label: string;
  value: number;
  detail: string;
  color: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {label}
          </p>

          <p className="mt-0.5 text-[10px] text-slate-400">
            {detail}
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-950 dark:text-white">
          {value}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
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

function AttentionBadge({
  sentiment,
  status,
}: {
  sentiment?: Sentiment | null;
  status?: FeedbackStatus | null;
}) {
  if (
    sentiment ===
    "NEGATIVE"
  ) {
    return (
      <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-[9px] font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
        Negative
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
      {status ===
      "REVIEWED"
        ? "Reviewed"
        : status ===
            "ACTIONED"
          ? "Actioned"
          : "New"}
    </span>
  );
}

function EmptyState({
  icon,
  title,
  description,
  href,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 text-center dark:border-slate-700 dark:bg-slate-800/20">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm dark:bg-slate-800">
        {icon}
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
        className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {action}
      </Link>
    </div>
  );
}

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-rose-900/50 dark:bg-rose-950/20">
      <div>
        <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
          Reports unavailable
        </p>

        <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={
          onRetry
        }
        className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-[11px] font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
      >
        Retry
      </button>
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

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"
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

function PositiveIcon() {
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
        r="8"
      />

      <path
        strokeLinecap="round"
        d="M8.5 14s1.2 2 3.5 2 3.5-2 3.5-2M9 9.5h.01M15 9.5h.01"
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

function ChannelIcon() {
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
        cx="6"
        cy="12"
        r="2"
      />

      <circle
        cx="18"
        cy="6"
        r="2"
      />

      <circle
        cx="18"
        cy="18"
        r="2"
      />

      <path
        strokeLinecap="round"
        d="m8 11 8-4M8 13l8 4"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
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
        d="m6 12 4 4 8-8"
      />
    </svg>
  );
}