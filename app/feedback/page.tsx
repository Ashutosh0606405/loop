"use client";

import { FormEvent, useMemo, useState } from "react";
import LoopShell from "../../components/LoopShell";

type Sentiment = "Positive" | "Neutral" | "Negative";

type Feedback = {
  id: number;
  customer: string;
  email: string;
  message: string;
  source: string;
  sentiment: Sentiment;
  theme: string;
  date: string;
};

const initialFeedback: Feedback[] = [
  {
    id: 1,
    customer: "Ananya Sharma",
    email: "ananya@example.com",
    message:
      "The latest dashboard update is clean and very easy to use.",
    source: "App Review",
    sentiment: "Positive",
    theme: "User Experience",
    date: "Today, 10:24 AM",
  },
  {
    id: 2,
    customer: "Rahul Kumar",
    email: "rahul@example.com",
    message:
      "Payment succeeded, but the confirmation message arrived late.",
    source: "Support Ticket",
    sentiment: "Neutral",
    theme: "Payments",
    date: "Today, 9:40 AM",
  },
  {
    id: 3,
    customer: "Priya Singh",
    email: "priya@example.com",
    message:
      "The checkout page becomes slow when multiple products are added.",
    source: "Survey",
    sentiment: "Negative",
    theme: "Application Speed",
    date: "Yesterday, 5:15 PM",
  },
  {
    id: 4,
    customer: "Arjun Patel",
    email: "arjun@example.com",
    message:
      "The support executive resolved my account issue quickly.",
    source: "Social Media",
    sentiment: "Positive",
    theme: "Customer Support",
    date: "Yesterday, 2:30 PM",
  },
];

function getSentimentStyle(sentiment: Sentiment) {
  if (sentiment === "Positive") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (sentiment === "Negative") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-amber-100 text-amber-700";
}

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] =
    useState<Feedback[]>(initialFeedback);

  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] =
    useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);

  const [customer, setCustomer] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [source, setSource] = useState("Survey");
  const [sentiment, setSentiment] =
    useState<Sentiment>("Neutral");
  const [error, setError] = useState("");

  const filteredFeedback = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return feedbackList.filter((item) => {
      const matchesSearch =
        item.customer.toLowerCase().includes(searchValue) ||
        item.message.toLowerCase().includes(searchValue) ||
        item.theme.toLowerCase().includes(searchValue);

      const matchesSentiment =
        sentimentFilter === "All" ||
        item.sentiment === sentimentFilter;

      const matchesSource =
        sourceFilter === "All" || item.source === sourceFilter;

      return (
        matchesSearch &&
        matchesSentiment &&
        matchesSource
      );
    });
  }, [
    feedbackList,
    search,
    sentimentFilter,
    sourceFilter,
  ]);

  const positiveCount = feedbackList.filter(
    (item) => item.sentiment === "Positive",
  ).length;

  const negativeCount = feedbackList.filter(
    (item) => item.sentiment === "Negative",
  ).length;

  const sourceCount = new Set(
    feedbackList.map((item) => item.source),
  ).size;

  function resetForm() {
    setCustomer("");
    setEmail("");
    setMessage("");
    setSource("Survey");
    setSentiment("Neutral");
    setError("");
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    if (!customer.trim()) {
      setError("Please enter the customer name.");
      return;
    }

    if (!message.trim()) {
      setError("Please enter the feedback message.");
      return;
    }

    const newFeedback: Feedback = {
      id: Date.now(),
      customer: customer.trim(),
      email: email.trim() || "Email not provided",
      message: message.trim(),
      source,
      sentiment,
      theme: "Uncategorized",
      date: "Just now",
    };

    setFeedbackList((previous) => [
      newFeedback,
      ...previous,
    ]);

    resetForm();
    setShowForm(false);
  }

  return (
    <LoopShell
      title="Feedback Intelligence"
      subtitle="Search, filter and manage customer feedback."
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-violet-950 p-7 text-white shadow-xl md:p-9">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
              Unified Feedback Inbox
            </span>

            <h1 className="mt-5 max-w-2xl text-3xl font-bold md:text-4xl">
              Every customer conversation in one intelligent
              workspace.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
              Collect customer feedback, identify sentiment and
              discover recurring themes.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowForm((previous) => !previous)
            }
            className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-50"
          >
            {showForm ? "Close Form" : "+ Add Feedback"}
          </button>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total Feedback",
            value: feedbackList.length,
            detail: "All collected responses",
            icon: "01",
            style: "bg-blue-100 text-blue-700",
          },
          {
            title: "Positive",
            value: positiveCount,
            detail: "Satisfied customers",
            icon: "02",
            style:
              "bg-emerald-100 text-emerald-700",
          },
          {
            title: "Needs Attention",
            value: negativeCount,
            detail: "Negative responses",
            icon: "03",
            style: "bg-rose-100 text-rose-700",
          },
          {
            title: "Active Sources",
            value: sourceCount,
            detail: "Connected channels",
            icon: "04",
            style:
              "bg-violet-100 text-violet-700",
          },
        ].map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-xs font-bold ${card.style}`}
              >
                {card.icon}
              </span>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                Live
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              {card.title}
            </p>

            <p className="mt-1 text-3xl font-bold">
              {card.value}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              {card.detail}
            </p>
          </article>
        ))}
      </section>

      {/* Add Feedback Form */}
      {showForm && (
        <section className="mt-7 rounded-2xl border border-blue-200 bg-white p-6 shadow-lg">
          <h2 className="text-xl font-bold">
            Add New Feedback
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter feedback collected from a customer.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-5 md:grid-cols-2"
          >
            <div>
              <label
                htmlFor="customer"
                className="mb-2 block text-sm font-semibold"
              >
                Customer Name
              </label>

              <input
                id="customer"
                value={customer}
                onChange={(event) =>
                  setCustomer(event.target.value)
                }
                placeholder="Enter customer name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="customer@example.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="source"
                className="mb-2 block text-sm font-semibold"
              >
                Source
              </label>

              <select
                id="source"
                value={source}
                onChange={(event) =>
                  setSource(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
              >
                <option>Survey</option>
                <option>App Review</option>
                <option>Support Ticket</option>
                <option>Social Media</option>
                <option>NPS Survey</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="sentiment"
                className="mb-2 block text-sm font-semibold"
              >
                Sentiment
              </label>

              <select
                id="sentiment"
                value={sentiment}
                onChange={(event) =>
                  setSentiment(
                    event.target.value as Sentiment,
                  )
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
              >
                <option>Positive</option>
                <option>Neutral</option>
                <option>Negative</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-semibold"
              >
                Feedback Message
              </label>

              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                placeholder="Enter customer feedback..."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 md:col-span-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                Save Feedback
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Search and Filters */}
      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-4">
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search customer, message or theme..."
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 lg:col-span-2"
          />

          <select
            value={sentimentFilter}
            onChange={(event) =>
              setSentimentFilter(event.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
          >
            <option value="All">All Sentiments</option>
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(event) =>
              setSourceFilter(event.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
          >
            <option value="All">All Sources</option>
            <option value="Survey">Survey</option>
            <option value="App Review">App Review</option>
            <option value="Support Ticket">
              Support Ticket
            </option>
            <option value="Social Media">
              Social Media
            </option>
            <option value="NPS Survey">NPS Survey</option>
          </select>
        </div>
      </section>

      {/* Feedback Table */}
      <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-lg font-bold">
            Customer Feedback
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredFeedback.length} records found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Feedback</th>
                <th className="px-6 py-4">Theme</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Sentiment</th>
                <th className="px-6 py-4">Received</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredFeedback.map((item) => (
                <tr
                  key={item.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-6 py-5">
                    <p className="whitespace-nowrap text-sm font-semibold">
                      {item.customer}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {item.email}
                    </p>
                  </td>

                  <td className="max-w-lg px-6 py-5 text-sm leading-6 text-slate-600">
                    {item.message}
                  </td>

                  <td className="px-6 py-5">
                    <span className="whitespace-nowrap rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {item.theme}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-600">
                    {item.source}
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getSentimentStyle(
                        item.sentiment,
                      )}`}
                    >
                      {item.sentiment}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-6 py-5 text-xs text-slate-500">
                    {item.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFeedback.length === 0 && (
          <div className="p-12 text-center">
            <p className="font-semibold">
              No feedback found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Change the search text or filters.
            </p>
          </div>
        )}
      </section>
    </LoopShell>
  );
}