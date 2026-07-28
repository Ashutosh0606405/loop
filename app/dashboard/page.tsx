"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import LoopShell from "../../components/LoopShell";

type RangeKey = "7D" | "30D" | "90D";

type MetricTone =
  | "blue"
  | "emerald"
  | "rose"
  | "violet";

type SummaryCard = {
  title: string;
  value: string;
  change: string;
  description: string;
  trend: "up" | "down";
  tone: MetricTone;
  sparkline: number[];
};

const rangeOptions: {
  key: RangeKey;
  label: string;
}[] = [
  {
    key: "7D",
    label: "7 days",
  },
  {
    key: "30D",
    label: "30 days",
  },
  {
    key: "90D",
    label: "90 days",
  },
];

const summaryData: Record<
  RangeKey,
  SummaryCard[]
> = {
  "7D": [
    {
      title: "Total Feedback",
      value: "1,186",
      change: "+12.5%",
      description: "Compared to last week",
      trend: "up",
      tone: "blue",
      sparkline: [38, 52, 45, 68, 59, 75, 82],
    },
    {
      title: "Positive Feedback",
      value: "728",
      change: "+8.4%",
      description: "61% of total feedback",
      trend: "up",
      tone: "emerald",
      sparkline: [42, 48, 54, 59, 63, 67, 74],
    },
    {
      title: "Open Issues",
      value: "38",
      change: "-4.2%",
      description: "Needs team attention",
      trend: "down",
      tone: "rose",
      sparkline: [78, 72, 65, 61, 55, 48, 42],
    },
    {
      title: "AI Confidence",
      value: "94.2%",
      change: "+2.1%",
      description: "Analysis accuracy",
      trend: "up",
      tone: "violet",
      sparkline: [72, 74, 79, 83, 87, 91, 94],
    },
  ],

  "30D": [
    {
      title: "Total Feedback",
      value: "4,892",
      change: "+18.7%",
      description: "Compared to last month",
      trend: "up",
      tone: "blue",
      sparkline: [44, 51, 57, 53, 66, 72, 85],
    },
    {
      title: "Positive Feedback",
      value: "3,021",
      change: "+11.2%",
      description: "62% of total feedback",
      trend: "up",
      tone: "emerald",
      sparkline: [48, 52, 56, 61, 67, 72, 78],
    },
    {
      title: "Open Issues",
      value: "126",
      change: "-7.8%",
      description: "Needs team attention",
      trend: "down",
      tone: "rose",
      sparkline: [83, 76, 69, 65, 58, 49, 43],
    },
    {
      title: "AI Confidence",
      value: "95.1%",
      change: "+3.4%",
      description: "Analysis accuracy",
      trend: "up",
      tone: "violet",
      sparkline: [70, 76, 80, 84, 88, 92, 96],
    },
  ],

  "90D": [
    {
      title: "Total Feedback",
      value: "14,648",
      change: "+24.8%",
      description: "Compared to previous period",
      trend: "up",
      tone: "blue",
      sparkline: [39, 47, 52, 61, 69, 77, 89],
    },
    {
      title: "Positive Feedback",
      value: "9,126",
      change: "+16.5%",
      description: "62% of total feedback",
      trend: "up",
      tone: "emerald",
      sparkline: [45, 51, 58, 63, 68, 75, 84],
    },
    {
      title: "Open Issues",
      value: "354",
      change: "-10.3%",
      description: "Needs team attention",
      trend: "down",
      tone: "rose",
      sparkline: [87, 80, 72, 64, 57, 48, 39],
    },
    {
      title: "AI Confidence",
      value: "96.4%",
      change: "+4.6%",
      description: "Analysis accuracy",
      trend: "up",
      tone: "violet",
      sparkline: [68, 73, 79, 85, 89, 93, 97],
    },
  ],
};

const insightOptions = [
  {
    label: "All",
    title: "Overall Customer Experience",
    description:
      "Customer satisfaction is improving. Product quality and faster support responses are the strongest positive drivers.",
    badge: "Stable performance",
    tone: "blue",
    recommendation:
      "Continue monitoring checkout speed while maintaining the current support response time.",
  },
  {
    label: "Positive",
    title: "Positive Feedback Insights",
    description:
      "Customers appreciate the clean interface, reliable product quality and quick response from the customer support team.",
    badge: "61% positive",
    tone: "emerald",
    recommendation:
      "Highlight product quality and responsive support in customer-facing communication.",
  },
  {
    label: "Negative",
    title: "Negative Feedback Insights",
    description:
      "Most negative feedback is related to payment delays, application loading speed and checkout performance.",
    badge: "16% negative",
    tone: "rose",
    recommendation:
      "Prioritise payment confirmation and checkout performance improvements.",
  },
  {
    label: "Urgent",
    title: "Urgent Issues Requiring Attention",
    description:
      "Checkout slowdown and delayed payment confirmations need immediate investigation from the technical team.",
    badge: "3 urgent issues",
    tone: "amber",
    recommendation:
      "Assign owners and define resolution deadlines for the three urgent issues.",
  },
] as const;

type InsightLabel =
  (typeof insightOptions)[number]["label"];

const sentimentData = [
  {
    name: "Positive",
    value: 61,
    count: 728,
    barClass: "bg-emerald-500",
    textClass: "text-emerald-700",
    dotClass: "bg-emerald-500",
  },
  {
    name: "Neutral",
    value: 23,
    count: 273,
    barClass: "bg-amber-400",
    textClass: "text-amber-700",
    dotClass: "bg-amber-400",
  },
  {
    name: "Negative",
    value: 16,
    count: 185,
    barClass: "bg-rose-500",
    textClass: "text-rose-700",
    dotClass: "bg-rose-500",
  },
];

const activityData: Record<
  RangeKey,
  {
    label: string;
    value: number;
    feedback: number;
  }[]
> = {
  "7D": [
    {
      label: "Mon",
      value: 48,
      feedback: 142,
    },
    {
      label: "Tue",
      value: 62,
      feedback: 183,
    },
    {
      label: "Wed",
      value: 54,
      feedback: 159,
    },
    {
      label: "Thu",
      value: 76,
      feedback: 224,
    },
    {
      label: "Fri",
      value: 68,
      feedback: 201,
    },
    {
      label: "Sat",
      value: 42,
      feedback: 124,
    },
    {
      label: "Sun",
      value: 52,
      feedback: 153,
    },
  ],

  "30D": [
    {
      label: "W1",
      value: 45,
      feedback: 642,
    },
    {
      label: "W2",
      value: 58,
      feedback: 821,
    },
    {
      label: "W3",
      value: 72,
      feedback: 1018,
    },
    {
      label: "W4",
      value: 84,
      feedback: 1186,
    },
    {
      label: "W5",
      value: 69,
      feedback: 978,
    },
    {
      label: "W6",
      value: 78,
      feedback: 1104,
    },
    {
      label: "Now",
      value: 88,
      feedback: 1248,
    },
  ],

  "90D": [
    {
      label: "Apr",
      value: 46,
      feedback: 3248,
    },
    {
      label: "May",
      value: 55,
      feedback: 3872,
    },
    {
      label: "Jun",
      value: 63,
      feedback: 4480,
    },
    {
      label: "Jul",
      value: 78,
      feedback: 5612,
    },
    {
      label: "Aug",
      value: 70,
      feedback: 4986,
    },
    {
      label: "Sep",
      value: 82,
      feedback: 5924,
    },
    {
      label: "Now",
      value: 91,
      feedback: 6480,
    },
  ],
};

const themes = [
  {
    name: "Product Quality",
    mentions: 386,
    percentage: 82,
    trend: "+18%",
  },
  {
    name: "Application Speed",
    mentions: 274,
    percentage: 65,
    trend: "+12%",
  },
  {
    name: "Payment Issues",
    mentions: 198,
    percentage: 48,
    trend: "+8%",
  },
  {
    name: "Customer Support",
    mentions: 165,
    percentage: 39,
    trend: "+5%",
  },
];

const urgentIssues = [
  {
    title: "Checkout slowdown",
    description:
      "Multiple customers reported slow checkout performance.",
    status: "High Priority",
    statusClass:
      "bg-rose-100 text-rose-700",
    accentClass: "bg-rose-500",
    owner: "Engineering",
    due: "Today",
  },
  {
    title: "Payment confirmation delay",
    description:
      "Payment confirmation is taking longer than expected.",
    status: "Investigating",
    statusClass:
      "bg-amber-100 text-amber-700",
    accentClass: "bg-amber-500",
    owner: "Payments",
    due: "Tomorrow",
  },
  {
    title: "Onboarding confusion",
    description:
      "New users need clearer guidance during account setup.",
    status: "Medium",
    statusClass:
      "bg-blue-100 text-blue-700",
    accentClass: "bg-blue-500",
    owner: "Product",
    due: "2 days",
  },
];

const recentFeedback = [
  {
    id: "FB-1042",
    customer: "Ananya R",
    feedback:
      "The application is easy to use and the interface looks clean.",
    sentiment: "Positive",
    sentimentClass:
      "bg-emerald-100 text-emerald-700",
    source: "Web App",
    time: "10 min ago",
    initials: "AR",
  },
  {
    id: "FB-1041",
    customer: "Rahul K",
    feedback:
      "Payment confirmation took more time than expected.",
    sentiment: "Negative",
    sentimentClass:
      "bg-rose-100 text-rose-700",
    source: "Email",
    time: "34 min ago",
    initials: "RK",
  },
  {
    id: "FB-1040",
    customer: "Meena S",
    feedback:
      "Customer support solved my issue quickly.",
    sentiment: "Positive",
    sentimentClass:
      "bg-emerald-100 text-emerald-700",
    source: "Support",
    time: "1 hour ago",
    initials: "MS",
  },
  {
    id: "FB-1039",
    customer: "Arun P",
    feedback:
      "The new dashboard is useful, but reports could load faster.",
    sentiment: "Neutral",
    sentimentClass:
      "bg-amber-100 text-amber-700",
    source: "Survey",
    time: "2 hours ago",
    initials: "AP",
  },
];

const quickActions = [
  {
    title: "Ask LOOP",
    description:
      "Ask questions using customer feedback data.",
    href: "/ask-loop",
    toneClass:
      "bg-violet-50 text-violet-700",
    icon: "spark",
  },
  {
    title: "Review Feedback",
    description:
      "View and classify recent customer feedback.",
    href: "/feedback",
    toneClass:
      "bg-blue-50 text-blue-700",
    icon: "message",
  },
  {
    title: "Generate Report",
    description:
      "Open AI-powered feedback reports.",
    href: "/reports",
    toneClass:
      "bg-emerald-50 text-emerald-700",
    icon: "report",
  },
];

export default function DashboardPage() {
  const [selectedRange, setSelectedRange] =
    useState<RangeKey>("7D");

  const [selectedInsight, setSelectedInsight] =
    useState<InsightLabel>("All");

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [toastMessage, setToastMessage] =
    useState("");

  const currentSummary =
    summaryData[selectedRange];

  const currentActivity =
    activityData[selectedRange];

  const activeInsight =
    insightOptions.find(
      (item) => item.label === selectedInsight,
    ) ?? insightOptions[0];

  const totalActivity = useMemo(() => {
    return currentActivity.reduce(
      (total, item) => total + item.feedback,
      0,
    );
  }, [currentActivity]);

  function showToast(message: string) {
    setToastMessage(message);

    window.setTimeout(() => {
      setToastMessage("");
    }, 3000);
  }

  function handleRefresh() {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);

    window.setTimeout(() => {
      setIsRefreshing(false);

      showToast(
        "Dashboard data refreshed successfully.",
      );
    }, 1200);
  }

  function handleExport() {
    showToast(
      "Dashboard export is ready for backend integration.",
    );
  }

  return (
    <LoopShell
      title="Dashboard"
      subtitle="Monitor customer feedback, sentiment and AI-powered insights."
    >
      <div className="relative space-y-6">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed right-4 top-24 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-200 bg-white p-4 text-sm font-semibold text-slate-800 shadow-2xl sm:right-8">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              ✓
            </span>

            <span>{toastMessage}</span>
          </div>
        )}

        {/* Dashboard Controls */}
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-950">
              Analytics Overview
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Updated a few moments ago
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex rounded-xl bg-slate-100 p-1">
              {rangeOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() =>
                    setSelectedRange(option.key)
                  }
                  className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold transition sm:flex-none ${
                    selectedRange === option.key
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshIcon
                className={`h-4 w-4 ${
                  isRefreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              {isRefreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              <DownloadIcon />

              Export
            </button>
          </div>
        </section>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-6 text-white shadow-xl sm:p-8">
          <div className="absolute -left-24 top-4 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="absolute right-[28%] top-8 hidden h-28 w-28 rounded-full border border-white/10 lg:block" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  AI Customer Feedback Intelligence
                </span>

                <span className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
                  Live analysis
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-bold leading-tight sm:text-4xl">
                Turn every customer voice into
                actionable insight.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                LOOP analyses feedback, identifies
                sentiment, discovers trends and helps
                your team make confident decisions.
              </p>

              <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-2">
                  <CheckIcon />

                  Real-time sentiment
                </span>

                <span className="flex items-center gap-2">
                  <CheckIcon />

                  Theme detection
                </span>

                <span className="flex items-center gap-2">
                  <CheckIcon />

                  Evidence-backed answers
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-80 lg:grid-cols-1">
              <Link
                href="/ask-loop"
                className="group flex items-center justify-between rounded-2xl bg-white px-5 py-4 text-slate-950 shadow-lg transition hover:-translate-y-0.5"
              >
                <span>
                  <span className="block text-sm font-bold">
                    Ask LOOP
                  </span>

                  <span className="mt-1 block text-xs text-slate-500">
                    Explore customer insights
                  </span>
                </span>

                <ArrowIcon className="transition group-hover:translate-x-1" />
              </Link>

              <Link
                href="/reports"
                className="group flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white backdrop-blur transition hover:bg-white/15"
              >
                <span>
                  <span className="block text-sm font-bold">
                    View Reports
                  </span>

                  <span className="mt-1 block text-xs text-slate-300">
                    Review detailed analytics
                  </span>
                </span>

                <ArrowIcon className="transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Summary Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {currentSummary.map((card) => (
            <SummaryMetricCard
              key={card.title}
              card={card}
            />
          ))}
        </section>

        {/* Quick Actions */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                Quick Actions
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Access frequently used LOOP features.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${action.toneClass}`}
                >
                  <QuickActionIcon
                    name={action.icon}
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-slate-950">
                    {action.title}
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {action.description}
                  </span>
                </span>

                <ArrowIcon className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
              </Link>
            ))}
          </div>
        </section>

        {/* AI Insight */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 border-b border-slate-200 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <SparkIcon />
                </span>

                <div>
                  <h3 className="font-bold text-slate-950">
                    LOOP AI Insights
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Latest AI-generated analysis
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {insightOptions.map((item) => {
                const isActive =
                  selectedInsight === item.label;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() =>
                      setSelectedInsight(item.label)
                    }
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                      isActive
                        ? "bg-slate-950 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px]">
            <div
              className={`p-6 sm:p-8 ${getInsightBackground(
                activeInsight.tone,
              )}`}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Current Insight
                  </p>

                  <h4 className="mt-3 text-xl font-bold text-slate-950">
                    {activeInsight.title}
                  </h4>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {activeInsight.description}
                  </p>
                </div>

                <span
                  className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${getInsightBadge(
                    activeInsight.tone,
                  )}`}
                >
                  {activeInsight.badge}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-950 p-6 text-white lg:border-l lg:border-t-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
                Recommended Action
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                {activeInsight.recommendation}
              </p>

              <Link
                href="/ask-loop"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white"
              >
                Ask a follow-up question

                <ArrowIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Analytics */}
        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          {/* Activity Chart */}
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Feedback Activity
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Feedback volume across the selected
                  period.
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 px-4 py-2">
                <p className="text-xs font-semibold text-blue-600">
                  Total activity
                </p>

                <p className="mt-0.5 text-lg font-black text-blue-800">
                  {totalActivity.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-8 flex h-72 items-end gap-2 border-b border-slate-200 px-1 sm:gap-4">
              {currentActivity.map((item) => (
                <div
                  key={`${selectedRange}-${item.label}`}
                  className="group flex h-full flex-1 flex-col items-center justify-end"
                >
                  <div className="relative mb-2 hidden rounded-lg bg-slate-950 px-2 py-1 text-[10px] font-bold text-white group-hover:block sm:absolute">
                    {item.feedback}
                  </div>

                  <span className="mb-2 hidden text-xs font-bold text-slate-600 sm:block">
                    {item.feedback}
                  </span>

                  <div className="relative flex h-full w-full max-w-12 items-end overflow-hidden rounded-t-xl bg-slate-100">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-blue-700 via-blue-600 to-violet-500 transition-all duration-500 group-hover:opacity-80"
                      style={{
                        height: `${item.value}%`,
                      }}
                    />
                  </div>

                  <span className="mt-3 text-xs font-semibold text-slate-500">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </article>

          {/* Sentiment Donut */}
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                Sentiment Overview
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Overall customer sentiment distribution.
              </p>
            </div>

            <div className="mt-7 flex flex-col items-center">
              <div
                className="relative flex h-48 w-48 items-center justify-center rounded-full"
                style={{
                  background:
                    "conic-gradient(#10b981 0deg 219.6deg, #f59e0b 219.6deg 302.4deg, #f43f5e 302.4deg 360deg)",
                }}
              >
                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                  <span className="text-3xl font-black text-slate-950">
                    61%
                  </span>

                  <span className="mt-1 text-xs font-semibold text-slate-500">
                    Positive
                  </span>
                </div>
              </div>

              <div className="mt-7 w-full space-y-4">
                {sentimentData.map((sentiment) => (
                  <div key={sentiment.name}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${sentiment.dotClass}`}
                        />

                        <span
                          className={`text-sm font-bold ${sentiment.textClass}`}
                        >
                          {sentiment.name}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-slate-700">
                        {sentiment.value}% ·{" "}
                        {sentiment.count}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${sentiment.barClass}`}
                        style={{
                          width: `${sentiment.value}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>

        {/* Themes and Issues */}
        <section className="grid gap-6 xl:grid-cols-2">
          {/* Trending Themes */}
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Trending Themes
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Frequently discussed customer topics.
                </p>
              </div>

              <Link
                href="/reports"
                className="text-xs font-bold text-blue-700 hover:text-blue-900"
              >
                View analysis
              </Link>
            </div>

            <div className="mt-6 space-y-6">
              {themes.map((theme, index) => (
                <div key={theme.name}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600">
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {theme.name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {theme.mentions} mentions
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                      {theme.trend}
                    </span>
                  </div>

                  <div className="ml-11 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600"
                      style={{
                        width: `${theme.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Urgent Issues */}
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Urgent Issues
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Issues requiring team attention.
                </p>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-sm font-black text-rose-700">
                {urgentIssues.length}
              </span>
            </div>

            {urgentIssues.length > 0 ? (
              <div className="mt-5 space-y-4">
                {urgentIssues.map((issue) => (
                  <div
                    key={issue.title}
                    className="relative overflow-hidden rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <span
                      className={`absolute inset-y-0 left-0 w-1 ${issue.accentClass}`}
                    />

                    <div className="pl-2">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {issue.title}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {issue.description}
                          </p>
                        </div>

                        <span
                          className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${issue.statusClass}`}
                        >
                          {issue.status}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">
                        <span>
                          Owner: {issue.owner}
                        </span>

                        <span>
                          Due: {issue.due}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No urgent issues"
                description="Everything is running smoothly."
              />
            )}
          </article>
        </section>

        {/* Recent Feedback */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                Recent Feedback
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Latest customer messages and sentiment
                results.
              </p>
            </div>

            <Link
              href="/feedback"
              className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              View All Feedback

              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>

          {recentFeedback.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <TableHeading>
                        Customer
                      </TableHeading>

                      <TableHeading>
                        Feedback
                      </TableHeading>

                      <TableHeading>
                        Sentiment
                      </TableHeading>

                      <TableHeading>
                        Source
                      </TableHeading>

                      <TableHeading>
                        Time
                      </TableHeading>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {recentFeedback.map((item) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-xs font-bold text-white">
                              {item.initials}
                            </div>

                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                {item.customer}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                {item.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="max-w-md px-6 py-5 text-sm leading-6 text-slate-600">
                          {item.feedback}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${item.sentimentClass}`}
                          >
                            {item.sentiment}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm font-medium text-slate-600">
                          {item.source}
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-400">
                          {item.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-slate-100 lg:hidden">
                {recentFeedback.map((item) => (
                  <article
                    key={item.id}
                    className="p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-xs font-bold text-white">
                        {item.initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-900">
                              {item.customer}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {item.id} · {item.time}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${item.sentimentClass}`}
                          >
                            {item.sentiment}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {item.feedback}
                        </p>

                        <p className="mt-3 text-xs font-semibold text-slate-400">
                          Source: {item.source}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="No feedback available"
              description="New customer feedback will appear here."
            />
          )}
        </section>
      </div>
    </LoopShell>
  );
}

function SummaryMetricCard({
  card,
}: {
  card: SummaryCard;
}) {
  const toneClasses: Record<
    MetricTone,
    {
      icon: string;
      change: string;
      spark: string;
    }
  > = {
    blue: {
      icon: "bg-blue-100 text-blue-700",
      change: "text-blue-700",
      spark: "bg-blue-500",
    },
    emerald: {
      icon: "bg-emerald-100 text-emerald-700",
      change: "text-emerald-700",
      spark: "bg-emerald-500",
    },
    rose: {
      icon: "bg-rose-100 text-rose-700",
      change: "text-rose-700",
      spark: "bg-rose-500",
    },
    violet: {
      icon: "bg-violet-100 text-violet-700",
      change: "text-violet-700",
      spark: "bg-violet-500",
    },
  };

  const tone = toneClasses[card.tone];

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {card.title}
          </p>

          <p className="mt-3 text-3xl font-black text-slate-950">
            {card.value}
          </p>
        </div>

        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone.icon}`}
        >
          <MetricIcon tone={card.tone} />
        </span>
      </div>

      <div className="mt-5 flex h-10 items-end gap-1">
        {card.sparkline.map((value, index) => (
          <span
            key={`${card.title}-${index}`}
            className={`flex-1 rounded-t-sm opacity-20 transition group-hover:opacity-80 ${tone.spark}`}
            style={{
              height: `${value}%`,
            }}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={`flex items-center gap-1 text-xs font-bold ${tone.change}`}
        >
          <TrendIcon direction={card.trend} />

          {card.change}
        </span>

        <span className="text-xs text-slate-400">
          {card.description}
        </span>
      </div>
    </article>
  );
}

function MetricIcon({
  tone,
}: {
  tone: MetricTone;
}) {
  if (tone === "blue") {
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
          d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        />

        <path
          strokeLinecap="round"
          d="M7 9h10M7 13h7M7 17h4"
        />
      </svg>
    );
  }

  if (tone === "emerald") {
    return (
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
          r="9"
        />

        <path
          strokeLinecap="round"
          d="M8.5 10h.01M15.5 10h.01"
        />

        <path
          strokeLinecap="round"
          d="M8.5 15c1.8 1.6 5.2 1.6 7 0"
        />
      </svg>
    );
  }

  if (tone === "rose") {
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
          d="M12 3 2.8 19h18.4L12 3Z"
        />

        <path
          strokeLinecap="round"
          d="M12 9v4M12 16h.01"
        />
      </svg>
    );
  }

  return <SparkIcon />;
}

function QuickActionIcon({
  name,
}: {
  name: string;
}) {
  if (name === "message") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-6 w-6"
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

  if (name === "report") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 3h10l4 4v14H5V3Z"
        />

        <path
          strokeLinecap="round"
          d="M9 17v-4M13 17V9M17 17v-6"
        />
      </svg>
    );
  }

  return <SparkIcon />;
}

function SparkIcon() {
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
        d="m12 3 1.8 4.8L19 10l-5.2 2.2L12 17l-1.8-4.8L5 10l5.2-2.2L12 3Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"
      />
    </svg>
  );
}

function TrendIcon({
  direction,
}: {
  direction: "up" | "down";
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`h-3.5 w-3.5 ${
        direction === "down"
          ? "rotate-180"
          : ""
      }`}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 12 5-5 5 5"
      />
    </svg>
  );
}

function RefreshIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7v5h-5"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 17v-5h5"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.1 9a7 7 0 0 1 11.7-2L20 9M4 15l2.2 2a7 7 0 0 0 11.7-2"
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
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v12M7 10l5 5 5-5"
      />

      <path
        strokeLinecap="round"
        d="M5 21h14"
      />
    </svg>
  );
}

function ArrowIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14M14 7l5 5-5 5"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-3 w-3"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m5 10 3 3 7-7"
        />
      </svg>
    </span>
  );
}

function TableHeading({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 5h16v14H4z"
          />

          <path
            strokeLinecap="round"
            d="M8 9h8M8 13h5"
          />
        </svg>
      </span>

      <h4 className="mt-4 font-bold text-slate-950">
        {title}
      </h4>

      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

function getInsightBackground(
  tone: string,
) {
  if (tone === "emerald") {
    return "bg-gradient-to-br from-emerald-50 to-teal-50";
  }

  if (tone === "rose") {
    return "bg-gradient-to-br from-rose-50 to-orange-50";
  }

  if (tone === "amber") {
    return "bg-gradient-to-br from-amber-50 to-yellow-50";
  }

  return "bg-gradient-to-br from-blue-50 to-indigo-50";
}

function getInsightBadge(tone: string) {
  if (tone === "emerald") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (tone === "rose") {
    return "bg-rose-100 text-rose-700";
  }

  if (tone === "amber") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-blue-100 text-blue-700";
}