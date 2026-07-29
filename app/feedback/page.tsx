"use client";

import Papa from "papaparse";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import LoopShell from "../../components/LoopShell";

type Sentiment =
  | "POSITIVE"
  | "NEUTRAL"
  | "NEGATIVE";

type FeedbackStatus =
  | "NEW"
  | "REVIEWED"
  | "ACTIONED";

type FeedbackItem = {
  id: string;
  customerName?: string | null;
  content: string;
  channel: string;
  sentiment?: Sentiment | null;
  sentimentScore?: number | null;
  status: FeedbackStatus;
  createdAt: string;
  themes?: {
    theme: {
      name: string;
    };
  }[];
};

type CsvRow = {
  content?: string;
  feedback?: string;
  message?: string;
  Message?: string;
  MessageText?: string;
  channel?: string;
  source?: string;
  customer?: string;
  customerName?: string;
  name?: string;
};

type AlertMessage = {
  type: "success" | "error" | "info";
  message: string;
};

type FeedbackServiceError = {
  kind:
    | "unauthorized"
    | "forbidden"
    | "not-found"
    | "server"
    | "network"
    | "unknown";
  title: string;
  message: string;
  technicalMessage?: string;
};

type FeedbackListResponse = {
  data?: FeedbackItem[];
  meta?: {
    totalPages?: number;
    total?: number;
  };
  error?: string;
};

type FeedbackMutationResponse = {
  count?: number;
  error?: string;
};

async function readJsonSafely<T>(
  response: Response,
): Promise<T | null> {
  const responseText = await response.text();

  if (!responseText.trim()) {
    return null;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    return null;
  }
}

function getFeedbackServiceError(
  status?: number,
  technicalMessage?: string,
): FeedbackServiceError {
  if (status === 401) {
    return {
      kind: "unauthorized",
      title: "Feedback workspace is not connected",
      message:
        "The frontend is ready, but the current login session does not contain a valid workspace context. Backend authentication setup is required to load live feedback.",
      technicalMessage,
    };
  }

  if (status === 403) {
    return {
      kind: "forbidden",
      title: "Workspace access unavailable",
      message:
        "This account does not currently have permission to view feedback for the selected workspace.",
      technicalMessage,
    };
  }

  if (status === 404) {
    return {
      kind: "not-found",
      title: "Feedback service not found",
      message:
        "The feedback API route is currently unavailable. The remaining frontend features can still be reviewed.",
      technicalMessage,
    };
  }

  if (status && status >= 500) {
    return {
      kind: "server",
      title: "Feedback service temporarily unavailable",
      message:
        "The server could not load feedback at this time. Please retry after the backend service becomes available.",
      technicalMessage,
    };
  }

  if (!status) {
    return {
      kind: "network",
      title: "Unable to connect to feedback service",
      message:
        "The application could not reach the feedback API. Check the development server and try again.",
      technicalMessage,
    };
  }

  return {
    kind: "unknown",
    title: "Unable to load feedback",
    message:
      "Feedback data is currently unavailable. Please try again later.",
    technicalMessage,
  };
}

function getFeedbackActionError(
  status: number,
  fallbackMessage?: string,
) {
  if (status === 401) {
    return "This action is unavailable because the current workspace session is not connected. Backend authentication support is required.";
  }

  if (status === 403) {
    return "You do not currently have permission to perform this action.";
  }

  if (status >= 500) {
    return "The feedback service is temporarily unavailable. Please try again later.";
  }

  return (
    fallbackMessage ||
    "Unable to complete the feedback action."
  );
}

const pageLimit = 15;
const maximumCsvSize = 5 * 1024 * 1024;

const channelOptions = [
  "Web Form",
  "App Review",
  "Support Ticket",
  "Survey",
  "Social Media",
  "Email",
  "CSV Import",
];

function getSentimentStyle(
  sentiment?: string | null,
) {
  if (sentiment === "POSITIVE") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (sentiment === "NEGATIVE") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function getStatusStyle(status: FeedbackStatus) {
  if (status === "ACTIONED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "REVIEWED") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-violet-200 bg-violet-50 text-violet-700";
}

function formatLabel(value?: string | null) {
  if (!value) {
    return "Neutral";
  }

  return value
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letter) =>
      letter.toUpperCase(),
    );
}

function getInitials(name?: string | null) {
  const customerName =
    name?.trim() || "Anonymous Customer";

  return customerName
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function FeedbackPage() {
  const csvInputRef =
    useRef<HTMLInputElement>(null);

  const [feedbackList, setFeedbackList] =
    useState<FeedbackItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [fetchError, setFetchError] =
    useState<FeedbackServiceError | null>(
      null,
    );

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [
    sentimentFilter,
    setSentimentFilter,
  ] = useState("All");

  const [channelFilter, setChannelFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [showForm, setShowForm] =
    useState(false);

  const [showCsvModal, setShowCsvModal] =
    useState(false);

  const [
    selectedFeedback,
    setSelectedFeedback,
  ] = useState<FeedbackItem | null>(null);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalCount, setTotalCount] =
    useState(0);

  const [customerName, setCustomerName] =
    useState("");

  const [content, setContent] = useState("");

  const [channel, setChannel] =
    useState("Web Form");

  const [formError, setFormError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [csvUploading, setCsvUploading] =
    useState(false);

  const [csvFileName, setCsvFileName] =
    useState("");

  const [alertMessage, setAlertMessage] =
    useState<AlertMessage | null>(null);

  const fetchFeedback = useCallback(
    async (showRefreshState = false) => {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setFetchError(null);

      try {
        const params = new URLSearchParams();

        params.set("page", page.toString());
        params.set("limit", pageLimit.toString());

        if (debouncedSearch.trim()) {
          params.set(
            "search",
            debouncedSearch.trim(),
          );
        }

        if (sentimentFilter !== "All") {
          params.set(
            "sentiment",
            sentimentFilter,
          );
        }

        if (channelFilter !== "All") {
          params.set("channel", channelFilter);
        }

        if (statusFilter !== "All") {
          params.set("status", statusFilter);
        }

        const response = await fetch(
          `/api/feedback?${params.toString()}`,
          {
            cache: "no-store",
          },
        );

        const result =
          await readJsonSafely<FeedbackListResponse>(
            response,
          );

        if (!response.ok) {
          setFeedbackList([]);
          setTotalPages(1);
          setTotalCount(0);

          setFetchError(
            getFeedbackServiceError(
              response.status,
              result?.error,
            ),
          );

          return;
        }

        setFeedbackList(result?.data || []);

        setTotalPages(
          Math.max(
            result?.meta?.totalPages || 1,
            1,
          ),
        );

        setTotalCount(result?.meta?.total || 0);
      } catch (error) {
        setFeedbackList([]);
        setTotalPages(1);
        setTotalCount(0);

        setFetchError(
          getFeedbackServiceError(
            undefined,
            error instanceof Error
              ? error.message
              : undefined,
          ),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      page,
      debouncedSearch,
      sentimentFilter,
      channelFilter,
      statusFilter,
    ],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 450);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    sentimentFilter,
    channelFilter,
    statusFilter,
  ]);

  useEffect(() => {
    void fetchFeedback();
  }, [fetchFeedback]);

  useEffect(() => {
    if (!alertMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setAlertMessage(null);
    }, 3500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [alertMessage]);

  const currentPageStats = useMemo(() => {
    const positive = feedbackList.filter(
      (item) =>
        item.sentiment === "POSITIVE",
    ).length;

    const negative = feedbackList.filter(
      (item) =>
        item.sentiment === "NEGATIVE",
    ).length;

    const newItems = feedbackList.filter(
      (item) => item.status === "NEW",
    ).length;

    return {
      positive,
      negative,
      newItems,
    };
  }, [feedbackList]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    sentimentFilter !== "All" ||
    channelFilter !== "All" ||
    statusFilter !== "All";

  function resetFeedbackForm() {
    setCustomerName("");
    setContent("");
    setChannel("Web Form");
    setFormError("");
  }

  function closeFeedbackForm() {
    resetFeedbackForm();
    setShowForm(false);
  }

  function resetFilters() {
    setSearch("");
    setDebouncedSearch("");
    setSentimentFilter("All");
    setChannelFilter("All");
    setStatusFilter("All");
    setPage(1);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setFormError("");

    if (!content.trim()) {
      setFormError(
        "Please enter customer feedback text.",
      );
      return;
    }

    if (content.trim().length < 5) {
      setFormError(
        "Feedback must contain at least 5 characters.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/feedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName:
              customerName.trim() ||
              "Anonymous Customer",
            content: content.trim(),
            channel,
          }),
        },
      );

      const data =
        await readJsonSafely<FeedbackMutationResponse>(
          response,
        );

      if (!response.ok) {
        setFormError(
          getFeedbackActionError(
            response.status,
            data?.error,
          ),
        );
        return;
      }

      closeFeedbackForm();

      setAlertMessage({
        type: "success",
        message:
          "Feedback saved and sent for AI classification.",
      });

      if (page === 1) {
        await fetchFeedback(true);
      } else {
        setPage(1);
      }
    } catch {
      setFormError(
        "The feedback service could not be reached. Please try again after the backend connection is available.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleCsvFileUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAlertMessage(null);
    setCsvFileName(file.name);

    const isCsv =
      file.type === "text/csv" ||
      file.name.toLowerCase().endsWith(".csv");

    if (!isCsv) {
      setAlertMessage({
        type: "error",
        message:
          "Please select a valid CSV file.",
      });

      event.target.value = "";
      setCsvFileName("");
      return;
    }

    if (file.size > maximumCsvSize) {
      setAlertMessage({
        type: "error",
        message:
          "CSV file must be smaller than 5 MB.",
      });

      event.target.value = "";
      setCsvFileName("");
      return;
    }

    setCsvUploading(true);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) =>
        header.trim(),

      complete: async (results) => {
        try {
          const parsedItems = results.data
            .map((row) => {
              const feedbackContent =
                row.content ||
                row.feedback ||
                row.message ||
                row.Message ||
                row.MessageText ||
                "";

              return {
                content:
                  feedbackContent.trim(),
                channel:
                  row.channel?.trim() ||
                  row.source?.trim() ||
                  "CSV Import",
                customerName:
                  row.customer?.trim() ||
                  row.customerName?.trim() ||
                  row.name?.trim() ||
                  "CSV Customer",
              };
            })
            .filter(
              (item) =>
                item.content.length > 0,
            );

          if (parsedItems.length === 0) {
            setAlertMessage({
              type: "error",
              message:
                "No valid feedback found. Expected content, customer and channel columns.",
            });
            return;
          }

          const response = await fetch(
            "/api/feedback/bulk",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                items: parsedItems,
              }),
            },
          );

          const data =
            await readJsonSafely<FeedbackMutationResponse>(
              response,
            );

          if (!response.ok) {
            setAlertMessage({
              type: "error",
              message:
                getFeedbackActionError(
                  response.status,
                  data?.error,
                ),
            });
            return;
          }

          setAlertMessage({
            type: "success",
            message: `${data?.count || parsedItems.length} feedback entries imported successfully.`,
          });

          if (page === 1) {
            await fetchFeedback(true);
          } else {
            setPage(1);
          }
        } catch {
          setAlertMessage({
            type: "error",
            message:
              "The feedback service could not be reached. CSV data was not uploaded.",
          });
        } finally {
          setCsvUploading(false);
          setCsvFileName("");

          if (csvInputRef.current) {
            csvInputRef.current.value = "";
          }
        }
      },

      error: () => {
        setCsvUploading(false);
        setCsvFileName("");

        setAlertMessage({
          type: "error",
          message:
            "Unable to read the selected CSV file.",
        });

        if (csvInputRef.current) {
          csvInputRef.current.value = "";
        }
      },
    });
  }

  function downloadCsvTemplate() {
    const templateContent = [
      "content,customer,channel",
      '"The application is easy to use","Ananya R","Web Form"',
      '"Payment confirmation was delayed","Rahul K","App Review"',
    ].join("\n");

    const blob = new Blob([templateContent], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download =
      "loop-feedback-template.csv";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <LoopShell
      title="Feedback Intelligence Inbox"
      subtitle="Ingest, filter and manage workspace customer feedback in real time."
    >
      <div className="relative space-y-7">
        {alertMessage && (
          <div
            className={`fixed right-4 top-24 z-[70] flex max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl sm:right-8 ${
              alertMessage.type === "success"
                ? "border-emerald-200"
                : alertMessage.type === "error"
                  ? "border-rose-200"
                  : "border-blue-200"
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold ${
                alertMessage.type === "success"
                  ? "bg-emerald-100 text-emerald-700"
                  : alertMessage.type === "error"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {alertMessage.type === "success"
                ? "✓"
                : alertMessage.type === "error"
                  ? "!"
                  : "i"}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-950">
                {alertMessage.type === "success"
                  ? "Success"
                  : alertMessage.type === "error"
                    ? "Something went wrong"
                    : "Information"}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                {alertMessage.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setAlertMessage(null)
              }
              aria-label="Close message"
              className="text-slate-400 transition hover:text-slate-700"
            >
              ×
            </button>
          </div>
        )}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-6 text-white shadow-xl sm:p-8">
          <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  Live Supabase Inbox
                </span>

                <span className="rounded-full bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-200">
                  Multi-tenant workspace
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                Unified Feedback Intelligence
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                Collect individual feedback, import
                CSV files and trigger automatic
                sentiment and theme classification.
              </p>

              <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                <HeroFeature>
                  Live database
                </HeroFeature>

                <HeroFeature>
                  AI classification
                </HeroFeature>

                <HeroFeature>
                  CSV ingestion
                </HeroFeature>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
              <button
                type="button"
                onClick={() => {
                  setShowCsvModal(
                    (previous) => !previous,
                  );
                  setShowForm(false);
                }}
                className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-left text-white backdrop-blur transition hover:bg-white/20"
              >
                <span>
                  <span className="block text-sm font-bold">
                    CSV Bulk Upload
                  </span>

                  <span className="mt-1 block text-xs text-slate-300">
                    Import multiple entries
                  </span>
                </span>

                <UploadIcon />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(
                    (previous) => !previous,
                  );
                  setShowCsvModal(false);
                }}
                className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 text-left text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                <span>
                  <span className="block text-sm font-bold">
                    Add Feedback
                  </span>

                  <span className="mt-1 block text-xs text-slate-500">
                    Create single entry
                  </span>
                </span>

                <PlusIcon />
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Workspace Entries"
            value={totalCount}
            description="Total database records"
            badge="Live DB"
            tone="blue"
            icon={<DatabaseIcon />}
          />

          <SummaryCard
            title="Positive Sentiment"
            value={currentPageStats.positive}
            description="Visible on current page"
            badge="Current page"
            tone="emerald"
            icon={<PositiveIcon />}
          />

          <SummaryCard
            title="Needs Attention"
            value={currentPageStats.negative}
            description="Negative feedback visible"
            badge="Review"
            tone="rose"
            icon={<WarningIcon />}
          />

          <SummaryCard
            title="New Entries"
            value={currentPageStats.newItems}
            description="Waiting for review"
            badge="Pending"
            tone="violet"
            icon={<NewIcon />}
          />
        </section>

        {showCsvModal && (
          <section className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-lg">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-violet-50 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                  <UploadIcon />
                </span>

                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    CSV Bulk Ingestion
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Upload multiple customer feedback
                    records in one operation.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCsvModal(false)
                }
                aria-label="Close CSV upload"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                ×
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-7 text-center transition hover:border-blue-300 hover:bg-blue-50/50 sm:p-10">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
                  <CsvIcon />
                </span>

                <h3 className="mt-5 font-bold text-slate-950">
                  Select a CSV file
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  Required feedback column:
                  <code className="mx-1 rounded bg-slate-200 px-1.5 py-0.5 text-xs">
                    content
                  </code>
                  or
                  <code className="mx-1 rounded bg-slate-200 px-1.5 py-0.5 text-xs">
                    feedback
                  </code>
                  . Optional columns are customer and
                  channel.
                </p>

                <label className="mx-auto mt-6 flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
                  <UploadIcon />

                  Choose CSV File

                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    disabled={csvUploading}
                    onChange={
                      handleCsvFileUpload
                    }
                    className="hidden"
                  />
                </label>

                {csvFileName && (
                  <p className="mt-4 text-xs font-semibold text-blue-700">
                    Selected: {csvFileName}
                  </p>
                )}

                {csvUploading && (
                  <div className="mx-auto mt-5 max-w-md">
                    <div className="h-2 overflow-hidden rounded-full bg-blue-100">
                      <div className="h-full w-3/4 animate-pulse rounded-full bg-gradient-to-r from-blue-600 to-violet-600" />
                    </div>

                    <p className="mt-3 text-xs font-semibold text-blue-700">
                      Parsing and uploading feedback…
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Need the correct CSV format?
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Download a ready-to-use sample
                    template.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={downloadCsvTemplate}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  <DownloadIcon />

                  Download Template
                </button>
              </div>
            </div>
          </section>
        )}

        {showForm && (
          <section className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-lg">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-200">
                  <MessageIcon />
                </span>

                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    Add Customer Feedback
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Save a new feedback entry and
                    trigger AI classification.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeFeedbackForm}
                aria-label="Close feedback form"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 p-6 sm:p-8 md:grid-cols-2"
            >
              <FormField label="Customer name">
                <input
                  id="customerName"
                  value={customerName}
                  onChange={(event) => {
                    setCustomerName(
                      event.target.value,
                    );
                    setFormError("");
                  }}
                  placeholder="Example: Rahul Sharma"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </FormField>

              <FormField label="Channel source">
                <select
                  id="channel"
                  value={channel}
                  onChange={(event) =>
                    setChannel(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  {channelOptions
                    .filter(
                      (option) =>
                        option !== "CSV Import",
                    )
                    .map((option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    ))}
                </select>
              </FormField>

              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="content"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Feedback content
                    <span className="ml-1 text-rose-500">
                      *
                    </span>
                  </label>

                  <span className="text-xs text-slate-400">
                    {content.length}/2000
                  </span>
                </div>

                <textarea
                  id="content"
                  rows={5}
                  required
                  maxLength={2000}
                  value={content}
                  onChange={(event) => {
                    setContent(event.target.value);
                    setFormError("");
                  }}
                  placeholder="Enter the customer's feedback message…"
                  className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {formError && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 md:col-span-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100">
                    !
                  </span>

                  {formError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 md:col-span-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeFeedbackForm}
                  disabled={submitting}
                  className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner />

                      Saving Feedback…
                    </>
                  ) : (
                    <>
                      Save Feedback

                      <ArrowIcon />
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-bold text-slate-950">
                Search and Filters
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Find feedback by customer, message,
                sentiment, channel or status.
              </p>
            </div>

            <div className="flex gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                >
                  Clear Filters
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  void fetchFeedback(true)
                }
                disabled={refreshing}
                className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                <RefreshIcon
                  spinning={refreshing}
                />

                {refreshing
                  ? "Refreshing"
                  : "Refresh"}
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search customer or feedback…"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <FilterSelect
              label="Sentiment"
              value={sentimentFilter}
              onChange={setSentimentFilter}
              options={[
                {
                  value: "All",
                  label: "All sentiments",
                },
                {
                  value: "POSITIVE",
                  label: "Positive",
                },
                {
                  value: "NEUTRAL",
                  label: "Neutral",
                },
                {
                  value: "NEGATIVE",
                  label: "Negative",
                },
              ]}
            />

            <FilterSelect
              label="Channel"
              value={channelFilter}
              onChange={setChannelFilter}
              options={[
                {
                  value: "All",
                  label: "All channels",
                },
                ...channelOptions.map(
                  (option) => ({
                    value: option,
                    label: option,
                  }),
                ),
              ]}
            />

            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                {
                  value: "All",
                  label: "All statuses",
                },
                {
                  value: "NEW",
                  label: "New",
                },
                {
                  value: "REVIEWED",
                  label: "Reviewed",
                },
                {
                  value: "ACTIONED",
                  label: "Actioned",
                },
              ]}
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-950">
                  Workspace Feedback
                </h2>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {totalCount} total
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Showing {feedbackList.length} entries
                on page {page}.
              </p>
            </div>

            <p className="text-xs font-semibold text-slate-400">
              Page {page} of {totalPages}
            </p>
          </div>

          {loading ? (
            <FeedbackSkeleton />
          ) : fetchError ? (
            <ErrorState
              error={fetchError}
              onRetry={() =>
                void fetchFeedback()
              }
            />
          ) : feedbackList.length === 0 ? (
            <EmptyState
              hasFilters={hasActiveFilters}
              onClear={resetFilters}
              onAdd={() => {
                setShowForm(true);
                setShowCsvModal(false);
              }}
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1120px] text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <TableHeading>
                        Customer
                      </TableHeading>

                      <TableHeading>
                        Feedback
                      </TableHeading>

                      <TableHeading>
                        Themes
                      </TableHeading>

                      <TableHeading>
                        Channel
                      </TableHeading>

                      <TableHeading>
                        Sentiment
                      </TableHeading>

                      <TableHeading>
                        Status
                      </TableHeading>

                      <TableHeading>
                        Date
                      </TableHeading>

                      <TableHeading>
                        Action
                      </TableHeading>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {feedbackList.map((item) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-xs font-bold text-white">
                              {getInitials(
                                item.customerName,
                              )}
                            </span>

                            <div className="min-w-0">
                              <p className="max-w-40 truncate text-sm font-bold text-slate-900">
                                {item.customerName ||
                                  "Anonymous Customer"}
                              </p>

                              <p className="mt-0.5 max-w-32 truncate text-xs text-slate-400">
                                {item.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="max-w-md px-6 py-5">
                          <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                            {item.content}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex max-w-52 flex-wrap gap-1.5">
                            {item.themes &&
                            item.themes.length >
                              0 ? (
                              item.themes
                                .slice(0, 3)
                                .map((themeItem) => (
                                  <span
                                    key={
                                      themeItem.theme
                                        .name
                                    }
                                    className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700"
                                  >
                                    {
                                      themeItem.theme
                                        .name
                                    }
                                  </span>
                                ))
                            ) : (
                              <span className="text-xs text-slate-400">
                                Uncategorized
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-slate-600">
                          {item.channel}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getSentimentStyle(
                              item.sentiment,
                            )}`}
                          >
                            {formatLabel(
                              item.sentiment,
                            )}
                          </span>

                          {typeof item.sentimentScore ===
                            "number" && (
                            <p className="mt-1 text-[10px] font-semibold text-slate-400">
                              {Math.round(
                                item.sentimentScore *
                                  100,
                              )}
                              % confidence
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusStyle(
                              item.status,
                            )}`}
                          >
                            {formatLabel(
                              item.status,
                            )}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-5">
                          <p className="text-xs font-semibold text-slate-600">
                            {formatDate(
                              item.createdAt,
                            )}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {formatTime(
                              item.createdAt,
                            )}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedFeedback(
                                item,
                              )
                            }
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 lg:hidden">
                {feedbackList.map((item) => (
                  <article
                    key={item.id}
                    className="p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-xs font-bold text-white">
                        {getInitials(
                          item.customerName,
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-900">
                              {item.customerName ||
                                "Anonymous Customer"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {item.channel} ·{" "}
                              {formatDate(
                                item.createdAt,
                              )}
                            </p>
                          </div>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold ${getSentimentStyle(
                              item.sentiment,
                            )}`}
                          >
                            {formatLabel(
                              item.sentiment,
                            )}
                          </span>
                        </div>

                        <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
                          {item.content}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] font-bold ${getStatusStyle(
                              item.status,
                            )}`}
                          >
                            {formatLabel(
                              item.status,
                            )}
                          </span>

                          {item.themes
                            ?.slice(0, 2)
                            .map((themeItem) => (
                              <span
                                key={
                                  themeItem.theme.name
                                }
                                className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700"
                              >
                                {
                                  themeItem.theme
                                    .name
                                }
                              </span>
                            ))}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedFeedback(item)
                          }
                          className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                        >
                          View Full Feedback
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs font-semibold text-slate-500">
              Page {page} of {totalPages} ·{" "}
              {totalCount} total entries
            </p>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() =>
                  setPage((previous) =>
                    Math.max(previous - 1, 1),
                  )
                }
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <button
                type="button"
                disabled={
                  page >= totalPages || loading
                }
                onClick={() =>
                  setPage((previous) =>
                    Math.min(
                      previous + 1,
                      totalPages,
                    ),
                  )
                }
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        </section>

        {selectedFeedback && (
          <FeedbackDetailModal
            item={selectedFeedback}
            onClose={() =>
              setSelectedFeedback(null)
            }
          />
        )}
      </div>
    </LoopShell>
  );
}

function SummaryCard({
  title,
  value,
  description,
  badge,
  tone,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  badge: string;
  tone:
    | "blue"
    | "emerald"
    | "rose"
    | "violet";
  icon: ReactNode;
}) {
  const styles = {
    blue: {
      icon: "bg-blue-100 text-blue-700",
      badge: "bg-blue-50 text-blue-700",
      line: "from-blue-600 to-cyan-500",
    },
    emerald: {
      icon: "bg-emerald-100 text-emerald-700",
      badge:
        "bg-emerald-50 text-emerald-700",
      line: "from-emerald-600 to-teal-500",
    },
    rose: {
      icon: "bg-rose-100 text-rose-700",
      badge: "bg-rose-50 text-rose-700",
      line: "from-rose-600 to-orange-500",
    },
    violet: {
      icon: "bg-violet-100 text-violet-700",
      badge:
        "bg-violet-50 text-violet-700",
      line: "from-violet-600 to-fuchsia-500",
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
          {badge}
        </span>
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-black text-slate-950">
        {value.toLocaleString()}
      </p>

      <p className="mt-2 text-xs text-slate-400">
        {description}
      </p>
    </article>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      {children}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div>
      <label className="sr-only">
        {label}
      </label>

      <select
        value={value}
        aria-label={label}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option
            key={`${label}-${option.value}`}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
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

function FeedbackSkeleton() {
  return (
    <div className="space-y-3 p-5 sm:p-6">
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <div
            key={index}
            className="flex animate-pulse gap-4 rounded-2xl border border-slate-100 p-4"
          >
            <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-200" />

            <div className="flex-1 space-y-3">
              <div className="h-4 w-40 rounded bg-slate-200" />

              <div className="h-3 w-full rounded bg-slate-100" />

              <div className="h-3 w-2/3 rounded bg-slate-100" />
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: FeedbackServiceError;
  onRetry: () => void;
}) {
  const isWorkspaceIssue =
    error.kind === "unauthorized" ||
    error.kind === "forbidden";

  return (
    <div className="px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-blue-50 shadow-sm dark:border-amber-900 dark:from-amber-950 dark:via-slate-900 dark:to-blue-950">
        <div className="grid gap-0 lg:grid-cols-[1fr_240px]">
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                <WarningIcon />
              </span>

              <div>
                <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                  Frontend ready
                </span>

                <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
                  {error.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {error.message}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={onRetry}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    <RefreshIcon spinning={false} />

                    Retry Connection
                  </button>

                  <a
                    href="/dashboard"
                    className="flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Return to Dashboard
                  </a>
                </div>

                {error.technicalMessage && (
                  <details className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4 text-left dark:border-slate-700 dark:bg-slate-900/60">
                    <summary className="cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300">
                      Technical details
                    </summary>

                    <p className="mt-3 break-words font-mono text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                      {error.technicalMessage}
                    </p>
                  </details>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-amber-200 bg-slate-950 p-6 text-white dark:border-amber-900 lg:border-l lg:border-t-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-300">
              Status
            </p>

            <div className="mt-5 space-y-4">
              <ServiceStatusRow
                label="Frontend interface"
                status="Ready"
                ready
              />

              <ServiceStatusRow
                label="Responsive design"
                status="Ready"
                ready
              />

              <ServiceStatusRow
                label="API connection"
                status="Waiting"
              />

              <ServiceStatusRow
                label="Workspace session"
                status={
                  isWorkspaceIssue
                    ? "Required"
                    : "Checking"
                }
              />
            </div>

            <p className="mt-6 text-xs leading-5 text-slate-400">
              No backend authentication or workspace
              logic was changed by this frontend
              update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceStatusRow({
  label,
  status,
  ready = false,
}: {
  label: string;
  status: string;
  ready?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span
        className={`flex items-center gap-2 text-xs font-bold ${
          ready
            ? "text-emerald-300"
            : "text-amber-300"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            ready
              ? "bg-emerald-400"
              : "bg-amber-400"
          }`}
        />

        {status}
      </span>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onClear,
  onAdd,
}: {
  hasFilters: boolean;
  onClear: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <MessageIcon />
      </span>

      <h3 className="mt-5 text-lg font-bold text-slate-950">
        {hasFilters
          ? "No matching feedback"
          : "No feedback available"}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Try changing or clearing the active filters."
          : "Add your first customer feedback entry to start the analysis."}
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            Clear Filters
          </button>
        )}

        <button
          type="button"
          onClick={onAdd}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Add Feedback
        </button>
      </div>
    </div>
  );
}

function FeedbackDetailModal({
  item,
  onClose,
}: {
  item: FeedbackItem;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close feedback details"
        onClick={onClose}
        className="absolute inset-0"
      />

      <article className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-violet-50 p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-sm font-bold text-white">
              {getInitials(item.customerName)}
            </span>

            <div>
              <h3 className="text-lg font-bold text-slate-950">
                {item.customerName ||
                  "Anonymous Customer"}
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {item.id} · {item.channel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold ${getSentimentStyle(
                item.sentiment,
              )}`}
            >
              {formatLabel(item.sentiment)}
            </span>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusStyle(
                item.status,
              )}`}
            >
              {formatLabel(item.status)}
            </span>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Feedback message
            </p>

            <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
              {item.content}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Detected themes
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {item.themes &&
              item.themes.length > 0 ? (
                item.themes.map((themeItem) => (
                  <span
                    key={themeItem.theme.name}
                    className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
                  >
                    {themeItem.theme.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">
                  No themes detected.
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DetailCard
              label="Channel"
              value={item.channel}
            />

            <DetailCard
              label="Created"
              value={`${formatDate(
                item.createdAt,
              )} · ${formatTime(
                item.createdAt,
              )}`}
            />
          </div>
        </div>
      </article>
    </div>
  );
}

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
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

function LoadingSpinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />

      <path
        strokeLinecap="round"
        d="m16 16 4 4"
      />
    </svg>
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
      className={`h-4 w-4 ${
        spinning ? "animate-spin" : ""
      }`}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7v5h-5M4 17v-5h5"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 9a7 7 0 0 1 12-2l2 2M4 15l2 2a7 7 0 0 0 12-2"
      />
    </svg>
  );
}

function UploadIcon() {
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
        d="M12 16V4M7 9l5-5 5 5"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 14v5h14v-5"
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

function PlusIcon() {
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
        d="M12 5v14M5 12h14"
      />
    </svg>
  );
}

function ArrowIcon() {
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
        d="M5 12h14M14 7l5 5-5 5"
      />
    </svg>
  );
}

function CsvIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 3h9l4 4v14H6V3Z"
      />

      <path
        strokeLinecap="round"
        d="M9 12h6M9 16h6M9 8h2"
      />
    </svg>
  );
}

function MessageIcon() {
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

function DatabaseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <ellipse
        cx="12"
        cy="5"
        rx="8"
        ry="3"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"
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

function NewIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="4"
      />

      <path
        strokeLinecap="round"
        d="M12 8v8M8 12h8"
      />
    </svg>
  );
}