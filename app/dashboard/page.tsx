import Link from "next/link";

const summaryCards = [
  {
    title: "Total Feedback",
    value: "1,248",
    change: "+12.5%",
    description: "vs last month",
    icon: "✦",
    iconStyle: "bg-blue-100 text-blue-700",
    changeStyle: "bg-green-100 text-green-700",
  },
  {
    title: "Positive Feedback",
    value: "764",
    change: "+8.4%",
    description: "customer satisfaction",
    icon: "☺",
    iconStyle: "bg-emerald-100 text-emerald-700",
    changeStyle: "bg-green-100 text-green-700",
  },
  {
    title: "Open Issues",
    value: "42",
    change: "-6.2%",
    description: "need attention",
    icon: "!",
    iconStyle: "bg-rose-100 text-rose-700",
    changeStyle: "bg-green-100 text-green-700",
  },
  {
    title: "AI Confidence",
    value: "94%",
    change: "+2.1%",
    description: "analysis accuracy",
    icon: "AI",
    iconStyle: "bg-violet-100 text-violet-700",
    changeStyle: "bg-violet-100 text-violet-700",
  },
];

const sentimentData = [
  {
    name: "Positive",
    value: 61,
    count: 764,
    barStyle: "bg-emerald-500",
    textStyle: "text-emerald-700",
  },
  {
    name: "Neutral",
    value: 23,
    count: 286,
    barStyle: "bg-amber-400",
    textStyle: "text-amber-700",
  },
  {
    name: "Negative",
    value: 16,
    count: 198,
    barStyle: "bg-rose-500",
    textStyle: "text-rose-700",
  },
];

const themes = [
  {
    name: "Product Quality",
    count: 342,
    trend: "+18%",
    priority: "High impact",
    style: "bg-blue-100 text-blue-700",
  },
  {
    name: "Application Speed",
    count: 256,
    trend: "+12%",
    priority: "Growing",
    style: "bg-violet-100 text-violet-700",
  },
  {
    name: "Payment Issues",
    count: 198,
    trend: "+9%",
    priority: "Needs action",
    style: "bg-rose-100 text-rose-700",
  },
  {
    name: "Customer Support",
    count: 176,
    trend: "-5%",
    priority: "Improving",
    style: "bg-emerald-100 text-emerald-700",
  },
];

const recentFeedback = [
  {
    customer: "Ananya Sharma",
    initials: "AS",
    message:
      "The application is easy to use and the new dashboard looks great.",
    source: "App Review",
    sentiment: "Positive",
    date: "Today, 10:24 AM",
  },
  {
    customer: "Rahul Kumar",
    initials: "RK",
    message:
      "Payment was successful, but confirmation took too long.",
    source: "Support Ticket",
    sentiment: "Neutral",
    date: "Today, 9:40 AM",
  },
  {
    customer: "Priya Singh",
    initials: "PS",
    message:
      "The checkout page becomes slow when I add multiple products.",
    source: "Survey",
    sentiment: "Negative",
    date: "Yesterday, 5:15 PM",
  },
  {
    customer: "Arjun Patel",
    initials: "AP",
    message:
      "Customer support resolved my issue very quickly.",
    source: "Social Media",
    sentiment: "Positive",
    date: "Yesterday, 2:30 PM",
  },
];

function getSentimentStyle(sentiment: string) {
  if (sentiment === "Positive") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (sentiment === "Negative") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-amber-100 text-amber-700";
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden w-72 flex-col bg-slate-950 p-6 text-white lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-violet-600 text-lg font-bold">
              L
            </div>

            <div>
              <h1 className="text-xl font-bold">LOOP</h1>
              <p className="text-xs text-slate-400">
                Feedback Intelligence
              </p>
            </div>
          </div>

          <div className="mt-10">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Workspace
            </p>

            <nav className="space-y-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30"
              >
                <span className="text-lg">⌂</span>
                Dashboard
              </Link>

              <Link
                href="/feedback"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <span className="text-lg">▤</span>
                Feedback
              </Link>

              <Link
                href="/ask-loop"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <span className="text-lg">✦</span>
                Ask LOOP
              </Link>

              <Link
                href="/reports"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <span className="text-lg">▥</span>
                Reports
              </Link>
            </nav>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                AI Analysis
              </span>

              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              LOOP AI is actively analysing new customer
              feedback.
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-[78%] rounded-full bg-blue-500" />
            </div>

            <p className="mt-2 text-right text-xs text-slate-500">
              78% processed
            </p>
          </div>

          <div className="mt-auto border-t border-slate-800 pt-5">
            <div className="flex items-center gap-3 rounded-xl p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-violet-600 text-sm font-bold">
                LP
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  Lakshmipriya D
                </p>
                <p className="truncate text-xs text-slate-400">
                  Frontend Developer
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="mt-3 block rounded-xl border border-slate-800 px-4 py-2.5 text-center text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              Logout
            </Link>
          </div>
        </aside>

        {/* Main Area */}
        <main className="min-w-0 flex-1">
          {/* Top Header */}
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                  Project LOOP
                </p>

                <h2 className="mt-1 text-xl font-bold md:text-2xl">
                  Intelligence Dashboard
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 md:flex">
                  <span className="text-slate-400">⌕</span>

                  <input
                    type="text"
                    placeholder="Search insights..."
                    className="w-40 bg-transparent text-sm outline-none"
                  />
                </div>

                <button
                  type="button"
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg transition hover:bg-slate-50"
                >
                  ♢
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
                </button>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white lg:hidden">
                  LP
                </div>
              </div>
            </div>
          </header>

          <div className="p-5 md:p-8">
            {/* Mobile Navigation */}
            <nav className="mb-6 flex gap-3 overflow-x-auto pb-2 lg:hidden">
              <Link
                href="/dashboard"
                className="whitespace-nowrap rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Dashboard
              </Link>

              <Link
                href="/feedback"
                className="whitespace-nowrap rounded-xl bg-white px-4 py-2.5 text-sm font-semibold shadow-sm"
              >
                Feedback
              </Link>

              <Link
                href="/ask-loop"
                className="whitespace-nowrap rounded-xl bg-white px-4 py-2.5 text-sm font-semibold shadow-sm"
              >
                Ask LOOP
              </Link>

              <Link
                href="/reports"
                className="whitespace-nowrap rounded-xl bg-white px-4 py-2.5 text-sm font-semibold shadow-sm"
              >
                Reports
              </Link>
            </nav>

            {/* Hero Banner */}
            <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-950 via-blue-950 to-violet-950 p-7 text-white shadow-xl md:p-9">
              <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="absolute -bottom-20 left-1/2 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />

              <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Live customer intelligence
                  </div>

                  <h1 className="mt-5 text-3xl font-bold leading-tight md:text-4xl">
                    Understand what your customers
                    <span className="text-blue-300">
                      {" "}
                      really want.
                    </span>
                  </h1>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                    LOOP converts scattered feedback into clear,
                    evidence-backed insights your team can act on.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/ask-loop"
                    className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-50"
                  >
                    ✦ Ask LOOP
                  </Link>

                  <Link
                    href="/reports"
                    className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    View Report
                  </Link>
                </div>
              </div>
            </section>

            {/* Summary Cards */}
            <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <article
                  key={card.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold ${card.iconStyle}`}
                    >
                      {card.icon}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${card.changeStyle}`}
                    >
                      {card.change}
                    </span>
                  </div>

                  <p className="mt-5 text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-1 text-3xl font-bold tracking-tight">
                    {card.value}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {card.description}
                  </p>
                </article>
              ))}
            </section>

            {/* Main Analytics */}
            <section className="mt-7 grid gap-6 xl:grid-cols-3">
              {/* Sentiment Overview */}
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">
                      Sentiment Overview
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Distribution across all customer feedback
                    </p>
                  </div>

                  <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none">
                    <option>Last 30 days</option>
                    <option>Last 7 days</option>
                    <option>Last 3 months</option>
                  </select>
                </div>

                <div className="mt-8 space-y-7">
                  {sentimentData.map((item) => (
                    <div key={item.name}>
                      <div className="mb-2.5 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-semibold">
                            {item.name}
                          </span>

                          <span className="ml-2 text-xs text-slate-400">
                            {item.count} responses
                          </span>
                        </div>

                        <span
                          className={`text-sm font-bold ${item.textStyle}`}
                        >
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
              </article>

              {/* AI Insight */}
              <article className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 to-violet-700 p-6 text-white shadow-lg">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-sm font-bold">
                      AI
                    </span>

                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                      New insight
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold">
                    Payment complaints are increasing.
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-blue-100">
                    Feedback mentioning delayed payment
                    confirmation increased by 18% this week.
                  </p>

                  <div className="mt-6 rounded-xl border border-white/15 bg-white/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                      Recommended action
                    </p>

                    <p className="mt-2 text-sm leading-5">
                      Review payment confirmation speed and add a
                      real-time transaction status message.
                    </p>
                  </div>

                  <Link
                    href="/ask-loop"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold"
                  >
                    Explore with Ask LOOP
                    <span>→</span>
                  </Link>
                </div>
              </article>
            </section>

            {/* Themes */}
            <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">
                    Trending Feedback Themes
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Topics customers are discussing most
                  </p>
                </div>

                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
                >
                  View all themes
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {themes.map((theme, index) => (
                  <article
                    key={theme.name}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold shadow-sm">
                        {index + 1}
                      </span>

                      <span className="text-xs font-bold text-emerald-600">
                        {theme.trend}
                      </span>
                    </div>

                    <h4 className="mt-5 font-bold">
                      {theme.name}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      {theme.count} mentions
                    </p>

                    <span
                      className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${theme.style}`}
                    >
                      {theme.priority}
                    </span>
                  </article>
                ))}
              </div>
            </section>

            {/* Recent Feedback */}
            <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-6">
                <div>
                  <h3 className="text-lg font-bold">
                    Recent Feedback
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest customer conversations collected by
                    LOOP
                  </p>
                </div>

                <Link
                  href="/feedback"
                  className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  View all feedback
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">
                        Customer
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Feedback
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Source
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Sentiment
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Received
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {recentFeedback.map((item) => (
                      <tr
                        key={`${item.customer}-${item.date}`}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                              {item.initials}
                            </span>

                            <span className="whitespace-nowrap text-sm font-semibold">
                              {item.customer}
                            </span>
                          </div>
                        </td>

                        <td className="max-w-md px-6 py-4 text-sm leading-6 text-slate-600">
                          {item.message}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {item.source}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getSentimentStyle(
                              item.sentiment,
                            )}`}
                          >
                            {item.sentiment}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">
                          {item.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <footer className="mt-8 text-center text-xs text-slate-400">
              Project LOOP • AI Customer Feedback Intelligence
              Platform
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}