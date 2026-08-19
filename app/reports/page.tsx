"use client";

import { useState } from "react";
import LoopShell from "../../components/LoopShell";

type ReportPeriod =
  | "Last 7 Days"
  | "Last 30 Days"
  | "Last 3 Months";

const sentimentData = [
  {
    name: "Positive",
    value: 62,
    barStyle: "bg-emerald-500",
    textStyle: "text-emerald-700",
    backgroundStyle: "bg-emerald-50",
  },
  {
    name: "Neutral",
    value: 23,
    barStyle: "bg-amber-500",
    textStyle: "text-amber-700",
    backgroundStyle: "bg-amber-50",
  },
  {
    name: "Negative",
    value: 15,
    barStyle: "bg-rose-500",
    textStyle: "text-rose-700",
    backgroundStyle: "bg-rose-50",
  },
];

const topThemes = [
  {
    name: "User Experience",
    mentions: 342,
    percentage: 88,
    trend: "+12%",
  },
  {
    name: "Payment Confirmation",
    mentions: 286,
    percentage: 74,
    trend: "+18%",
  },
  {
    name: "Application Speed",
    mentions: 214,
    percentage: 58,
    trend: "+9%",
  },
  {
    name: "Customer Support",
    mentions: 176,
    percentage: 46,
    trend: "+6%",
  },
  {
    name: "Onboarding",
    mentions: 129,
    percentage: 34,
    trend: "-3%",
  },
];

const recommendations = [
  {
    priority: "High",
    title: "Improve checkout performance",
    description:
      "Customers report slow checkout performance when multiple products are added.",
    impact: "Reduce checkout abandonment",
    style: "bg-rose-100 text-rose-700",
  },
  {
    priority: "High",
    title: "Add real-time payment status",
    description:
      "Customers need clearer confirmation while a payment transaction is processing.",
    impact: "Improve customer trust",
    style: "bg-rose-100 text-rose-700",
  },
  {
    priority: "Medium",
    title: "Simplify onboarding",
    description:
      "New users feel that the initial product walkthrough contains too many steps.",
    impact: "Improve activation rate",
    style: "bg-amber-100 text-amber-700",
  },
  {
    priority: "Low",
    title: "Expand support knowledge base",
    description:
      "Common account questions can be converted into self-service help articles.",
    impact: "Reduce support tickets",
    style: "bg-blue-100 text-blue-700",
  },
];

export default function ReportsPage() {
  const [period, setPeriod] =
    useState<ReportPeriod>("Last 30 Days");

  const [reportType, setReportType] =
    useState("Executive Summary");

  const [isGenerated, setIsGenerated] =
    useState(false);

  function generateReport() {
    setIsGenerated(true);
  }

  function downloadReport() {
    const reportContent = `
PROJECT LOOP - CUSTOMER FEEDBACK REPORT

Report Type: ${reportType}
Report Period: ${period}

SUMMARY
Total Feedback: 1,248
Positive Sentiment: 62%
Neutral Sentiment: 23%
Negative Sentiment: 15%
Active Themes: 12

TOP THEMES
1. User Experience - 342 mentions
2. Payment Confirmation - 286 mentions
3. Application Speed - 214 mentions
4. Customer Support - 176 mentions
5. Onboarding - 129 mentions

KEY RECOMMENDATIONS
1. Improve checkout performance.
2. Add real-time payment status.
3. Simplify the onboarding process.
4. Expand the customer-support knowledge base.

Generated using Project LOOP frontend prototype.
`;

    const reportBlob = new Blob(
      [reportContent],
      {
        type: "text/plain",
      },
    );

    const reportUrl =
      URL.createObjectURL(reportBlob);

    const downloadLink =
      document.createElement("a");

    downloadLink.href = reportUrl;
    downloadLink.download =
      "project-loop-feedback-report.txt";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    URL.revokeObjectURL(reportUrl);
  }

  return (
    <LoopShell
      title="Reports"
      subtitle="Generate and explore customer-feedback reports."
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 p-7 text-white shadow-xl md:p-9">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
              Feedback Reporting Centre
            </span>

            <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight md:text-4xl">
              Transform customer feedback into
              clear business reports.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              Monitor sentiment, discover emerging
              themes and identify actions that can
              improve the customer experience.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              📄 Export PDF / Print
            </button>
            <button
              type="button"
              onClick={generateReport}
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-50"
            >
              Generate Report
            </button>
          </div>
        </div>
      </section>

      {/* Report Settings */}
      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-lg font-bold">
              Report Settings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the report type and analysis
              period.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="report-type"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Report Type
              </label>

              <select
                id="report-type"
                value={reportType}
                onChange={(event) =>
                  setReportType(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              >
                <option>Executive Summary</option>
                <option>Sentiment Analysis</option>
                <option>Theme Analysis</option>
                <option>Customer Experience</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="report-period"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Report Period
              </label>

              <select
                id="report-period"
                value={period}
                onChange={(event) =>
                  setPeriod(
                    event.target
                      .value as ReportPeriod,
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Generated Message */}
      {isGenerated && (
        <section className="mt-5 flex flex-col justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-bold text-emerald-800">
              Report generated successfully
            </p>

            <p className="mt-1 text-sm text-emerald-700">
              {reportType} for {period} is ready.
            </p>
          </div>

          <button
            type="button"
            onClick={downloadReport}
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Download Report
          </button>
        </section>
      )}

      {/* KPI Cards */}
      <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Feedback",
            value: "1,248",
            detail: "+14.8% from previous period",
            badge: "01",
            style:
              "bg-blue-100 text-blue-700",
          },
          {
            label: "Positive Sentiment",
            value: "62%",
            detail: "+7.2% customer satisfaction",
            badge: "02",
            style:
              "bg-emerald-100 text-emerald-700",
          },
          {
            label: "Negative Sentiment",
            value: "15%",
            detail: "-2.4% from previous period",
            badge: "03",
            style:
              "bg-rose-100 text-rose-700",
          },
          {
            label: "Active Themes",
            value: "12",
            detail: "3 emerging themes found",
            badge: "04",
            style:
              "bg-violet-100 text-violet-700",
          },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-xs font-bold ${item.style}`}
              >
                {item.badge}
              </span>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Live
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              {item.label}
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-950">
              {item.value}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              {item.detail}
            </p>
          </article>
        ))}
      </section>

      {/* Sentiment and Highlights */}
      <section className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Sentiment Analysis */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">
                Sentiment Analysis
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Customer sentiment distribution for{" "}
                {period.toLowerCase()}.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
              1,248 responses
            </span>
          </div>

          <div className="mt-8 space-y-6">
            {sentimentData.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${item.backgroundStyle} ${item.textStyle}`}
                    >
                      {item.name}
                    </span>
                  </div>

                  <span className="text-sm font-bold text-slate-700">
                    {item.value}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${item.barStyle}`}
                    style={{
                      width: `${item.value}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Strongest Area
              </p>

              <p className="mt-2 font-bold">
                User Experience
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Urgent Issue
              </p>

              <p className="mt-2 font-bold">
                Checkout Speed
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Emerging Theme
              </p>

              <p className="mt-2 font-bold">
                Payment Status
              </p>
            </div>
          </div>
        </article>

        {/* Executive Summary */}
        <aside className="rounded-2xl bg-slate-950 p-6 text-white shadow-lg">
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
            interface and quick support resolution.
          </p>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            Checkout performance and delayed payment
            confirmation are the most important
            issues requiring immediate attention.
          </p>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Primary Opportunity
            </p>

            <p className="mt-2 text-sm font-semibold leading-6">
              Improve transaction visibility and
              reduce checkout response time.
            </p>
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-500">
            This is frontend demo content. Actual AI
            summaries will later be generated using
            customer-feedback evidence.
          </p>
        </aside>
      </section>

      {/* Top Themes */}
      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold">
            Top Feedback Themes
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Frequently discussed topics across all
            customer-feedback sources.
          </p>
        </div>

        <div className="mt-7 space-y-5">
          {topThemes.map((theme, index) => (
            <article
              key={theme.name}
              className="grid gap-4 rounded-xl border border-slate-200 p-4 md:grid-cols-[40px_220px_minmax(0,1fr)_100px_80px] md:items-center"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">
                {index + 1}
              </span>

              <div>
                <p className="font-semibold">
                  {theme.name}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Customer-feedback theme
                </p>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${theme.percentage}%`,
                  }}
                />
              </div>

              <p className="text-sm font-semibold text-slate-600">
                {theme.mentions} mentions
              </p>

              <span
                className={
                  theme.trend.startsWith("+")
                    ? "rounded-full bg-emerald-100 px-2.5 py-1 text-center text-xs font-bold text-emerald-700"
                    : "rounded-full bg-rose-100 px-2.5 py-1 text-center text-xs font-bold text-rose-700"
                }
              >
                {theme.trend}
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* Recommendations */}
      <section className="mt-7">
        <div>
          <h2 className="text-lg font-bold">
            Recommended Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Suggested improvements based on the
            current feedback analysis.
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {recommendations.map(
            (recommendation, index) => (
              <article
                key={recommendation.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${recommendation.style}`}
                  >
                    {recommendation.priority} Priority
                  </span>

                  <span className="text-sm font-bold text-slate-300">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  {recommendation.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {recommendation.description}
                </p>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Expected Impact
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {recommendation.impact}
                  </p>
                </div>
              </article>
            ),
          )}
        </div>
      </section>
    </LoopShell>
  );
}