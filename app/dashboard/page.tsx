"use client";

import { useState } from "react";
import Link from "next/link";
import LoopShell from "../../components/LoopShell";

const summaryCards = [
  {
    title: "Total Feedback",
    value: "1,248",
    change: "+12.5%",
    description: "Compared to last month",
    icon: "▤",
    iconStyle: "bg-blue-100 text-blue-700",
  },
  {
    title: "Positive Feedback",
    value: "764",
    change: "+8.4%",
    description: "61% of total feedback",
    icon: "☺",
    iconStyle: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Open Issues",
    value: "42",
    change: "-4.2%",
    description: "Needs team attention",
    icon: "!",
    iconStyle: "bg-rose-100 text-rose-700",
  },
  {
    title: "AI Confidence",
    value: "94%",
    change: "+2.1%",
    description: "Analysis accuracy",
    icon: "✦",
    iconStyle: "bg-violet-100 text-violet-700",
  },
];

const insightOptions = [
  {
    label: "All",
    title: "Overall Customer Experience",
    description:
      "Customer satisfaction is improving. Product quality and faster support responses are the main positive drivers.",
    badge: "Stable performance",
    cardStyle:
      "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50",
    badgeStyle: "bg-blue-100 text-blue-700",
  },
  {
    label: "Positive",
    title: "Positive Feedback Insights",
    description:
      "Customers appreciate the clean interface, product quality and quick response from the customer support team.",
    badge: "61% positive",
    cardStyle:
      "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50",
    badgeStyle: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Negative",
    title: "Negative Feedback Insights",
    description:
      "Most negative feedback is related to payment delays, application loading speed and checkout performance.",
    badge: "16% negative",
    cardStyle:
      "border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50",
    badgeStyle: "bg-rose-100 text-rose-700",
  },
  {
    label: "Urgent",
    title: "Urgent Issues Requiring Attention",
    description:
      "Checkout slowdown and delayed payment confirmations need immediate investigation from the technical team.",
    badge: "3 urgent issues",
    cardStyle:
      "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50",
    badgeStyle: "bg-amber-100 text-amber-700",
  },
];

const sentimentData = [
  {
    name: "Positive",
    value: 61,
    count: 764,
    barStyle: "bg-emerald-500",
    textStyle: "text-emerald-600",
  },
  {
    name: "Neutral",
    value: 23,
    count: 287,
    barStyle: "bg-amber-400",
    textStyle: "text-amber-600",
  },
  {
    name: "Negative",
    value: 16,
    count: 197,
    barStyle: "bg-rose-500",
    textStyle: "text-rose-600",
  },
];

const themes = [
  {
    name: "Product Quality",
    mentions: 386,
    percentage: 82,
  },
  {
    name: "Application Speed",
    mentions: 274,
    percentage: 65,
  },
  {
    name: "Payment Issues",
    mentions: 198,
    percentage: 48,
  },
  {
    name: "Customer Support",
    mentions: 165,
    percentage: 39,
  },
];

const weeklyTrend = [
  {
    day: "Mon",
    value: 48,
    feedback: 142,
  },
  {
    day: "Tue",
    value: 62,
    feedback: 183,
  },
  {
    day: "Wed",
    value: 54,
    feedback: 159,
  },
  {
    day: "Thu",
    value: 76,
    feedback: 224,
  },
  {
    day: "Fri",
    value: 68,
    feedback: 201,
  },
  {
    day: "Sat",
    value: 42,
    feedback: 124,
  },
  {
    day: "Sun",
    value: 52,
    feedback: 153,
  },
];

const urgentIssues = [
  {
    title: "Checkout slowdown",
    description:
      "Multiple customers reported slow checkout performance.",
    status: "High Priority",
    statusStyle: "bg-rose-100 text-rose-700",
  },
  {
    title: "Payment confirmation delay",
    description:
      "Payment confirmation is taking longer than expected.",
    status: "Investigating",
    statusStyle: "bg-amber-100 text-amber-700",
  },
  {
    title: "Onboarding confusion",
    description:
      "New users need clearer guidance during account setup.",
    status: "Medium",
    statusStyle: "bg-blue-100 text-blue-700",
  },
];

const recentFeedback = [
  {
    customer: "Ananya R",
    feedback:
      "The application is easy to use and the interface looks clean.",
    sentiment: "Positive",
    sentimentStyle:
      "bg-emerald-100 text-emerald-700",
    source: "Web App",
    time: "10 min ago",
  },
  {
    customer: "Rahul K",
    feedback:
      "Payment confirmation took more time than expected.",
    sentiment: "Negative",
    sentimentStyle: "bg-rose-100 text-rose-700",
    source: "Email",
    time: "34 min ago",
  },
  {
    customer: "Meena S",
    feedback:
      "Customer support solved my issue quickly.",
    sentiment: "Positive",
    sentimentStyle:
      "bg-emerald-100 text-emerald-700",
    source: "Support",
    time: "1 hour ago",
  },
];

export default function DashboardPage() {
  const [selectedInsight, setSelectedInsight] =
    useState("All");

  const activeInsight =
    insightOptions.find(
      (item) => item.label === selectedInsight,
    ) ?? insightOptions[0];

  return (
    <LoopShell
      title="Dashboard"
      subtitle="Monitor customer feedback, sentiment and AI-powered insights."
    >
      <div className="space-y-6">
        {/* Hero Section */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                AI Customer Feedback Intelligence
              </span>

              <h2 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl">
                Turn every customer voice into
                actionable insight.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                LOOP analyses feedback, identifies
                sentiment, discovers trends and helps
                your team make better decisions.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ask-loop"
                className="rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                Ask LOOP
              </Link>

              <Link
                href="/reports"
                className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/20"
              >
                View Reports
              </Link>
            </div>
          </div>
        </section>

        {/* Summary Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-950">
                    {card.value}
                  </p>
                </div>

                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold ${card.iconStyle}`}
                >
                  {card.icon}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600">
                  {card.change}
                </span>

                <span className="text-xs text-slate-400">
                  {card.description}
                </span>
              </div>
            </article>
          ))}
        </section>

        {/* Quick Insight Filter */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-950">
                Quick Insight Filter
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Select a category to view the latest AI
                insight.
              </p>
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
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
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

          <div
            className={`mt-5 rounded-2xl border p-5 transition ${activeInsight.cardStyle}`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  LOOP AI Insight
                </p>

                <h3 className="mt-2 text-lg font-bold text-slate-950">
                  {activeInsight.title}
                </h3>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  {activeInsight.description}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${activeInsight.badgeStyle}`}
              >
                {activeInsight.badge}
              </span>
            </div>
          </div>
        </section>

        {/* Sentiment and Themes */}
        <section className="grid gap-6 xl:grid-cols-2">
          {/* Sentiment Overview */}
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                Sentiment Overview
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Overall customer sentiment distribution.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {sentimentData.map((sentiment) => (
                <div key={sentiment.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <span
                        className={`text-sm font-bold ${sentiment.textStyle}`}
                      >
                        {sentiment.name}
                      </span>

                      <span className="ml-2 text-xs text-slate-400">
                        {sentiment.count} feedback
                      </span>
                    </div>

                    <span className="text-sm font-bold text-slate-800">
                      {sentiment.value}%
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${sentiment.barStyle}`}
                      style={{
                        width: `${sentiment.value}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Trending Themes */}
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                Trending Themes
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Frequently discussed customer topics.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {themes.map((theme) => (
                <div key={theme.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">
                      {theme.name}
                    </p>

                    <p className="text-xs font-medium text-slate-400">
                      {theme.mentions} mentions
                    </p>
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
              ))}
            </div>
          </article>
        </section>

        {/* Weekly Trend and Urgent Issues */}
        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          {/* Weekly Feedback Trend */}
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Weekly Feedback Trend
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Feedback received during the last seven
                  days.
                </p>
              </div>

              <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                1,186 this week
              </span>
            </div>

            <div className="mt-8 flex h-64 items-end justify-between gap-2 border-b border-slate-200 sm:gap-4">
              {weeklyTrend.map((item) => (
                <div
                  key={item.day}
                  className="flex h-full flex-1 flex-col items-center justify-end"
                >
                  <span className="mb-2 hidden text-xs font-bold text-slate-600 sm:block">
                    {item.feedback}
                  </span>

                  <div
                    title={`${item.feedback} feedback`}
                    className="w-full max-w-12 rounded-t-xl bg-gradient-to-t from-blue-700 to-violet-500 transition hover:opacity-80"
                    style={{
                      height: `${item.value}%`,
                    }}
                  />

                  <span className="mt-3 text-xs font-semibold text-slate-500">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </article>

          {/* Urgent Issues */}
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Urgent Issues
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Issues requiring team attention.
                </p>
              </div>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 font-bold text-rose-700">
                3
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {urgentIssues.map((issue) => (
                <div
                  key={issue.title}
                  className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {issue.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {issue.description}
                      </p>
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${issue.statusStyle}`}
                    >
                      {issue.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* Recent Feedback */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
              className="w-fit rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              View All Feedback
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[850px] w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Feedback
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Sentiment
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Source
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentFeedback.map((item) => (
                  <tr
                    key={`${item.customer}-${item.time}`}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                          {item.customer.charAt(0)}
                        </div>

                        <span className="text-sm font-semibold text-slate-800">
                          {item.customer}
                        </span>
                      </div>
                    </td>

                    <td className="max-w-md px-6 py-5 text-sm leading-6 text-slate-600">
                      {item.feedback}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${item.sentimentStyle}`}
                      >
                        {item.sentiment}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
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
        </section>
      </div>
    </LoopShell>
  );
}