"use client";

import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import LoopShell from "../../components/LoopShell";

type ReportPeriod =
  | "Last 7 Days"
  | "Last 30 Days"
  | "Last 3 Months";

type ReportType =
  | "Executive Summary"
  | "Sentiment Analysis"
  | "Theme Analysis"
  | "Customer Experience";

type MetricTone =
  | "blue"
  | "emerald"
  | "rose"
  | "violet";

type SentimentItem = {
  name: "Positive" | "Neutral" | "Negative";
  value: number;
  count: number;
  barClass: string;
  textClass: string;
  backgroundClass: string;
  dotClass: string;
};

type ThemeItem = {
  name: string;
  mentions: number;
  percentage: number;
  trend: string;
  status: "Growing" | "Stable" | "Declining";
};

type Recommendation = {
  priority: "High" | "Medium" | "Low";
  title: string;
  description: string;
  impact: string;
  owner: string;
  timeline: string;
};

type ReportDataset = {
  totalFeedback: number;
  positiveChange: string;
  negativeChange: string;
  activeThemes: number;
  emergingThemes: number;
  aiConfidence: number;
  sentiment: SentimentItem[];
  themes: ThemeItem[];
  recommendations: Recommendation[];
  weeklyTrend: {
    label: string;
    value: number;
    feedback: number;
  }[];
};

type ToastMessage = {
  type: "success" | "error" | "info";
  message: string;
};

const reportPeriods: ReportPeriod[] = [
  "Last 7 Days",
  "Last 30 Days",
  "Last 3 Months",
];

const reportTypes: ReportType[] = [
  "Executive Summary",
  "Sentiment Analysis",
  "Theme Analysis",
  "Customer Experience",
];

const reportData: Record<
  ReportPeriod,
  ReportDataset
> = {
  "Last 7 Days": {
    totalFeedback: 1186,
    positiveChange: "+7.8%",
    negativeChange: "-1.9%",
    activeThemes: 9,
    emergingThemes: 2,
    aiConfidence: 93,
    sentiment: [
      {
        name: "Positive",
        value: 61,
        count: 724,
        barClass: "bg-emerald-500",
        textClass: "text-emerald-700",
        backgroundClass: "bg-emerald-50",
        dotClass: "bg-emerald-500",
      },
      {
        name: "Neutral",
        value: 24,
        count: 285,
        barClass: "bg-amber-500",
        textClass: "text-amber-700",
        backgroundClass: "bg-amber-50",
        dotClass: "bg-amber-500",
      },
      {
        name: "Negative",
        value: 15,
        count: 177,
        barClass: "bg-rose-500",
        textClass: "text-rose-700",
        backgroundClass: "bg-rose-50",
        dotClass: "bg-rose-500",
      },
    ],
    themes: [
      {
        name: "User Experience",
        mentions: 318,
        percentage: 88,
        trend: "+10%",
        status: "Growing",
      },
      {
        name: "Payment Confirmation",
        mentions: 276,
        percentage: 76,
        trend: "+17%",
        status: "Growing",
      },
      {
        name: "Application Speed",
        mentions: 206,
        percentage: 59,
        trend: "+8%",
        status: "Growing",
      },
      {
        name: "Customer Support",
        mentions: 164,
        percentage: 46,
        trend: "+4%",
        status: "Stable",
      },
      {
        name: "Onboarding",
        mentions: 118,
        percentage: 34,
        trend: "-2%",
        status: "Declining",
      },
    ],
    recommendations: [
      {
        priority: "High",
        title: "Improve checkout performance",
        description:
          "Customers report slow checkout performance when multiple products are added.",
        impact: "Reduce checkout abandonment",
        owner: "Engineering",
        timeline: "1–2 weeks",
      },
      {
        priority: "High",
        title: "Add real-time payment status",
        description:
          "Customers need clearer confirmation while payment transactions are processing.",
        impact: "Improve customer trust",
        owner: "Payments Team",
        timeline: "1 week",
      },
      {
        priority: "Medium",
        title: "Simplify onboarding",
        description:
          "New users feel that the initial product walkthrough contains too many steps.",
        impact: "Improve activation rate",
        owner: "Product Team",
        timeline: "2–3 weeks",
      },
      {
        priority: "Low",
        title: "Expand support knowledge base",
        description:
          "Common account questions can be converted into self-service help articles.",
        impact: "Reduce support tickets",
        owner: "Support Team",
        timeline: "1 month",
      },
    ],
    weeklyTrend: [
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
  },

  "Last 30 Days": {
    totalFeedback: 4892,
    positiveChange: "+14.8%",
    negativeChange: "-2.4%",
    activeThemes: 12,
    emergingThemes: 3,
    aiConfidence: 94,
    sentiment: [
      {
        name: "Positive",
        value: 62,
        count: 3033,
        barClass: "bg-emerald-500",
        textClass: "text-emerald-700",
        backgroundClass: "bg-emerald-50",
        dotClass: "bg-emerald-500",
      },
      {
        name: "Neutral",
        value: 23,
        count: 1125,
        barClass: "bg-amber-500",
        textClass: "text-amber-700",
        backgroundClass: "bg-amber-50",
        dotClass: "bg-amber-500",
      },
      {
        name: "Negative",
        value: 15,
        count: 734,
        barClass: "bg-rose-500",
        textClass: "text-rose-700",
        backgroundClass: "bg-rose-50",
        dotClass: "bg-rose-500",
      },
    ],
    themes: [
      {
        name: "User Experience",
        mentions: 1342,
        percentage: 88,
        trend: "+12%",
        status: "Growing",
      },
      {
        name: "Payment Confirmation",
        mentions: 1086,
        percentage: 74,
        trend: "+18%",
        status: "Growing",
      },
      {
        name: "Application Speed",
        mentions: 814,
        percentage: 58,
        trend: "+9%",
        status: "Growing",
      },
      {
        name: "Customer Support",
        mentions: 676,
        percentage: 46,
        trend: "+6%",
        status: "Stable",
      },
      {
        name: "Onboarding",
        mentions: 529,
        percentage: 34,
        trend: "-3%",
        status: "Declining",
      },
    ],
    recommendations: [
      {
        priority: "High",
        title: "Improve checkout performance",
        description:
          "Customers report slow checkout performance when multiple products are added.",
        impact: "Reduce checkout abandonment",
        owner: "Engineering",
        timeline: "1–2 weeks",
      },
      {
        priority: "High",
        title: "Add real-time payment status",
        description:
          "Customers need clearer confirmation while payment transactions are processing.",
        impact: "Improve customer trust",
        owner: "Payments Team",
        timeline: "1 week",
      },
      {
        priority: "Medium",
        title: "Simplify onboarding",
        description:
          "New users feel that the initial product walkthrough contains too many steps.",
        impact: "Improve activation rate",
        owner: "Product Team",
        timeline: "2–3 weeks",
      },
      {
        priority: "Low",
        title: "Expand support knowledge base",
        description:
          "Common account questions can be converted into self-service help articles.",
        impact: "Reduce support tickets",
        owner: "Support Team",
        timeline: "1 month",
      },
    ],
    weeklyTrend: [
      {
        label: "W1",
        value: 54,
        feedback: 842,
      },
      {
        label: "W2",
        value: 66,
        feedback: 1024,
      },
      {
        label: "W3",
        value: 78,
        feedback: 1216,
      },
      {
        label: "W4",
        value: 88,
        feedback: 1368,
      },
      {
        label: "Now",
        value: 72,
        feedback: 1104,
      },
    ],
  },

  "Last 3 Months": {
    totalFeedback: 14648,
    positiveChange: "+24.6%",
    negativeChange: "-5.1%",
    activeThemes: 18,
    emergingThemes: 5,
    aiConfidence: 96,
    sentiment: [
      {
        name: "Positive",
        value: 64,
        count: 9375,
        barClass: "bg-emerald-500",
        textClass: "text-emerald-700",
        backgroundClass: "bg-emerald-50",
        dotClass: "bg-emerald-500",
      },
      {
        name: "Neutral",
        value: 22,
        count: 3223,
        barClass: "bg-amber-500",
        textClass: "text-amber-700",
        backgroundClass: "bg-amber-50",
        dotClass: "bg-amber-500",
      },
      {
        name: "Negative",
        value: 14,
        count: 2050,
        barClass: "bg-rose-500",
        textClass: "text-rose-700",
        backgroundClass: "bg-rose-50",
        dotClass: "bg-rose-500",
      },
    ],
    themes: [
      {
        name: "User Experience",
        mentions: 4026,
        percentage: 91,
        trend: "+21%",
        status: "Growing",
      },
      {
        name: "Payment Confirmation",
        mentions: 3258,
        percentage: 78,
        trend: "+24%",
        status: "Growing",
      },
      {
        name: "Application Speed",
        mentions: 2442,
        percentage: 63,
        trend: "+14%",
        status: "Growing",
      },
      {
        name: "Customer Support",
        mentions: 2028,
        percentage: 51,
        trend: "+11%",
        status: "Growing",
      },
      {
        name: "Onboarding",
        mentions: 1587,
        percentage: 39,
        trend: "-1%",
        status: "Stable",
      },
    ],
    recommendations: [
      {
        priority: "High",
        title: "Improve checkout infrastructure",
        description:
          "Long-term feedback patterns show repeated checkout performance concerns.",
        impact: "Improve conversion and retention",
        owner: "Engineering",
        timeline: "1 month",
      },
      {
        priority: "High",
        title: "Create transaction status tracking",
        description:
          "Customers need a consistent real-time view of payment progress.",
        impact: "Reduce payment-related complaints",
        owner: "Payments Team",
        timeline: "2–3 weeks",
      },
      {
        priority: "Medium",
        title: "Redesign first-time onboarding",
        description:
          "Progressive onboarding can reduce confusion and improve early product adoption.",
        impact: "Increase successful activation",
        owner: "Product Team",
        timeline: "1 month",
      },
      {
        priority: "Low",
        title: "Automate common support answers",
        description:
          "Use recurring feedback themes to improve self-service support content.",
        impact: "Reduce repetitive support workload",
        owner: "Support Team",
        timeline: "4–6 weeks",
      },
    ],
    weeklyTrend: [
      {
        label: "May",
        value: 58,
        feedback: 3824,
      },
      {
        label: "Jun",
        value: 74,
        feedback: 4868,
      },
      {
        label: "Jul",
        value: 89,
        feedback: 5956,
      },
    ],
  },
};

export default function ReportsPage() {
  const [period, setPeriod] =
    useState<ReportPeriod>("Last 30 Days");

  const [reportType, setReportType] =
    useState<ReportType>("Executive Summary");

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [isGenerated, setIsGenerated] =
    useState(false);

  const [generatedAt, setGeneratedAt] =
    useState<Date | null>(null);

  const [toastMessage, setToastMessage] =
    useState<ToastMessage | null>(null);

  const currentReport = reportData[period];

  const positiveSentiment =
    currentReport.sentiment.find(
      (item) => item.name === "Positive",
    )?.value ?? 0;

  const negativeSentiment =
    currentReport.sentiment.find(
      (item) => item.name === "Negative",
    )?.value ?? 0;

  const reportScore = useMemo(() => {
    return Math.round(
      positiveSentiment * 0.7 +
        currentReport.aiConfidence * 0.3,
    );
  }, [
    positiveSentiment,
    currentReport.aiConfidence,
  ]);

  function showToast(
    type: ToastMessage["type"],
    message: string,
  ) {
    setToastMessage({
      type,
      message,
    });

    window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }

  function handlePeriodChange(
    newPeriod: ReportPeriod,
  ) {
    setPeriod(newPeriod);
    setIsGenerated(false);
    setGeneratedAt(null);
  }

  function handleReportTypeChange(
    newType: ReportType,
  ) {
    setReportType(newType);
    setIsGenerated(false);
    setGeneratedAt(null);
  }

  function generateReport() {
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);
    setIsGenerated(false);

    window.setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
      setGeneratedAt(new Date());

      showToast(
        "success",
        `${reportType} generated successfully.`,
      );
    }, 1200);
  }

  function createReportText() {
    const themesText = currentReport.themes
      .map(
        (theme, index) =>
          `${index + 1}. ${theme.name} - ${
            theme.mentions
          } mentions (${theme.trend})`,
      )
      .join("\n");

    const recommendationsText =
      currentReport.recommendations
        .map(
          (item, index) =>
            `${index + 1}. [${item.priority}] ${
              item.title
            }\n   ${item.description}\n   Expected impact: ${
              item.impact
            }\n   Owner: ${
              item.owner
            }\n   Timeline: ${item.timeline}`,
        )
        .join("\n\n");

    return `
PROJECT LOOP - CUSTOMER FEEDBACK REPORT

Report Type: ${reportType}
Report Period: ${period}
Generated At: ${
      generatedAt
        ? generatedAt.toLocaleString("en-IN")
        : new Date().toLocaleString("en-IN")
    }

EXECUTIVE SUMMARY
Total Feedback: ${currentReport.totalFeedback.toLocaleString()}
Positive Sentiment: ${positiveSentiment}%
Neutral Sentiment: ${
      currentReport.sentiment.find(
        (item) => item.name === "Neutral",
      )?.value ?? 0
    }%
Negative Sentiment: ${negativeSentiment}%
Active Themes: ${currentReport.activeThemes}
Emerging Themes: ${currentReport.emergingThemes}
AI Confidence: ${currentReport.aiConfidence}%
Customer Experience Score: ${reportScore}/100

TOP THEMES
${themesText}

KEY RECOMMENDATIONS
${recommendationsText}

This report was generated using the Project LOOP frontend reporting interface.
Live backend and AI-generated report content can be integrated later.
`.trim();
  }

  function downloadBlob(
    content: string,
    fileName: string,
    mimeType: string,
  ) {
    const blob = new Blob([content], {
      type: mimeType,
    });

    const url = URL.createObjectURL(blob);
    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download = fileName;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  function downloadTextReport() {
    downloadBlob(
      createReportText(),
      "project-loop-feedback-report.txt",
      "text/plain;charset=utf-8",
    );

    showToast(
      "success",
      "Text report downloaded successfully.",
    );
  }

  function downloadCsvReport() {
    const header =
      "Theme,Mentions,Percentage,Trend,Status";

    const themeRows = currentReport.themes.map(
      (theme) =>
        [
          `"${theme.name}"`,
          theme.mentions,
          theme.percentage,
          `"${theme.trend}"`,
          `"${theme.status}"`,
        ].join(","),
    );

    const csvContent = [
      header,
      ...themeRows,
    ].join("\n");

    downloadBlob(
      csvContent,
      "project-loop-theme-report.csv",
      "text/csv;charset=utf-8",
    );

    showToast(
      "success",
      "CSV report downloaded successfully.",
    );
  }

  function printReport() {
    window.print();

    showToast(
      "info",
      "Print preview opened.",
    );
  }

  return (
    <LoopShell
      title="Reports"
      subtitle="Generate and explore customer-feedback reports."
    >
      <div className="relative space-y-7">
        {/* Toast */}
        {toastMessage && (
          <div
            className={`fixed right-4 top-24 z-[90] flex max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl sm:right-8 ${
              toastMessage.type === "success"
                ? "border-emerald-200"
                : toastMessage.type === "error"
                  ? "border-rose-200"
                  : "border-blue-200"
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold ${
                toastMessage.type === "success"
                  ? "bg-emerald-100 text-emerald-700"
                  : toastMessage.type === "error"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {toastMessage.type === "success"
                ? "✓"
                : toastMessage.type === "error"
                  ? "!"
                  : "i"}
            </span>

            <div>
              <p className="text-sm font-bold text-slate-950">
                {toastMessage.type === "success"
                  ? "Success"
                  : toastMessage.type === "error"
                    ? "Something went wrong"
                    : "Information"}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                {toastMessage.message}
              </p>
            </div>
          </div>
        )}

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 p-6 text-white shadow-xl sm:p-8">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="absolute right-[30%] top-10 hidden h-32 w-32 rounded-full border border-white/10 lg:block" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  Feedback Reporting Centre
                </span>

                <span className="rounded-full bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-200">
                  AI-powered analysis
                </span>
              </div>

              <h1 className="mt-5 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
                Transform customer feedback into
                clear business reports.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Monitor sentiment, discover emerging
                themes and identify actions that can
                improve the customer experience.
              </p>

              <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-blue-100">
                <HeroFeature>
                  Sentiment reports
                </HeroFeature>

                <HeroFeature>
                  Theme intelligence
                </HeroFeature>

                <HeroFeature>
                  Action recommendations
                </HeroFeature>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[340px] lg:grid-cols-1">
              <button
                type="button"
                onClick={generateReport}
                disabled={isGenerating}
                className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 text-left text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>
                  <span className="block text-sm font-bold">
                    {isGenerating
                      ? "Generating Report"
                      : "Generate Report"}
                  </span>

                  <span className="mt-1 block text-xs text-slate-500">
                    {reportType}
                  </span>
                </span>

                {isGenerating ? (
                  <LoadingSpinner />
                ) : (
                  <SparkIcon />
                )}
              </button>

              <button
                type="button"
                onClick={printReport}
                className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-left text-white backdrop-blur transition hover:bg-white/20"
              >
                <span>
                  <span className="block text-sm font-bold">
                    Print Report
                  </span>

                  <span className="mt-1 block text-xs text-slate-300">
                    Open print preview
                  </span>
                </span>

                <PrintIcon />
              </button>
            </div>
          </div>
        </section>

        {/* Report Settings */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-violet-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Report Configuration
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select the report format and analysis
                period.
              </p>
            </div>

            <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
              Frontend demo data
            </span>
          </div>

          <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1fr_1fr_auto] xl:items-end">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Report type
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                {reportTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      handleReportTypeChange(type)
                    }
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                      reportType === type
                        ? "border-blue-600 bg-blue-50 text-blue-700 ring-4 ring-blue-100"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Analysis period
              </label>

              <div className="grid gap-2 sm:grid-cols-3">
                {reportPeriods.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      handlePeriodChange(option)
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                      period === option
                        ? "border-violet-600 bg-violet-50 text-violet-700 ring-4 ring-violet-100"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={generateReport}
              disabled={isGenerating}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner />
                  Generating…
                </>
              ) : (
                <>
                  <SparkIcon />
                  Generate
                </>
              )}
            </button>
          </div>
        </section>

        {/* Generated Status */}
        {isGenerated && (
          <section className="flex flex-col gap-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckIcon />
              </span>

              <div>
                <p className="font-bold text-emerald-900">
                  Report generated successfully
                </p>

                <p className="mt-1 text-sm text-emerald-700">
                  {reportType} for {period} is ready.
                  {generatedAt &&
                    ` Generated at ${generatedAt.toLocaleTimeString(
                      "en-IN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}.`}
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={downloadTextReport}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-emerald-700"
              >
                <DownloadIcon />
                Text Report
              </button>

              <button
                type="button"
                onClick={downloadCsvReport}
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
              >
                <TableIcon />
                CSV Export
              </button>

              <button
                type="button"
                onClick={printReport}
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
              >
                <PrintIcon />
                Print
              </button>
            </div>
          </section>
        )}

        {/* KPI Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Feedback"
            value={currentReport.totalFeedback.toLocaleString()}
            detail={`${currentReport.positiveChange} from previous period`}
            tone="blue"
            icon={<FeedbackIcon />}
          />

          <MetricCard
            label="Positive Sentiment"
            value={`${positiveSentiment}%`}
            detail={`${currentReport.positiveChange} customer satisfaction`}
            tone="emerald"
            icon={<PositiveIcon />}
          />

          <MetricCard
            label="Negative Sentiment"
            value={`${negativeSentiment}%`}
            detail={`${currentReport.negativeChange} from previous period`}
            tone="rose"
            icon={<WarningIcon />}
          />

          <MetricCard
            label="Active Themes"
            value={currentReport.activeThemes.toString()}
            detail={`${currentReport.emergingThemes} emerging themes found`}
            tone="violet"
            icon={<ThemeIcon />}
          />
        </section>

        {/* Report Score */}
        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Feedback Volume Trend
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Customer feedback activity during{" "}
                  {period.toLowerCase()}.
                </p>
              </div>

              <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                {currentReport.totalFeedback.toLocaleString()}{" "}
                responses
              </span>
            </div>

            <div className="mt-8 flex h-72 items-end gap-3 border-b border-slate-200 px-2">
              {currentReport.weeklyTrend.map(
                (item) => (
                  <div
                    key={`${period}-${item.label}`}
                    className="group flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <span className="mb-2 hidden text-xs font-bold text-slate-600 sm:block">
                      {item.feedback.toLocaleString()}
                    </span>

                    <div className="relative flex h-full w-full max-w-16 items-end overflow-hidden rounded-t-2xl bg-slate-100">
                      <div
                        title={`${item.feedback} feedback`}
                        className="w-full rounded-t-2xl bg-gradient-to-t from-blue-700 via-blue-600 to-violet-500 transition-all duration-500 group-hover:opacity-80"
                        style={{
                          height: `${item.value}%`,
                        }}
                      />
                    </div>

                    <span className="mt-3 text-xs font-bold text-slate-500">
                      {item.label}
                    </span>
                  </div>
                ),
              )}
            </div>
          </article>

          <article className="rounded-3xl bg-gradient-to-br from-slate-950 to-indigo-950 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
                  Customer Experience
                </p>

                <h2 className="mt-2 text-lg font-bold">
                  Report Health Score
                </h2>
              </div>

              <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                AI Score
              </span>
            </div>

            <div className="mt-7 flex items-center justify-center">
              <div
                className="relative flex h-48 w-48 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#60a5fa 0deg ${
                    reportScore * 3.6
                  }deg, rgba(255,255,255,0.1) ${
                    reportScore * 3.6
                  }deg 360deg)`,
                }}
              >
                <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-slate-950">
                  <span className="text-4xl font-black">
                    {reportScore}
                  </span>

                  <span className="mt-1 text-xs font-semibold text-slate-400">
                    out of 100
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              <ScoreRow
                label="Positive sentiment"
                value={`${positiveSentiment}%`}
              />

              <ScoreRow
                label="AI confidence"
                value={`${currentReport.aiConfidence}%`}
              />

              <ScoreRow
                label="Theme coverage"
                value={`${currentReport.activeThemes} themes`}
              />
            </div>
          </article>
        </section>

        {/* Sentiment and Summary */}
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Sentiment Analysis
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Customer sentiment distribution for{" "}
                  {period.toLowerCase()}.
                </p>
              </div>

              <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                {currentReport.aiConfidence}% confidence
              </span>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr] lg:items-center">
              <div className="flex justify-center">
                <div
                  className="relative flex h-56 w-56 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(
                      #10b981 0deg ${
                        positiveSentiment * 3.6
                      }deg,
                      #f59e0b ${
                        positiveSentiment * 3.6
                      }deg ${
                        (positiveSentiment +
                          (currentReport.sentiment.find(
                            (item) =>
                              item.name === "Neutral",
                          )?.value ?? 0)) *
                        3.6
                      }deg,
                      #f43f5e ${
                        (positiveSentiment +
                          (currentReport.sentiment.find(
                            (item) =>
                              item.name === "Neutral",
                          )?.value ?? 0)) *
                        3.6
                      }deg 360deg
                    )`,
                  }}
                >
                  <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                    <span className="text-4xl font-black text-slate-950">
                      {positiveSentiment}%
                    </span>

                    <span className="mt-1 text-xs font-semibold text-slate-500">
                      Positive
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {currentReport.sentiment.map(
                  (item) => (
                    <div key={item.name}>
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-3 w-3 rounded-full ${item.dotClass}`}
                          />

                          <div>
                            <p
                              className={`text-sm font-bold ${item.textClass}`}
                            >
                              {item.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {item.count.toLocaleString()}{" "}
                              responses
                            </p>
                          </div>
                        </div>

                        <span className="text-sm font-black text-slate-800">
                          {item.value}%
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${item.barClass}`}
                          style={{
                            width: `${item.value}%`,
                          }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3">
              <HighlightCard
                label="Strongest Area"
                value="User Experience"
                tone="emerald"
              />

              <HighlightCard
                label="Urgent Issue"
                value="Checkout Speed"
                tone="rose"
              />

              <HighlightCard
                label="Emerging Theme"
                value="Payment Status"
                tone="blue"
              />
            </div>
          </article>

          <aside className="rounded-3xl bg-slate-950 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                Executive Summary
              </h2>

              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                AI
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-300">
              Overall customer sentiment remains
              positive. Users appreciate the clean
              interface, responsive experience and
              quick support resolution.
            </p>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Checkout performance and delayed
              payment confirmation remain the most
              important issues requiring immediate
              attention.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Primary Opportunity
              </p>

              <p className="mt-3 text-sm font-semibold leading-6">
                Improve transaction visibility and
                reduce checkout response time.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-xs font-bold text-emerald-300">
                Positive Direction
              </p>

              <p className="mt-2 text-xs leading-5 text-emerald-100">
                Positive sentiment improved by{" "}
                {currentReport.positiveChange} during
                the selected period.
              </p>
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-500">
              This is frontend demo report content.
              Live AI summaries can later be loaded
              from the backend reporting API.
            </p>
          </aside>
        </section>

        {/* Themes */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Top Feedback Themes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Frequently discussed topics across
                all customer-feedback sources.
              </p>
            </div>

            <span className="w-fit rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
              {currentReport.activeThemes} active themes
            </span>
          </div>

          <div className="mt-7 space-y-4">
            {currentReport.themes.map(
              (theme, index) => (
                <article
                  key={theme.name}
                  className="grid gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30 md:grid-cols-[44px_220px_minmax(0,1fr)_120px_90px] md:items-center"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xs font-black text-blue-700">
                    {index + 1}
                  </span>

                  <div>
                    <p className="font-bold text-slate-900">
                      {theme.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {theme.status} theme
                    </p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-400 md:hidden">
                      <span>Theme coverage</span>
                      <span>{theme.percentage}%</span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600"
                        style={{
                          width: `${theme.percentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-600">
                    {theme.mentions.toLocaleString()}{" "}
                    mentions
                  </p>

                  <span
                    className={
                      theme.trend.startsWith("+")
                        ? "w-fit rounded-full bg-emerald-100 px-2.5 py-1 text-center text-xs font-bold text-emerald-700"
                        : "w-fit rounded-full bg-rose-100 px-2.5 py-1 text-center text-xs font-bold text-rose-700"
                    }
                  >
                    {theme.trend}
                  </span>
                </article>
              ),
            )}
          </div>
        </section>

        {/* Recommendations */}
        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Recommended Actions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Suggested improvements based on the
                current feedback analysis.
              </p>
            </div>

            <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              {currentReport.recommendations.length}{" "}
              actions
            </span>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {currentReport.recommendations.map(
              (recommendation, index) => (
                <RecommendationCard
                  key={recommendation.title}
                  recommendation={recommendation}
                  index={index}
                />
              ),
            )}
          </div>
        </section>
      </div>
    </LoopShell>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone: MetricTone;
  icon: ReactNode;
}) {
  const styles: Record<
    MetricTone,
    {
      icon: string;
      line: string;
      badge: string;
    }
  > = {
    blue: {
      icon: "bg-blue-100 text-blue-700",
      line: "from-blue-600 to-cyan-500",
      badge: "bg-blue-50 text-blue-700",
    },
    emerald: {
      icon: "bg-emerald-100 text-emerald-700",
      line: "from-emerald-600 to-teal-500",
      badge:
        "bg-emerald-50 text-emerald-700",
    },
    rose: {
      icon: "bg-rose-100 text-rose-700",
      line: "from-rose-600 to-orange-500",
      badge: "bg-rose-50 text-rose-700",
    },
    violet: {
      icon: "bg-violet-100 text-violet-700",
      line: "from-violet-600 to-fuchsia-500",
      badge:
        "bg-violet-50 text-violet-700",
    },
  };

  const style = styles[tone];

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <span
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${style.line}`}
      />

      <div className="flex items-start justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.icon}`}
        >
          {icon}
        </span>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${style.badge}`}
        >
          Live
        </span>
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-400">
        {detail}
      </p>
    </article>
  );
}

function RecommendationCard({
  recommendation,
  index,
}: {
  recommendation: Recommendation;
  index: number;
}) {
  const priorityStyle =
    recommendation.priority === "High"
      ? "bg-rose-100 text-rose-700"
      : recommendation.priority === "Medium"
        ? "bg-amber-100 text-amber-700"
        : "bg-blue-100 text-blue-700";

  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${priorityStyle}`}
        >
          {recommendation.priority} Priority
        </span>

        <span className="text-sm font-black text-slate-300">
          0{index + 1}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-950">
        {recommendation.title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {recommendation.description}
      </p>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Expected Impact
        </p>

        <p className="mt-2 text-sm font-semibold text-slate-700">
          {recommendation.impact}
        </p>
      </div>

      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
        <DetailItem
          label="Suggested owner"
          value={recommendation.owner}
        />

        <DetailItem
          label="Timeline"
          value={recommendation.timeline}
        />
      </div>
    </article>
  );
}

function HighlightCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "rose" | "blue";
}) {
  const styles = {
    emerald:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
    rose: "border-rose-100 bg-rose-50 text-rose-700",
    blue: "border-blue-100 bg-blue-50 text-blue-700",
  };

  return (
    <div
      className={`rounded-2xl border p-4 ${styles[tone]}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
        {label}
      </p>

      <p className="mt-2 text-sm font-bold">
        {value}
      </p>
    </div>
  );
}

function ScoreRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="text-xs font-bold text-white">
        {value}
      </span>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function HeroFeature({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
        ✓
      </span>

      {children}
    </span>
  );
}

function LoadingSpinner() {
  return (
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400/30 border-t-slate-950" />
  );
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
        d="m5 12 4 4L19 6"
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
        d="M12 4v12M7 11l5 5 5-5M5 20h14"
      />
    </svg>
  );
}

function PrintIcon() {
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
        d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 14h10v7H7z"
      />
    </svg>
  );
}

function TableIcon() {
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
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
      />

      <path
        strokeLinecap="round"
        d="M3 10h18M9 4v16"
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

function PositiveIcon() {
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
        d="M8.5 10h.01M15.5 10h.01M8.5 15c1.8 1.6 5.2 1.6 7 0"
      />
    </svg>
  );
}

function WarningIcon() {
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

function ThemeIcon() {
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
        d="M5 4h14v5H5zM5 13h6v7H5zM15 13h4v7h-4z"
      />
    </svg>
  );
}