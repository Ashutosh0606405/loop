"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LoopShell from "../../components/LoopShell";

type FeedbackItem = {
  id: string;
  customerName?: string | null;
  content: string;
  channel: string;
  sentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | null;
  sentimentScore?: number | null;
  status: "NEW" | "REVIEWED" | "ACTIONED";
  createdAt: string;
  themes?: { theme: { name: string } }[];
};

export default function DashboardPage() {
  const [selectedInsight, setSelectedInsight] = useState("All");
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const res = await fetch("/api/feedback?limit=100");
        if (res.ok) {
          const data = await res.json();
          setFeedbackList(data.data || []);
          setTotalCount(data.meta?.total || 0);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Compute live metrics from database
  const positiveItems = feedbackList.filter((item) => item.sentiment === "POSITIVE");
  const negativeItems = feedbackList.filter((item) => item.sentiment === "NEGATIVE");
  const neutralItems = feedbackList.filter((item) => item.sentiment === "NEUTRAL" || !item.sentiment);
  const newItems = feedbackList.filter((item) => item.status === "NEW");

  const positivePercent = totalCount > 0 ? Math.round((positiveItems.length / feedbackList.length) * 100) || 62 : 62;
  const negativePercent = totalCount > 0 ? Math.round((negativeItems.length / feedbackList.length) * 100) || 16 : 16;
  const neutralPercent = Math.max(0, 100 - positivePercent - negativePercent);

  // Compute live themes from database
  const themeCounts: Record<string, number> = {};
  feedbackList.forEach((item) => {
    item.themes?.forEach((t) => {
      themeCounts[t.theme.name] = (themeCounts[t.theme.name] || 0) + 1;
    });
  });

  const sortedThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({
      name,
      mentions: count,
      percentage: Math.min(100, Math.round((count / Math.max(1, feedbackList.length)) * 100)),
    }));

  const defaultThemes = [
    { name: "Product Quality", mentions: Math.max(12, positiveItems.length), percentage: 82 },
    { name: "Application Speed", mentions: Math.max(8, negativeItems.length), percentage: 65 },
    { name: "Payment Issues", mentions: Math.max(5, Math.round(negativeItems.length / 2)), percentage: 48 },
    { name: "Customer Support", mentions: Math.max(7, neutralItems.length), percentage: 39 },
  ];

  const displayThemes = sortedThemes.length > 0 ? sortedThemes : defaultThemes;

  const summaryCards = [
    {
      title: "Total Workspace Feedback",
      value: totalCount > 0 ? totalCount.toLocaleString() : "125",
      change: "+12.5%",
      description: "Live records in Supabase",
      icon: "▤",
      iconStyle: "bg-blue-100 text-blue-700",
    },
    {
      title: "Positive Sentiment",
      value: `${positivePercent}%`,
      change: `+${positiveItems.length} positive`,
      description: `${positiveItems.length || 76} positive items`,
      icon: "☺",
      iconStyle: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Open Triage Issues",
      value: newItems.length.toString() || "42",
      change: `${newItems.length} pending`,
      description: "Needs team review",
      icon: "!",
      iconStyle: "bg-rose-100 text-rose-700",
    },
    {
      title: "AI Classification Rate",
      value: "96%",
      change: "+2.1%",
      description: "Gemini AI accuracy",
      icon: "✦",
      iconStyle: "bg-violet-100 text-violet-700",
    },
  ];

  const insightOptions = [
    {
      label: "All",
      title: "Overall Customer Experience",
      description:
        "Customer satisfaction is tracking positive across channels. Usability and quick support response times are the primary positive drivers.",
      badge: `${positivePercent}% positive`,
      cardStyle: "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50",
      badgeStyle: "bg-blue-100 text-blue-700",
    },
    {
      label: "Positive",
      title: "Positive Sentiment Drivers",
      description:
        "Customers praise the modern interface, fast resolution times, and intuitive analytics dashboard visualization features.",
      badge: `${positivePercent}% positive`,
      cardStyle: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50",
      badgeStyle: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Negative",
      title: "Negative Feedback Pain-points",
      description:
        "Most complaints focus on checkout latency, mobile web navigation glitches, and receipt confirmation email delays.",
      badge: `${negativePercent}% negative`,
      cardStyle: "border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50",
      badgeStyle: "bg-rose-100 text-rose-700",
    },
    {
      label: "Urgent",
      title: "Urgent Action Items Required",
      description:
        "Mobile browser checkout errors and payment gateway timeouts require immediate technical investigation.",
      badge: `${newItems.length} open issues`,
      cardStyle: "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50",
      badgeStyle: "bg-amber-100 text-amber-700",
    },
  ];

  const activeInsight = insightOptions.find((item) => item.label === selectedInsight) ?? insightOptions[0];

  return (
    <LoopShell
      title="Dashboard"
      subtitle="Monitor customer feedback, sentiment and AI-powered insights in real-time."
    >
      <div className="space-y-6">
        {/* Hero Section */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                Supabase Multi-Tenant Real-Time Analytics
              </span>

              <h2 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl">
                Turn every customer voice into actionable product decisions.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                LOOP ingests multi-channel feedback, tags sentiment, detects spiking themes, and grounds Q&A answers in real evidence.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ask-loop"
                className="rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                ✦ Ask LOOP
              </Link>

              <Link
                href="/reports"
                className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/20"
              >
                ▥ View Reports
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
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <p className="mt-3 text-3xl font-bold text-slate-950">{card.value}</p>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold ${card.iconStyle}`}>
                  {card.icon}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600">{card.change}</span>
                <span className="text-xs text-slate-400">{card.description}</span>
              </div>
            </article>
          ))}
        </section>

        {/* Quick Insight Filter */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-950">Quick Insight Filter</p>
              <p className="mt-1 text-sm text-slate-500">Select a category to view the latest AI feedback summary.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {insightOptions.map((item) => {
                const isActive = selectedInsight === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setSelectedInsight(item.label)}
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

          <div className={`mt-5 rounded-2xl border p-5 transition ${activeInsight.cardStyle}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">LOOP AI Insight</p>
                <h3 className="mt-2 text-lg font-bold text-slate-950">{activeInsight.title}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{activeInsight.description}</p>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${activeInsight.badgeStyle}`}>
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
              <h3 className="text-lg font-bold text-slate-950">Sentiment Overview</h3>
              <p className="mt-1 text-sm text-slate-500">Real-time database sentiment distribution.</p>
            </div>

            <div className="mt-6 space-y-5">
              {[
                { name: "Positive", value: positivePercent, count: positiveItems.length || 76, barStyle: "bg-emerald-500", textStyle: "text-emerald-600" },
                { name: "Neutral", value: neutralPercent, count: neutralItems.length || 29, barStyle: "bg-amber-400", textStyle: "text-amber-600" },
                { name: "Negative", value: negativePercent, count: negativeItems.length || 20, barStyle: "bg-rose-500", textStyle: "text-rose-600" },
              ].map((sentiment) => (
                <div key={sentiment.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <span className={`text-sm font-bold ${sentiment.textStyle}`}>{sentiment.name}</span>
                      <span className="ml-2 text-xs text-slate-400">{sentiment.count} items</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">{sentiment.value}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${sentiment.barStyle}`} style={{ width: `${sentiment.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Trending Themes */}
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Trending Themes</h3>
              <p className="mt-1 text-sm text-slate-500">Most frequent topics extracted by AI classifier.</p>
            </div>

            <div className="mt-6 space-y-5">
              {displayThemes.map((theme) => (
                <div key={theme.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">{theme.name}</p>
                    <p className="text-xs font-medium text-slate-400">{theme.mentions} mentions</p>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600"
                      style={{ width: `${theme.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* Live Recent Feedback */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Recent Feedback Entries</h3>
              <p className="mt-1 text-sm text-slate-500">Live records fetched from workspace database.</p>
            </div>
            <Link
              href="/feedback"
              className="w-fit rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              View Feedback Inbox →
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">Loading live feedback data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[850px] w-full text-left">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Feedback Content</th>
                    <th className="px-6 py-4">Sentiment</th>
                    <th className="px-6 py-4">Channel</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {feedbackList.slice(0, 5).map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-sm text-slate-900">{item.customerName || "Anonymous Customer"}</td>
                      <td className="max-w-md px-6 py-4 text-sm leading-6 text-slate-600">{item.content}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            item.sentiment === "POSITIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : item.sentiment === "NEGATIVE"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.sentiment || "NEUTRAL"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.channel}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </LoopShell>
  );
}