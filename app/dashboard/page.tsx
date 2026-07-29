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

type MetricTone =
  | "blue"
  | "emerald"
  | "rose"
  | "violet";

type IconName =
  | "feedback"
  | "positive"
  | "issue"
  | "ai"
  | "spark"
  | "report"
  | "message"
  | "health"
  | "clock"
  | "pin"
  | "plus"
  | "refresh"
  | "download"
  | "arrow"
  | "check";

type SummaryCard = {
  title: string;
  value: string;
  change: string;
  description: string;
  trend: "up" | "down";
  tone: MetricTone;
  icon: IconName;
  sparkline: number[];
};

type InsightTone =
  | "blue"
  | "emerald"
  | "rose"
  | "amber";

type Insight = {
  id: string;
  label: "All" | "Positive" | "Negative" | "Urgent";
  title: string;
  description: string;
  badge: string;
  recommendation: string;
  tone: InsightTone;
  metric: string;
  metricLabel: string;
  href: string;
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
      icon: "feedback",
      sparkline: [38, 52, 45, 68, 59, 75, 82],
    },
    {
      title: "Positive Feedback",
      value: "728",
      change: "+8.4%",
      description: "61% of total feedback",
      trend: "up",
      tone: "emerald",
      icon: "positive",
      sparkline: [42, 48, 54, 59, 63, 67, 74],
    },
    {
      title: "Open Issues",
      value: "38",
      change: "-4.2%",
      description: "Needs team attention",
      trend: "down",
      tone: "rose",
      icon: "issue",
      sparkline: [78, 72, 65, 61, 55, 48, 42],
    },
    {
      title: "AI Confidence",
      value: "94.2%",
      change: "+2.1%",
      description: "Analysis accuracy",
      trend: "up",
      tone: "violet",
      icon: "ai",
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
      icon: "feedback",
      sparkline: [44, 51, 57, 53, 66, 72, 85],
    },
    {
      title: "Positive Feedback",
      value: "3,021",
      change: "+11.2%",
      description: "62% of total feedback",
      trend: "up",
      tone: "emerald",
      icon: "positive",
      sparkline: [48, 52, 56, 61, 67, 72, 78],
    },
    {
      title: "Open Issues",
      value: "126",
      change: "-7.8%",
      description: "Needs team attention",
      trend: "down",
      tone: "rose",
      icon: "issue",
      sparkline: [83, 76, 69, 65, 58, 49, 43],
    },
    {
      title: "AI Confidence",
      value: "95.1%",
      change: "+3.4%",
      description: "Analysis accuracy",
      trend: "up",
      tone: "violet",
      icon: "ai",
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
      icon: "feedback",
      sparkline: [39, 47, 52, 61, 69, 77, 89],
    },
    {
      title: "Positive Feedback",
      value: "9,126",
      change: "+16.5%",
      description: "62% of total feedback",
      trend: "up",
      tone: "emerald",
      icon: "positive",
      sparkline: [45, 51, 58, 63, 68, 75, 84],
    },
    {
      title: "Open Issues",
      value: "354",
      change: "-10.3%",
      description: "Needs team attention",
      trend: "down",
      tone: "rose",
      icon: "issue",
      sparkline: [87, 80, 72, 64, 57, 48, 39],
    },
    {
      title: "AI Confidence",
      value: "96.4%",
      change: "+4.6%",
      description: "Analysis accuracy",
      trend: "up",
      tone: "violet",
      icon: "ai",
      sparkline: [68, 73, 79, 85, 89, 93, 97],
    },
  ],
};

const workspaceHealthData: Record<
  RangeKey,
  {
    score: number;
    status: string;
    description: string;
    positiveSentiment: number;
    issueResolution: number;
    aiCoverage: number;
    responseHealth: number;
    lastUpdated: string;
  }
> = {
  "7D": {
    score: 86,
    status: "Healthy",
    description:
      "Customer sentiment is stable and issue volume is moving in the right direction.",
    positiveSentiment: 88,
    issueResolution: 79,
    aiCoverage: 94,
    responseHealth: 83,
    lastUpdated: "2 minutes ago",
  },

  "30D": {
    score: 89,
    status: "Strong",
    description:
      "Feedback quality is improving with fewer unresolved customer issues.",
    positiveSentiment: 91,
    issueResolution: 84,
    aiCoverage: 95,
    responseHealth: 86,
    lastUpdated: "4 minutes ago",
  },

  "90D": {
    score: 92,
    status: "Excellent",
    description:
      "Customer experience, AI coverage and issue resolution are performing strongly.",
    positiveSentiment: 93,
    issueResolution: 88,
    aiCoverage: 96,
    responseHealth: 90,
    lastUpdated: "6 minutes ago",
  },
};

const comparisonData: Record<
  RangeKey,
  {
    feedbackChange: string;
    sentimentChange: string;
    issueChange: string;
    responseChange: string;
    currentLabel: string;
    previousLabel: string;
  }
> = {
  "7D": {
    feedbackChange: "+12.5%",
    sentimentChange: "+8.4%",
    issueChange: "-4.2%",
    responseChange: "+6.8%",
    currentLabel: "Current week",
    previousLabel: "Previous week",
  },

  "30D": {
    feedbackChange: "+18.7%",
    sentimentChange: "+11.2%",
    issueChange: "-7.8%",
    responseChange: "+9.5%",
    currentLabel: "Current 30 days",
    previousLabel: "Previous 30 days",
  },

  "90D": {
    feedbackChange: "+24.8%",
    sentimentChange: "+16.5%",
    issueChange: "-10.3%",
    responseChange: "+12.1%",
    currentLabel: "Current 90 days",
    previousLabel: "Previous 90 days",
  },
};

const insightOptions: Insight[] = [
  {
    id: "overall-experience",
    label: "All",
    title: "Overall Customer Experience",
    description:
      "Customer satisfaction is improving. Product quality and faster support responses are the strongest positive drivers.",
    badge: "Stable performance",
    recommendation:
      "Continue monitoring checkout speed while maintaining the current support response time.",
    tone: "blue",
    metric: "84/100",
    metricLabel: "Experience score",
    href: "/reports",
  },
  {
    id: "positive-momentum",
    label: "Positive",
    title: "Positive Feedback Momentum",
    description:
      "Customers appreciate the clean interface, reliable product quality and quick support response.",
    badge: "61% positive",
    recommendation:
      "Highlight product quality and responsive support in customer-facing communication.",
    tone: "emerald",
    metric: "+8.4%",
    metricLabel: "Positive momentum",
    href: "/feedback",
  },
  {
    id: "negative-risk",
    label: "Negative",
    title: "Negative Feedback Risk",
    description:
      "Most negative feedback is related to payment delays, application speed and checkout performance.",
    badge: "16% negative",
    recommendation:
      "Prioritise payment confirmation and checkout performance improvements.",
    tone: "rose",
    metric: "185",
    metricLabel: "Negative records",
    href: "/feedback",
  },
  {
    id: "urgent-action",
    label: "Urgent",
    title: "Urgent Issues Requiring Attention",
    description:
      "Checkout slowdown and delayed payment confirmations need immediate investigation.",
    badge: "3 urgent issues",
    recommendation:
      "Assign owners and resolution deadlines for the three urgent issues.",
    tone: "amber",
    metric: "3",
    metricLabel: "Urgent issues",
    href: "/feedback",
  },
];

const activityData: Record<
  RangeKey,
  {
    label: string;
    height: number;
    feedback: number;
  }[]
> = {
  "7D": [
    {
      label: "Mon",
      height: 48,
      feedback: 142,
    },
    {
      label: "Tue",
      height: 62,
      feedback: 183,
    },
    {
      label: "Wed",
      height: 54,
      feedback: 159,
    },
    {
      label: "Thu",
      height: 76,
      feedback: 224,
    },
    {
      label: "Fri",
      height: 68,
      feedback: 201,
    },
    {
      label: "Sat",
      height: 42,
      feedback: 124,
    },
    {
      label: "Sun",
      height: 52,
      feedback: 153,
    },
  ],

  "30D": [
    {
      label: "W1",
      height: 45,
      feedback: 642,
    },
    {
      label: "W2",
      height: 58,
      feedback: 821,
    },
    {
      label: "W3",
      height: 72,
      feedback: 1018,
    },
    {
      label: "W4",
      height: 84,
      feedback: 1186,
    },
    {
      label: "W5",
      height: 69,
      feedback: 978,
    },
    {
      label: "W6",
      height: 78,
      feedback: 1104,
    },
    {
      label: "Now",
      height: 88,
      feedback: 1248,
    },
  ],

  "90D": [
    {
      label: "Apr",
      height: 46,
      feedback: 3248,
    },
    {
      label: "May",
      height: 55,
      feedback: 3872,
    },
    {
      label: "Jun",
      height: 63,
      feedback: 4480,
    },
    {
      label: "Jul",
      height: 78,
      feedback: 5612,
    },
    {
      label: "Aug",
      height: 70,
      feedback: 4986,
    },
    {
      label: "Sep",
      height: 82,
      feedback: 5924,
    },
    {
      label: "Now",
      height: 91,
      feedback: 6480,
    },
  ],
};

const sentimentData = [
  {
    name: "Positive",
    percentage: 61,
    count: 728,
    barClass: "bg-emerald-500",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-700",
  },
  {
    name: "Neutral",
    percentage: 23,
    count: 273,
    barClass: "bg-amber-400",
    dotClass: "bg-amber-400",
    textClass: "text-amber-700",
  },
  {
    name: "Negative",
    percentage: 16,
    count: 185,
    barClass: "bg-rose-500",
    dotClass: "bg-rose-500",
    textClass: "text-rose-700",
  },
];

const trendingThemes = [
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
    initials: "AR",
    feedback:
      "The application is easy to use and the interface looks clean.",
    sentiment: "Positive",
    sentimentClass:
      "bg-emerald-100 text-emerald-700",
    source: "Web App",
    time: "10 min ago",
  },
  {
    id: "FB-1041",
    customer: "Rahul K",
    initials: "RK",
    feedback:
      "Payment confirmation took more time than expected.",
    sentiment: "Negative",
    sentimentClass:
      "bg-rose-100 text-rose-700",
    source: "Email",
    time: "34 min ago",
  },
  {
    id: "FB-1040",
    customer: "Meena S",
    initials: "MS",
    feedback:
      "Customer support solved my issue quickly.",
    sentiment: "Positive",
    sentimentClass:
      "bg-emerald-100 text-emerald-700",
    source: "Support",
    time: "1 hour ago",
  },
  {
    id: "FB-1039",
    customer: "Arun P",
    initials: "AP",
    feedback:
      "The dashboard is useful, but reports could load faster.",
    sentiment: "Neutral",
    sentimentClass:
      "bg-amber-100 text-amber-700",
    source: "Survey",
    time: "2 hours ago",
  },
];

const quickActions = [
  {
    title: "Ask LOOP",
    description:
      "Ask questions using customer feedback data.",
    href: "/ask-loop",
    icon: "spark" as IconName,
    className:
      "bg-violet-100 text-violet-700",
  },
  {
    title: "Review Feedback",
    description:
      "View and classify recent customer feedback.",
    href: "/feedback",
    icon: "message" as IconName,
    className: "bg-blue-100 text-blue-700",
  },
  {
    title: "Generate Report",
    description:
      "Open AI-powered feedback reports.",
    href: "/reports",
    icon: "report" as IconName,
    className:
      "bg-emerald-100 text-emerald-700",
  },
];

const pinnedInsightsStorageKey =
  "loop-dashboard-pinned-insights";

const defaultPinnedInsightIds = [
  "positive-momentum",
  "urgent-action",
];

export default function DashboardPage() {
  const [selectedRange, setSelectedRange] =
    useState<RangeKey>("7D");

  const [selectedInsight, setSelectedInsight] =
    useState<Insight["label"]>("All");

  const [pinnedInsightIds, setPinnedInsightIds] =
    useState<string[]>(defaultPinnedInsightIds);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [toastMessage, setToastMessage] =
    useState("");

  const currentSummary =
    summaryData[selectedRange];

  const currentHealth =
    workspaceHealthData[selectedRange];

  const currentComparison =
    comparisonData[selectedRange];

  const currentActivity =
    activityData[selectedRange];

  const activeInsight =
    insightOptions.find(
      (insight) =>
        insight.label === selectedInsight,
    ) ?? insightOptions[0];

  const pinnedInsights = useMemo(() => {
    return insightOptions.filter((insight) =>
      pinnedInsightIds.includes(insight.id),
    );
  }, [pinnedInsightIds]);

  const availableInsightToPin = useMemo(() => {
    return insightOptions.find(
      (insight) =>
        !pinnedInsightIds.includes(insight.id),
    );
  }, [pinnedInsightIds]);

  const activeInsightIsPinned =
    pinnedInsightIds.includes(activeInsight.id);

  const totalActivity = useMemo(() => {
    return currentActivity.reduce(
      (total, item) => total + item.feedback,
      0,
    );
  }, [currentActivity]);

  useEffect(() => {
    try {
      const savedValue =
        window.localStorage.getItem(
          pinnedInsightsStorageKey,
        );

      if (!savedValue) {
        return;
      }

      const parsedValue = JSON.parse(savedValue);

      if (!Array.isArray(parsedValue)) {
        return;
      }

      const validIds = parsedValue.filter(
        (value): value is string =>
          typeof value === "string" &&
          insightOptions.some(
            (insight) => insight.id === value,
          ),
      );

      setPinnedInsightIds(validIds);
    } catch {
      setPinnedInsightIds(
        defaultPinnedInsightIds,
      );
    }
  }, []);

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
    }, 1000);
  }

  function handleExport() {
    showToast(
      "Dashboard export is ready for backend integration.",
    );
  }

  function updatePinnedInsights(
    nextIds: string[],
  ) {
    setPinnedInsightIds(nextIds);

    try {
      window.localStorage.setItem(
        pinnedInsightsStorageKey,
        JSON.stringify(nextIds),
      );
    } catch {
      showToast(
        "Pinned insights were updated for this session.",
      );
    }
  }

  function togglePinnedInsight(
    insightId: string,
  ) {
    const insight = insightOptions.find(
      (item) => item.id === insightId,
    );

    if (!insight) {
      return;
    }

    const alreadyPinned =
      pinnedInsightIds.includes(insightId);

    const nextIds = alreadyPinned
      ? pinnedInsightIds.filter(
          (id) => id !== insightId,
        )
      : [...pinnedInsightIds, insightId];

    updatePinnedInsights(nextIds);

    showToast(
      alreadyPinned
        ? `${insight.title} removed from pinned insights.`
        : `${insight.title} pinned to your dashboard.`,
    );
  }

  function pinNextAvailableInsight() {
    if (!availableInsightToPin) {
      showToast(
        "All available insights are already pinned.",
      );
      return;
    }

    togglePinnedInsight(
      availableInsightToPin.id,
    );
  }

  return (
    <LoopShell
      title="Dashboard"
      subtitle="Monitor customer feedback, sentiment and AI-powered insights."
    >
      <div className="relative space-y-6">
        {toastMessage && (
          <div className="fixed right-4 top-24 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-200 bg-white p-4 text-sm font-semibold text-slate-800 shadow-2xl dark:border-emerald-800 dark:bg-slate-900 dark:text-slate-100 sm:right-8">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Icon name="check" />
            </span>

            <span>{toastMessage}</span>
          </div>
        )}

        {/* Controls */}
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-950 dark:text-white">
              Analytics Overview
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Frontend demonstration data · Updated
              recently
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {rangeOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() =>
                    setSelectedRange(option.key)
                  }
                  className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold transition sm:flex-none ${
                    selectedRange === option.key
                      ? "bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
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
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <span
                className={
                  isRefreshing
                    ? "animate-spin"
                    : ""
                }
              >
                <Icon name="refresh" />
              </span>

              {isRefreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              <Icon name="download" />

              Export
            </button>
          </div>
        </section>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-6 text-white shadow-xl sm:p-8">
          <div className="absolute -left-24 top-4 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
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
                teams make confident decisions.
              </p>

              <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                <HeroFeature label="Real-time sentiment" />

                <HeroFeature label="Theme detection" />

                <HeroFeature label="Evidence-backed answers" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-80 lg:grid-cols-1">
              <HeroLink
                href="/ask-loop"
                title="Ask LOOP"
                description="Explore customer insights"
                primary
              />

              <HeroLink
                href="/reports"
                title="View Reports"
                description="Review detailed analytics"
              />
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {currentSummary.map((card) => (
            <SummaryMetricCard
              key={card.title}
              card={card}
            />
          ))}
        </section>

        {/* Workspace Health + Pinned Insights */}
        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <WorkspaceHealthCard
            health={currentHealth}
            range={selectedRange}
          />

          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  <Icon name="pin" />
                </span>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                      Pinned Insights
                    </h3>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {pinnedInsights.length} pinned
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Keep important AI findings visible
                    for your team.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={pinNextAvailableInsight}
                disabled={!availableInsightToPin}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Icon name="plus" />

                {availableInsightToPin
                  ? "Pin another insight"
                  : "All insights pinned"}
              </button>
            </div>

            {pinnedInsights.length > 0 ? (
              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                {pinnedInsights.map((insight) => (
                  <PinnedInsightCard
                    key={insight.id}
                    insight={insight}
                    onRemove={() =>
                      togglePinnedInsight(insight.id)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <Icon name="pin" />
                </span>

                <h4 className="mt-4 font-bold text-slate-950 dark:text-white">
                  No pinned insights yet
                </h4>

                <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  Pin important AI insights to create
                  a focused workspace for your team.
                </p>

                <button
                  type="button"
                  onClick={pinNextAvailableInsight}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white"
                >
                  Pin first insight
                </button>
              </div>
            )}
          </article>
        </section>

        {/* Compare Performance */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                Performance Comparison
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
                {currentComparison.currentLabel} vs{" "}
                {currentComparison.previousLabel}
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Understand how customer experience is
                changing over time.
              </p>
            </div>

            <span className="w-fit rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Overall improvement
            </span>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
            <ComparisonCard
              title="Feedback Volume"
              value={currentComparison.feedbackChange}
              description="More customer responses"
              positive
            />

            <ComparisonCard
              title="Positive Sentiment"
              value={
                currentComparison.sentimentChange
              }
              description="Customer satisfaction"
              positive
            />

            <ComparisonCard
              title="Open Issues"
              value={currentComparison.issueChange}
              description="Fewer unresolved issues"
              positive
            />

            <ComparisonCard
              title="Response Health"
              value={currentComparison.responseChange}
              description="Faster team response"
              positive
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <SectionHeading
            title="Quick Actions"
            description="Access frequently used LOOP features."
          />

          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${action.className}`}
                >
                  <Icon name={action.icon} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-slate-950 dark:text-white">
                    {action.title}
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {action.description}
                  </span>
                </span>

                <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
                  <Icon name="arrow" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* AI Insights */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                <Icon name="spark" />
              </span>

              <div>
                <h3 className="font-bold text-slate-950 dark:text-white">
                  LOOP AI Insights
                </h3>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Latest AI-generated analysis
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {insightOptions.map((insight) => {
                const isActive =
                  selectedInsight === insight.label;

                return (
                  <button
                    key={insight.id}
                    type="button"
                    onClick={() =>
                      setSelectedInsight(
                        insight.label,
                      )
                    }
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                      isActive
                        ? "bg-slate-950 text-white dark:bg-blue-600"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {insight.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_330px]">
            <div
              className={`p-6 sm:p-8 ${getInsightBackground(
                activeInsight.tone,
              )}`}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Current Insight
                  </p>

                  <h4 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">
                    {activeInsight.title}
                  </h4>

                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {activeInsight.description}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${getInsightBadge(
                        activeInsight.tone,
                      )}`}
                    >
                      {activeInsight.badge}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        togglePinnedInsight(
                          activeInsight.id,
                        )
                      }
                      className="flex items-center gap-2 rounded-full border border-slate-300 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-white dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-200"
                    >
                      <Icon name="pin" />

                      {activeInsightIsPinned
                        ? "Remove from pinned"
                        : "Pin this insight"}
                    </button>
                  </div>
                </div>

                <div className="w-fit rounded-2xl bg-white/70 p-4 text-right shadow-sm dark:bg-slate-900/60">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {activeInsight.metricLabel}
                  </p>

                  <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                    {activeInsight.metric}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-6 text-white">
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

                <Icon name="arrow" />
              </Link>
            </div>
          </div>
        </section>

        {/* Activity and Sentiment */}
        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                  Feedback Activity
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Feedback volume across the selected
                  period.
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 px-4 py-2 dark:bg-blue-950">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-300">
                  Total activity
                </p>

                <p className="mt-0.5 text-lg font-black text-blue-800 dark:text-blue-200">
                  {totalActivity.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-8 flex h-72 items-end gap-2 border-b border-slate-200 px-1 dark:border-slate-700 sm:gap-4">
              {currentActivity.map((item) => (
                <div
                  key={`${selectedRange}-${item.label}`}
                  className="group flex h-full flex-1 flex-col items-center justify-end"
                >
                  <span className="mb-2 hidden text-xs font-bold text-slate-600 dark:text-slate-300 sm:block">
                    {item.feedback}
                  </span>

                  <div className="relative flex h-full w-full max-w-12 items-end overflow-hidden rounded-t-xl bg-slate-100 dark:bg-slate-800">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-blue-700 via-blue-600 to-violet-500 transition-all duration-500 group-hover:opacity-80"
                      style={{
                        height: `${item.height}%`,
                      }}
                    />
                  </div>

                  <span className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              Sentiment Overview
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Customer sentiment distribution.
            </p>

            <div className="mt-7 flex flex-col items-center">
              <div
                className="relative flex h-48 w-48 items-center justify-center rounded-full"
                style={{
                  background:
                    "conic-gradient(#10b981 0deg 219.6deg, #f59e0b 219.6deg 302.4deg, #f43f5e 302.4deg 360deg)",
                }}
              >
                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner dark:bg-slate-900">
                  <span className="text-3xl font-black text-slate-950 dark:text-white">
                    61%
                  </span>

                  <span className="mt-1 text-xs font-semibold text-slate-500">
                    Positive
                  </span>
                </div>
              </div>

              <div className="mt-7 w-full space-y-4">
                {sentimentData.map((item) => (
                  <div key={item.name}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${item.dotClass}`}
                        />

                        <span
                          className={`text-sm font-bold ${item.textClass}`}
                        >
                          {item.name}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {item.percentage}% ·{" "}
                        {item.count}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${item.barClass}`}
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>

        {/* Themes + Issues */}
        <section className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                  Trending Themes
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Frequently discussed customer
                  topics.
                </p>
              </div>

              <Link
                href="/reports"
                className="text-xs font-bold text-blue-700 dark:text-blue-300"
              >
                View analysis
              </Link>
            </div>

            <div className="mt-6 space-y-6">
              {trendingThemes.map(
                (theme, index) => (
                  <div key={theme.name}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {index + 1}
                        </span>

                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {theme.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {theme.mentions} mentions
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {theme.trend}
                      </span>
                    </div>

                    <div className="ml-11 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600"
                        style={{
                          width: `${theme.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                  Urgent Issues
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Issues requiring team attention.
                </p>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-sm font-black text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {urgentIssues.length}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {urgentIssues.map((issue) => (
                <div
                  key={issue.title}
                  className="relative overflow-hidden rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <span
                    className={`absolute inset-y-0 left-0 w-1 ${issue.accentClass}`}
                  />

                  <div className="pl-2">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {issue.title}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          {issue.description}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold ${issue.statusClass}`}
                      >
                        {issue.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <span>
                        Owner: {issue.owner}
                      </span>

                      <span>Due: {issue.due}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* Recent Feedback */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                Recent Feedback
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Latest customer messages and sentiment
                results.
              </p>
            </div>

            <Link
              href="/feedback"
              className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              View All Feedback

              <Icon name="arrow" />
            </Link>
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800">
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

                  <TableHeading>Time</TableHeading>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentFeedback.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          initials={item.initials}
                        />

                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">
                            {item.customer}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {item.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="max-w-md px-6 py-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item.feedback}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${item.sentimentClass}`}
                      >
                        {item.sentiment}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-slate-600 dark:text-slate-300">
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

          <div className="divide-y divide-slate-100 dark:divide-slate-800 lg:hidden">
            {recentFeedback.map((item) => (
              <article
                key={item.id}
                className="p-5"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    initials={item.initials}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
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

                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
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
        </section>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
          Dashboard metrics, workspace health and
          insights currently use frontend demonstration
          data. Permanent real-time values require
          backend API integration.
        </div>
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
      icon: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
      change: "text-blue-700 dark:text-blue-300",
      spark: "bg-blue-500",
    },
    emerald: {
      icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      change:
        "text-emerald-700 dark:text-emerald-300",
      spark: "bg-emerald-500",
    },
    rose: {
      icon: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
      change: "text-rose-700 dark:text-rose-300",
      spark: "bg-rose-500",
    },
    violet: {
      icon: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
      change:
        "text-violet-700 dark:text-violet-300",
      spark: "bg-violet-500",
    },
  };

  const tone = toneClasses[card.tone];

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {card.title}
          </p>

          <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
            {card.value}
          </p>
        </div>

        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone.icon}`}
        >
          <Icon name={card.icon} />
        </span>
      </div>

      <div className="mt-5 flex h-10 items-end gap-1">
        {card.sparkline.map((value, index) => (
          <span
            key={`${card.title}-${index}`}
            className={`flex-1 rounded-t-sm opacity-25 transition group-hover:opacity-80 ${tone.spark}`}
            style={{
              height: `${value}%`,
            }}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`text-xs font-bold ${tone.change}`}
        >
          {card.change}
        </span>

        <span className="text-xs text-slate-400">
          {card.description}
        </span>
      </div>
    </article>
  );
}

function WorkspaceHealthCard({
  health,
  range,
}: {
  health: (typeof workspaceHealthData)[RangeKey];
  range: RangeKey;
}) {
  const circumference = 2 * Math.PI * 52;

  const progress =
    (health.score / 100) * circumference;

  return (
    <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-6 text-white shadow-xl sm:p-7">
      <div className="absolute -left-16 top-10 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="absolute -right-16 bottom-0 h-52 w-52 rounded-full bg-violet-500/15 blur-3xl" />

      <div className="relative">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
                <Icon name="health" />
              </span>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                  Workspace Health
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  {health.status}
                </h3>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">
              {health.description}
            </p>
          </div>

          <div className="relative flex h-36 w-36 shrink-0 items-center justify-center self-center">
            <svg
              viewBox="0 0 120 120"
              className="h-36 w-36 -rotate-90"
              aria-hidden="true"
            >
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-white/10"
              />

              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="url(#health-gradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={
                  circumference - progress
                }
              />

              <defs>
                <linearGradient
                  id="health-gradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#34d399"
                  />

                  <stop
                    offset="100%"
                    stopColor="#60a5fa"
                  />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute text-center">
              <p className="text-3xl font-black">
                {health.score}
              </p>

              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                out of 100
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <HealthMetric
            label="Positive sentiment"
            value={health.positiveSentiment}
          />

          <HealthMetric
            label="Issue resolution"
            value={health.issueResolution}
          />

          <HealthMetric
            label="AI coverage"
            value={health.aiCoverage}
          />

          <HealthMetric
            label="Response health"
            value={health.responseHealth}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <Icon name="clock" />

            Updated {health.lastUpdated}
          </span>

          <span className="rounded-full bg-white/10 px-3 py-1.5 font-bold text-slate-200">
            {range} analysis
          </span>
        </div>
      </div>
    </article>
  );
}

function HealthMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-300">
          {label}
        </p>

        <p className="text-sm font-black text-white">
          {value}%
        </p>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-400"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}

function PinnedInsightCard({
  insight,
  onRemove,
}: {
  insight: Insight;
  onRemove: () => void;
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${getPinnedInsightStyle(
        insight.tone,
      )}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-slate-700 shadow-sm dark:bg-slate-900/60 dark:text-slate-200">
          <Icon name="spark" />
        </span>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${insight.title}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/70 text-slate-500 shadow-sm transition hover:text-rose-600 dark:bg-slate-900/60"
        >
          ×
        </button>
      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        {insight.metricLabel}
      </p>

      <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
        {insight.metric}
      </p>

      <h4 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
        {insight.title}
      </h4>

      <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
        {insight.description}
      </p>

      <Link
        href={insight.href}
        className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-slate-800 transition group-hover:text-blue-700 dark:text-slate-200 dark:group-hover:text-blue-300"
      >
        View related data

        <Icon name="arrow" />
      </Link>
    </article>
  );
}

function ComparisonCard({
  title,
  value,
  description,
  positive,
}: {
  title: string;
  value: string;
  description: string;
  positive: boolean;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {title}
        </p>

        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            positive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          ↗
        </span>
      </div>

      <p className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </article>
  );
}

function HeroFeature({
  label,
}: {
  label: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
        <Icon name="check" />
      </span>

      {label}
    </span>
  );
}

function HeroLink({
  href,
  title,
  description,
  primary = false,
}: {
  href: string;
  title: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center justify-between rounded-2xl px-5 py-4 shadow-lg transition hover:-translate-y-0.5 ${
        primary
          ? "bg-white text-slate-950"
          : "border border-white/20 bg-white/10 text-white"
      }`}
    >
      <span>
        <span className="block text-sm font-bold">
          {title}
        </span>

        <span
          className={`mt-1 block text-xs ${
            primary
              ? "text-slate-500"
              : "text-slate-300"
          }`}
        >
          {description}
        </span>
      </span>

      <span className="transition group-hover:translate-x-1">
        <Icon name="arrow" />
      </span>
    </Link>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold text-slate-950 dark:text-white">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function Avatar({
  initials,
}: {
  initials: string;
}) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-xs font-bold text-white">
      {initials}
    </div>
  );
}

function TableHeading({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {children}
    </th>
  );
}

function Icon({
  name,
}: {
  name: IconName;
}) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    className: "h-5 w-5",
    "aria-hidden": true,
  };

  if (name === "positive") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="9" />

        <path
          strokeLinecap="round"
          d="M8.5 10h.01M15.5 10h.01M8.5 15c1.8 1.6 5.2 1.6 7 0"
        />
      </svg>
    );
  }

  if (name === "issue") {
    return (
      <svg {...commonProps}>
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

  if (name === "ai" || name === "spark") {
    return (
      <svg {...commonProps}>
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

  if (name === "message" || name === "feedback") {
    return (
      <svg {...commonProps}>
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
      <svg {...commonProps}>
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

  if (name === "health") {
    return (
      <svg {...commonProps}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h2l1-2 2 5 1-3h2"
        />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="9" />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 7v5l3 2"
        />
      </svg>
    );
  }

  if (name === "pin") {
    return (
      <svg {...commonProps}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m8 3 8 8M14 3l7 7-4 1-4 4-1 4-7-7 4-1 4-4 1-4ZM8 16l-5 5"
        />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg {...commonProps}>
        <path
          strokeLinecap="round"
          d="M12 5v14M5 12h14"
        />
      </svg>
    );
  }

  if (name === "refresh") {
    return (
      <svg {...commonProps}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7v5h-5M4 17v-5h5M6.1 9a7 7 0 0 1 11.7-2L20 9M4 15l2.2 2a7 7 0 0 0 11.7-2"
        />
      </svg>
    );
  }

  if (name === "download") {
    return (
      <svg {...commonProps}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v12M7 10l5 5 5-5M5 21h14"
        />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg {...commonProps}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 12h14M14 7l5 5-5 5"
        />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg
        {...commonProps}
        className="h-3.5 w-3.5"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m5 12 4 4L19 6"
        />
      </svg>
    );
  }

  return null;
}

function getPinnedInsightStyle(
  tone: InsightTone,
) {
  if (tone === "emerald") {
    return "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-900 dark:from-emerald-950 dark:to-teal-950";
  }

  if (tone === "rose") {
    return "border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50 dark:border-rose-900 dark:from-rose-950 dark:to-orange-950";
  }

  if (tone === "amber") {
    return "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950";
  }

  return "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-900 dark:from-blue-950 dark:to-indigo-950";
}

function getInsightBackground(
  tone: InsightTone,
) {
  if (tone === "emerald") {
    return "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950";
  }

  if (tone === "rose") {
    return "bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950 dark:to-orange-950";
  }

  if (tone === "amber") {
    return "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950";
  }

  return "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950";
}

function getInsightBadge(
  tone: InsightTone,
) {
  if (tone === "emerald") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200";
  }

  if (tone === "rose") {
    return "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200";
  }

  if (tone === "amber") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200";
  }

  return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200";
}