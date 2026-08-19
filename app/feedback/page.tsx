"use client";

import { FormEvent, useEffect, useState, ChangeEvent } from "react";
import Papa from "papaparse";
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

function getSentimentStyle(sentiment?: string | null) {
  if (sentiment === "POSITIVE") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (sentiment === "NEGATIVE") {
    return "bg-rose-100 text-rose-700";
  }
  return "bg-amber-100 text-amber-700";
}

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const [channelFilter, setChannelFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState("Web Form");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // CSV Import State
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvMessage, setCsvMessage] = useState("");

  // Reclassify State (Task 6 & Task 8)
  const [reclassifyLoading, setReclassifyLoading] = useState(false);
  const [reclassifyStatus, setReclassifyStatus] = useState("");

  // Fetch Feedback from Backend API
  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "15");
      if (search.trim()) params.set("search", search.trim());
      if (sentimentFilter !== "All") params.set("sentiment", sentimentFilter);
      if (channelFilter !== "All") params.set("channel", channelFilter);
      if (statusFilter !== "All") params.set("status", statusFilter);

      const res = await fetch(`/api/feedback?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setFeedbackList(result.data || []);
        setTotalPages(result.meta?.totalPages || 1);
        setTotalCount(result.meta?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReclassifyAll = async () => {
    setReclassifyLoading(true);
    setReclassifyStatus("");
    try {
      const res = await fetch("/api/feedback/reclassify-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onlyUnclassified: false }),
      });
      const data = await res.json();
      if (res.ok) {
        setReclassifyStatus(`✅ ${data.message} (${data.skippedHumanCount || 0} human-reviewed items protected)`);
        fetchFeedback();
      } else {
        setReclassifyStatus(`⚠️ ${data.error || "Failed to reclassify items"}`);
      }
    } catch (err) {
      setReclassifyStatus("⚠️ Error running re-classification");
    } finally {
      setReclassifyLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      fetchFeedback();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [page, search, sentimentFilter, channelFilter, statusFilter]);

  // Handle Single Feedback Submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!content.trim()) {
      setFormError("Please enter customer feedback text.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim() || "Anonymous Customer",
          content: content.trim(),
          channel,
        }),
      });

      if (res.ok) {
        setCustomerName("");
        setContent("");
        setChannel("Web Form");
        setShowForm(false);
        fetchFeedback();
      } else {
        const data = await res.json();
        setFormError(data.error || "Failed to submit feedback.");
      }
    } catch (err) {
      setFormError("An error occurred while saving feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle CSV Bulk File Upload Parsing
  const handleCsvFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvUploading(true);
    setCsvMessage("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.replace(/^\uFEFF/, "").trim().toLowerCase(),
      complete: async (results) => {
        try {
          const parsedItems = results.data
            .map((row: any) => {
              if (!row || typeof row !== "object") return null;
              // Extract normalized key values
              const getVal = (...keys: string[]) => {
                for (const k of keys) {
                  if (row[k] !== undefined && row[k] !== null && String(row[k]).trim()) {
                    return String(row[k]).trim();
                  }
                }
                return "";
              };

              const content = getVal("content", "feedback", "message", "messagetext", "review", "comment", "text", "details", "description");
              const customerName = getVal("customer", "customername", "customer_name", "name", "author", "user", "email") || "Anonymous Customer";
              const channel = getVal("channel", "source", "type", "platform", "category") || "CSV Bulk Upload";

              return content ? { content, customerName, channel } : null;
            })
            .filter((item): item is { content: string; customerName: string; channel: string } => item !== null);

          if (parsedItems.length === 0) {
            setCsvMessage("⚠️ No valid feedback text entries found in CSV. Please ensure your file has a 'content' or 'feedback' column.");
            setCsvUploading(false);
            return;
          }

          const res = await fetch("/api/feedback/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: parsedItems }),
          });

          const data = await res.json();
          if (res.ok) {
            setCsvMessage(`✅ Successfully imported ${data.count} customer feedback entries into Supabase!`);
            fetchFeedback();
          } else {
            setCsvMessage(`⚠️ ${data.error || "Failed to perform bulk upload."}`);
          }
        } catch (err) {
          setCsvMessage("⚠️ Error processing CSV file format.");
        } finally {
          setCsvUploading(false);
        }
      },
    });
  };

  // Calculate live counts
  const positiveCount = feedbackList.filter((item) => item.sentiment === "POSITIVE").length;
  const negativeCount = feedbackList.filter((item) => item.sentiment === "NEGATIVE").length;
  const newStatusCount = feedbackList.filter((item) => item.status === "NEW").length;

  return (
    <LoopShell
      title="Feedback Intelligence Inbox"
      subtitle="Ingest, filter, and manage workspace customer feedback in real-time."
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-violet-950 p-7 text-white shadow-xl md:p-9">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
              Supabase PostgreSQL Multi-Tenant Inbox
            </span>

            <h1 className="mt-5 max-w-2xl text-3xl font-bold md:text-4xl">
              Unified Feedback Ingestion Engine
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
              Collect single feedback entries, bulk upload CSV files, and trigger AI auto-classification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={reclassifyLoading}
              onClick={handleReclassifyAll}
              className="rounded-xl border border-violet-400/40 bg-violet-500/20 px-4 py-3 text-sm font-semibold text-violet-200 hover:bg-violet-500/30 transition disabled:opacity-50"
            >
              {reclassifyLoading ? "Re-classifying..." : "⚡ Reclassify All (AI)"}
            </button>

            <button
              type="button"
              onClick={async () => {
                const sampleChannels = ["App Store Review", "Support Ticket", "NPS Survey", "Sales Call Note", "Community Post"];
                const sampleContent = [
                  "Simulated Integration: Mobile app crashes whenever user switches tabs rapidly on 5G network.",
                  "Simulated Integration: Customer requested custom export formats (JSON & Parquet) for VoC analytics.",
                  "Simulated Integration: Live chat support response time was under 2 minutes. Excellent service!",
                  "Simulated Integration: Payment gateway throws error 500 when paying with international Visa card.",
                ];
                const randCh = sampleChannels[Math.floor(Math.random() * sampleChannels.length)];
                const randText = sampleContent[Math.floor(Math.random() * sampleContent.length)];
                
                await fetch("/api/feedback", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    customerName: "Simulated Channel User",
                    content: randText,
                    channel: randCh,
                  }),
                });
                fetchFeedback();
              }}
              className="rounded-xl border border-blue-400/40 bg-blue-500/20 px-4 py-3 text-sm font-semibold text-blue-200 hover:bg-blue-500/30 transition"
            >
              ⚡ Simulate Live Channel
            </button>

            <button
              type="button"
              onClick={() => setShowCsvModal((prev) => !prev)}
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              📄 CSV Bulk Upload
            </button>

            <button
              type="button"
              onClick={() => setShowForm((prev) => !prev)}
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-50"
            >
              {showForm ? "Close Form" : "+ Single Feedback"}
            </button>
          </div>
        </div>
      </section>

      {/* TASK 8 FIX: Unclassified Items Banner */}
      {newStatusCount > 0 && (
        <section className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-200 text-amber-900 font-bold text-lg">⚠️</span>
            <div>
              <p className="text-sm font-bold">{newStatusCount} feedback items need AI indexing / classification</p>
              <p className="text-xs text-amber-800">Newly ingested CSV entries require AI auto-classification to become searchable in Ask LOOP.</p>
            </div>
          </div>

          <button
            type="button"
            disabled={reclassifyLoading}
            onClick={handleReclassifyAll}
            className="rounded-xl bg-amber-700 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-amber-800 disabled:opacity-50 shadow-sm"
          >
            {reclassifyLoading ? "Classifying AI..." : "⚡ Classify & Index Now (AI)"}
          </button>
        </section>
      )}

      {reclassifyStatus && (
        <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs font-bold text-blue-900">
          {reclassifyStatus}
        </div>
      )}

      {/* CSV Import Drawer / Modal */}
      {showCsvModal && (
        <section className="mt-7 rounded-2xl border border-blue-200 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">CSV Bulk Ingestion</h2>
              <p className="text-xs text-slate-500 mt-1">Upload CSV files containing customer feedback columns</p>
            </div>
            <button onClick={() => setShowCsvModal(false)} className="text-sm font-bold text-slate-400 hover:text-slate-600">✕ Close</button>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50 hover:bg-blue-50/50 transition">
            <p className="text-sm font-semibold text-slate-700 mb-2">Select a CSV file from your computer</p>
            <p className="text-xs text-slate-400 mb-4">Expected headers: <code>content</code>, <code>customer</code>, <code>channel</code></p>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvFileUpload}
              className="block w-full max-w-md mx-auto text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            {csvUploading && <p className="mt-3 text-xs font-semibold text-blue-600">Uploading and processing CSV...</p>}
            {csvMessage && <p className="mt-3 text-xs font-semibold text-slate-800">{csvMessage}</p>}
          </div>
        </section>
      )}

      {/* Summary Stat Cards */}
      <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Total Workspace Entries", value: totalCount, detail: "Stored in Supabase DB", icon: "📊", style: "bg-blue-100 text-blue-700" },
          { title: "Positive Sentiment", value: positiveCount, detail: "Classified positive", icon: "😊", style: "bg-emerald-100 text-emerald-700" },
          { title: "Needs Attention", value: negativeCount, detail: "Classified negative", icon: "⚠️", style: "bg-rose-100 text-rose-700" },
          { title: "New Status Entries", value: newStatusCount, detail: "Pending review", icon: "🆕", style: "bg-violet-100 text-violet-700" },
        ].map((card) => (
          <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${card.style}`}>{card.icon}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">Live DB</span>
            </div>
            <p className="mt-5 text-sm font-medium text-slate-500">{card.title}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-2 text-xs text-slate-400">{card.detail}</p>
          </article>
        ))}
      </section>

      {/* Single Feedback Submission Form */}
      {showForm && (
        <section className="mt-7 rounded-2xl border border-blue-200 bg-white p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900">Add Customer Feedback</h2>
          <p className="mt-1 text-sm text-slate-500">Ingest a single customer feedback item into your workspace database.</p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="customerName" className="mb-2 block text-sm font-semibold">Customer Name</label>
              <input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="channel" className="mb-2 block text-sm font-semibold">Channel Source</label>
              <select
                id="channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
              >
                <option value="Web Form">Web Form</option>
                <option value="App Review">App Review</option>
                <option value="Support Ticket">Support Ticket</option>
                <option value="Survey">Survey</option>
                <option value="Social Media">Social Media</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="content" className="mb-2 block text-sm font-semibold">Feedback Content *</label>
              <textarea
                id="content"
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter customer feedback text here..."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {formError && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 md:col-span-2">⚠️ {formError}</p>}

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Saving to Supabase..." : "Save Feedback Entry →"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name or message content..."
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 lg:col-span-2"
          />

          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
          >
            <option value="All">All Sentiments</option>
            <option value="POSITIVE">Positive</option>
            <option value="NEUTRAL">Neutral</option>
            <option value="NEGATIVE">Negative</option>
          </select>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
          >
            <option value="All">All Channels</option>
            <option value="Web Form">Web Form</option>
            <option value="App Review">App Review</option>
            <option value="Support Ticket">Support Ticket</option>
            <option value="Survey">Survey</option>
            <option value="Social Media">Social Media</option>
            <option value="CSV Import">CSV Import</option>
          </select>
        </div>
      </section>

      {/* Feedback Table */}
      <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Workspace Feedback Data</h2>
            <p className="mt-1 text-sm text-slate-500">Showing {feedbackList.length} of {totalCount} total entries</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading feedback from Supabase database...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Feedback Content</th>
                  <th className="px-6 py-4 font-semibold">Themes</th>
                  <th className="px-6 py-4 font-semibold">Channel</th>
                  <th className="px-6 py-4 font-semibold">Sentiment</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {feedbackList.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-sm text-slate-900">{item.customerName || "Anonymous Customer"}</td>
                    <td className="max-w-md px-6 py-4 text-sm leading-6 text-slate-600">{item.content}</td>
                    <td className="px-6 py-4">
                      {item.themes && item.themes.length > 0 ? (
                        item.themes.map((t, idx) => (
                          <span key={idx} className="inline-block rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 mr-1">
                            {t.theme.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">Uncategorized</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{item.channel}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getSentimentStyle(item.sentiment)}`}>
                        {item.sentiment || "NEUTRAL"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
          <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </section>
    </LoopShell>
  );
}