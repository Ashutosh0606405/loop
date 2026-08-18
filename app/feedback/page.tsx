"use client";

import Papa from "papaparse";

import {
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
  type:
    | "success"
    | "error"
    | "info";
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

const pageLimit = 15;

const maximumCsvSize =
  5 * 1024 * 1024;

const channelOptions = [
  "Web Form",
  "App Review",
  "Support Ticket",
  "Survey",
  "Social Media",
  "Email",
  "CSV Import",
];

async function readJsonSafely<T>(
  response: Response,
): Promise<T | null> {
  const responseText =
    await response.text();

  if (
    !responseText.trim()
  ) {
    return null;
  }

  try {
    return JSON.parse(
      responseText,
    ) as T;
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
      title:
        "Feedback workspace is not connected",
      message:
        "The current session does not contain valid workspace access for this feedback request.",
      technicalMessage,
    };
  }

  if (status === 403) {
    return {
      kind: "forbidden",
      title:
        "Workspace access unavailable",
      message:
        "This account does not currently have permission to view feedback for this workspace.",
      technicalMessage,
    };
  }

  if (status === 404) {
    return {
      kind: "not-found",
      title:
        "Feedback service unavailable",
      message:
        "The feedback API route could not be found.",
      technicalMessage,
    };
  }

  if (
    status &&
    status >= 500
  ) {
    return {
      kind: "server",
      title:
        "Feedback service temporarily unavailable",
      message:
        "The server could not load feedback at this time. Please try again.",
      technicalMessage,
    };
  }

  if (!status) {
    return {
      kind: "network",
      title:
        "Unable to connect to feedback service",
      message:
        "LOOP could not reach the feedback API. Check the application connection and try again.",
      technicalMessage,
    };
  }

  return {
    kind: "unknown",
    title:
      "Unable to load feedback",
    message:
      "Feedback data is currently unavailable. Please try again.",
    technicalMessage,
  };
}

function getFeedbackActionError(
  status: number,
  fallbackMessage?: string,
) {
  if (status === 401) {
    return "This action is unavailable because the current workspace session is not connected.";
  }

  if (status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (status >= 500) {
    return "The feedback service is temporarily unavailable. Please try again.";
  }

  return (
    fallbackMessage ||
    "Unable to complete the feedback action."
  );
}

function getSentimentStyle(
  sentiment?: Sentiment | null,
) {
  if (
    sentiment === "POSITIVE"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300";
  }

  if (
    sentiment === "NEGATIVE"
  ) {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300";
  }

  if (
    sentiment === "NEUTRAL"
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300";
  }

  return "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400";
}

function getStatusStyle(
  status: FeedbackStatus,
) {
  if (
    status === "ACTIONED"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300";
  }

  if (
    status === "REVIEWED"
  ) {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300";
  }

  return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-300";
}

function formatSentiment(
  value?: Sentiment | null,
) {
  if (!value) {
    return "Unclassified";
  }

  return formatLabel(
    value,
  );
}

function formatLabel(
  value: string,
) {
  return value
    .toLowerCase()
    .replace(
      /(^|\s)\S/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function getInitials(
  name?: string | null,
) {
  const customerName =
    name?.trim() ||
    "Anonymous Customer";

  return (
    customerName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) =>
        word
          .charAt(0)
          .toUpperCase(),
      )
      .join("") || "AC"
  );
}

function formatDate(
  dateValue: string,
) {
  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function formatTime(
  dateValue: string,
) {
  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

export default function FeedbackPage() {
  const csvInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const [
    feedbackList,
    setFeedbackList,
  ] =
    useState<
      FeedbackItem[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    fetchError,
    setFetchError,
  ] =
    useState<
      FeedbackServiceError | null
    >(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  const [
    sentimentFilter,
    setSentimentFilter,
  ] = useState("All");

  const [
    channelFilter,
    setChannelFilter,
  ] = useState("All");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    showForm,
    setShowForm,
  ] =
    useState(false);

  const [
    showCsvModal,
    setShowCsvModal,
  ] =
    useState(false);

  const [
    selectedFeedback,
    setSelectedFeedback,
  ] =
    useState<
      FeedbackItem | null
    >(null);

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    totalPages,
    setTotalPages,
  ] =
    useState(1);

  const [
    totalCount,
    setTotalCount,
  ] =
    useState(0);

  const [
    customerName,
    setCustomerName,
  ] =
    useState("");

  const [
    content,
    setContent,
  ] = useState("");

  const [
    channel,
    setChannel,
  ] =
    useState("Web Form");

  const [
    formError,
    setFormError,
  ] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    csvUploading,
    setCsvUploading,
  ] =
    useState(false);

  const [
    csvFileName,
    setCsvFileName,
  ] =
    useState("");

  const [
    alertMessage,
    setAlertMessage,
  ] =
    useState<
      AlertMessage | null
    >(null);

  const [
    requestVersion,
    setRequestVersion,
  ] =
    useState(0);

  const queryString =
    useMemo(() => {
      const params =
        new URLSearchParams();

      params.set(
        "page",
        page.toString(),
      );

      params.set(
        "limit",
        pageLimit.toString(),
      );

      if (
        debouncedSearch.trim()
      ) {
        params.set(
          "search",
          debouncedSearch.trim(),
        );
      }

      if (
        sentimentFilter !==
        "All"
      ) {
        params.set(
          "sentiment",
          sentimentFilter,
        );
      }

      if (
        channelFilter !==
        "All"
      ) {
        params.set(
          "channel",
          channelFilter,
        );
      }

      if (
        statusFilter !==
        "All"
      ) {
        params.set(
          "status",
          statusFilter,
        );
      }

      return params.toString();
    }, [
      page,
      debouncedSearch,
      sentimentFilter,
      channelFilter,
      statusFilter,
    ]);

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setLoading(true);

          setFetchError(
            null,
          );

          setPage(1);

          setDebouncedSearch(
            search,
          );

          setRequestVersion(
            (value) =>
              value + 1,
          );
        },
        450,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [search]);

  useEffect(() => {
    const controller =
      new AbortController();

    let active = true;

    async function loadFeedback() {
      try {
        const response =
          await fetch(
            `/api/feedback?${queryString}`,
            {
              cache:
                "no-store",
              signal:
                controller.signal,
            },
          );

        const result =
          await readJsonSafely<FeedbackListResponse>(
            response,
          );

        if (!active) {
          return;
        }

        if (
          !response.ok
        ) {
          setFeedbackList(
            [],
          );

          setTotalPages(
            1,
          );

          setTotalCount(
            0,
          );

          setFetchError(
            getFeedbackServiceError(
              response.status,
              result?.error,
            ),
          );

          return;
        }

        setFeedbackList(
          result?.data ??
            [],
        );

        setTotalPages(
          Math.max(
            result?.meta
              ?.totalPages ??
              1,
            1,
          ),
        );

        setTotalCount(
          result?.meta
            ?.total ?? 0,
        );

        setFetchError(
          null,
        );
      } catch (error) {
        if (
          controller.signal
            .aborted ||
          !active
        ) {
          return;
        }

        setFeedbackList(
          [],
        );

        setTotalPages(
          1,
        );

        setTotalCount(
          0,
        );

        setFetchError(
          getFeedbackServiceError(
            undefined,
            error instanceof
              Error
              ? error.message
              : undefined,
          ),
        );
      } finally {
        if (active) {
          setLoading(
            false,
          );

          setRefreshing(
            false,
          );
        }
      }
    }

    void loadFeedback();

    return () => {
      active = false;

      controller.abort();
    };
  }, [
    queryString,
    requestVersion,
  ]);

  useEffect(() => {
    if (
      !alertMessage
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setAlertMessage(
            null,
          );
        },
        3500,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [alertMessage]);

  const currentPageStats =
    useMemo(() => {
      const positive =
        feedbackList.filter(
          (item) =>
            item.sentiment ===
            "POSITIVE",
        ).length;

      const negative =
        feedbackList.filter(
          (item) =>
            item.sentiment ===
            "NEGATIVE",
        ).length;

      const newItems =
        feedbackList.filter(
          (item) =>
            item.status ===
            "NEW",
        ).length;

      const unclassified =
        feedbackList.filter(
          (item) =>
            !item.sentiment,
        ).length;

      return {
        positive,
        negative,
        newItems,
        unclassified,
      };
    }, [feedbackList]);

  const hasActiveFilters =
    search
      .trim()
      .length > 0 ||
    sentimentFilter !==
      "All" ||
    channelFilter !==
      "All" ||
    statusFilter !==
      "All";

  function beginRequest(
    type:
      | "loading"
      | "refreshing" =
      "loading",
  ) {
    setFetchError(null);

    if (
      type ===
      "refreshing"
    ) {
      setRefreshing(
        true,
      );
    } else {
      setLoading(true);
    }

    setRequestVersion(
      (value) =>
        value + 1,
    );
  }

  function resetFeedbackForm() {
    setCustomerName("");
    setContent("");
    setChannel(
      "Web Form",
    );
    setFormError("");
  }

  function closeFeedbackForm() {
    resetFeedbackForm();

    setShowForm(
      false,
    );
  }

  function changeSentimentFilter(
    value: string,
  ) {
    setLoading(true);
    setFetchError(null);
    setPage(1);

    setSentimentFilter(
      value,
    );

    setRequestVersion(
      (current) =>
        current + 1,
    );
  }

  function changeChannelFilter(
    value: string,
  ) {
    setLoading(true);
    setFetchError(null);
    setPage(1);

    setChannelFilter(
      value,
    );

    setRequestVersion(
      (current) =>
        current + 1,
    );
  }

  function changeStatusFilter(
    value: string,
  ) {
    setLoading(true);
    setFetchError(null);
    setPage(1);

    setStatusFilter(
      value,
    );

    setRequestVersion(
      (current) =>
        current + 1,
    );
  }

  function resetFilters() {
    setLoading(true);

    setFetchError(
      null,
    );

    setSearch("");

    setDebouncedSearch(
      "",
    );

    setSentimentFilter(
      "All",
    );

    setChannelFilter(
      "All",
    );

    setStatusFilter(
      "All",
    );

    setPage(1);

    setRequestVersion(
      (current) =>
        current + 1,
    );
  }

  function goToPreviousPage() {
    if (
      page <= 1 ||
      loading
    ) {
      return;
    }

    setLoading(true);

    setFetchError(
      null,
    );

    setPage(
      (previous) =>
        Math.max(
          previous - 1,
          1,
        ),
    );

    setRequestVersion(
      (current) =>
        current + 1,
    );
  }

  function goToNextPage() {
    if (
      page >=
        totalPages ||
      loading
    ) {
      return;
    }

    setLoading(true);

    setFetchError(
      null,
    );

    setPage(
      (previous) =>
        Math.min(
          previous + 1,
          totalPages,
        ),
    );

    setRequestVersion(
      (current) =>
        current + 1,
    );
  }

  function refreshFeedback() {
    beginRequest(
      "refreshing",
    );
  }

  function retryFeedback() {
    beginRequest(
      "loading",
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setFormError("");

    if (
      !content.trim()
    ) {
      setFormError(
        "Please enter customer feedback text.",
      );

      return;
    }

    if (
      content
        .trim()
        .length < 5
    ) {
      setFormError(
        "Feedback must contain at least 5 characters.",
      );

      return;
    }

    setSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/feedback",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                {
                  customerName:
                    customerName.trim() ||
                    "Anonymous Customer",

                  content:
                    content.trim(),

                  channel,
                },
              ),
          },
        );

      const data =
        await readJsonSafely<FeedbackMutationResponse>(
          response,
        );

      if (
        !response.ok
      ) {
        setFormError(
          getFeedbackActionError(
            response.status,
            data?.error,
          ),
        );

        return;
      }

      closeFeedbackForm();

      setAlertMessage(
        {
          type: "success",

          message:
            "Feedback saved successfully.",
        },
      );

      setLoading(true);

      setPage(1);

      setRequestVersion(
        (current) =>
          current + 1,
      );
    } catch {
      setFormError(
        "The feedback service could not be reached. Please try again.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  function handleCsvFileUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target
        .files?.[0];

    if (!file) {
      return;
    }

    setAlertMessage(
      null,
    );

    setCsvFileName(
      file.name,
    );

    const isCsv =
      file.type ===
        "text/csv" ||
      file.name
        .toLowerCase()
        .endsWith(".csv");

    if (!isCsv) {
      setAlertMessage(
        {
          type: "error",

          message:
            "Please select a valid CSV file.",
        },
      );

      event.target.value =
        "";

      setCsvFileName(
        "",
      );

      return;
    }

    if (
      file.size >
      maximumCsvSize
    ) {
      setAlertMessage(
        {
          type: "error",

          message:
            "CSV file must be smaller than 5 MB.",
        },
      );

      event.target.value =
        "";

      setCsvFileName(
        "",
      );

      return;
    }

    setCsvUploading(
      true,
    );

    Papa.parse<CsvRow>(
      file,
      {
        header: true,

        skipEmptyLines:
          true,

        transformHeader:
          (header) =>
            header.trim(),

        complete:
          async (
            results,
          ) => {
            try {
              const parsedItems =
                results.data
                  .map(
                    (
                      row,
                    ) => {
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
                    },
                  )
                  .filter(
                    (
                      item,
                    ) =>
                      item
                        .content
                        .length >
                      0,
                  );

              if (
                parsedItems.length ===
                0
              ) {
                setAlertMessage(
                  {
                    type: "error",

                    message:
                      "No valid feedback was found. Include a content or feedback column.",
                  },
                );

                return;
              }

              const response =
                await fetch(
                  "/api/feedback/bulk",
                  {
                    method:
                      "POST",

                    headers:
                      {
                        "Content-Type":
                          "application/json",
                      },

                    body:
                      JSON.stringify(
                        {
                          items:
                            parsedItems,
                        },
                      ),
                  },
                );

              const data =
                await readJsonSafely<FeedbackMutationResponse>(
                  response,
                );

              if (
                !response.ok
              ) {
                setAlertMessage(
                  {
                    type: "error",

                    message:
                      getFeedbackActionError(
                        response.status,
                        data?.error,
                      ),
                  },
                );

                return;
              }

              setAlertMessage(
                {
                  type: "success",

                  message: `${data?.count ?? parsedItems.length} feedback entries imported successfully.`,
                },
              );

              setLoading(
                true,
              );

              setPage(1);

              setRequestVersion(
                (
                  current,
                ) =>
                  current +
                  1,
              );
            } catch {
              setAlertMessage(
                {
                  type: "error",

                  message:
                    "The feedback service could not be reached. CSV data was not uploaded.",
                },
              );
            } finally {
              setCsvUploading(
                false,
              );

              setCsvFileName(
                "",
              );

              if (
                csvInputRef.current
              ) {
                csvInputRef.current.value =
                  "";
              }
            }
          },

        error: () => {
          setCsvUploading(
            false,
          );

          setCsvFileName(
            "",
          );

          setAlertMessage(
            {
              type: "error",

              message:
                "Unable to read the selected CSV file.",
            },
          );

          if (
            csvInputRef.current
          ) {
            csvInputRef.current.value =
              "";
          }
        },
      },
    );
  }

  function downloadCsvTemplate() {
    const templateContent =
      "content,customer,channel\n";

    const blob =
      new Blob(
        [
          templateContent,
        ],
        {
          type: "text/csv;charset=utf-8",
        },
      );

    const url =
      URL.createObjectURL(
        blob,
      );

    const anchor =
      document.createElement(
        "a",
      );

    anchor.href = url;

    anchor.download =
      "loop-feedback-template.csv";

    document.body.appendChild(
      anchor,
    );

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(
      url,
    );
  }

  return (
    <LoopShell
      title="Feedback"
      subtitle="Capture, search and review customer feedback from your workspace."
    >
      <div className="mx-auto max-w-[1500px] space-y-5">
        {alertMessage && (
          <AlertToast
            alert={
              alertMessage
            }
            onClose={() =>
              setAlertMessage(
                null,
              )
            }
          />
        )}

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Feedback inbox
            </p>

            <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
              Review feedback stored in the current workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                refreshFeedback
              }
              disabled={
                refreshing
              }
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshIcon
                spinning={
                  refreshing
                }
              />

              {refreshing
                ? "Refreshing"
                : "Refresh"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowCsvModal(
                  (
                    current,
                  ) =>
                    !current,
                );

                setShowForm(
                  false,
                );
              }}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <UploadIcon />

              Import CSV
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(
                  (
                    current,
                  ) =>
                    !current,
                );

                setShowCsvModal(
                  false,
                );
              }}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-3.5 text-[11px] font-semibold text-white transition hover:bg-blue-500"
            >
              <PlusIcon />

              Add feedback
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Workspace feedback"
            value={
              loading
                ? "—"
                : totalCount.toLocaleString()
            }
            helper="Total matching records"
            icon={
              <DatabaseIcon />
            }
            tone="blue"
          />

          <MetricCard
            label="Positive"
            value={
              loading
                ? "—"
                : currentPageStats.positive.toLocaleString()
            }
            helper="Visible on this page"
            icon={
              <PositiveIcon />
            }
            tone="emerald"
          />

          <MetricCard
            label="Negative"
            value={
              loading
                ? "—"
                : currentPageStats.negative.toLocaleString()
            }
            helper="Visible on this page"
            icon={
              <WarningIcon />
            }
            tone="rose"
          />

          <MetricCard
            label="Unclassified"
            value={
              loading
                ? "—"
                : currentPageStats.unclassified.toLocaleString()
            }
            helper={`${currentPageStats.newItems} new on this page`}
            icon={
              <AnalysisIcon />
            }
            tone="violet"
          />
        </section>

        {showCsvModal && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
                  Import feedback from CSV
                </h2>

                <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                  The file must contain a content or feedback column. Customer and channel are optional.
                </p>
              </div>

              <CloseButton
                label="Close CSV import"
                onClick={() =>
                  setShowCsvModal(
                    false,
                  )
                }
              />
            </div>

            <div className="p-5">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center dark:border-slate-700 dark:bg-slate-800/40">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-300">
                  <CsvIcon />
                </span>

                <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
                  Select a CSV file
                </p>

                <p className="mx-auto mt-2 max-w-lg text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                  Maximum file size is 5 MB. Supported feedback headings include content and feedback.
                </p>

                <label className="mx-auto mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500">
                  <UploadIcon />

                  Choose CSV

                  <input
                    ref={
                      csvInputRef
                    }
                    type="file"
                    accept=".csv,text/csv"
                    disabled={
                      csvUploading
                    }
                    onChange={
                      handleCsvFileUpload
                    }
                    className="hidden"
                  />
                </label>

                {csvFileName && (
                  <p className="mt-3 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                    {
                      csvFileName
                    }
                  </p>
                )}

                {csvUploading && (
                  <div className="mx-auto mt-4 flex max-w-sm items-center justify-center gap-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    <LoadingSpinner />

                    Importing feedback…
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    CSV template
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                    Download the expected column headings.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    downloadCsvTemplate
                  }
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <DownloadIcon />

                  Download template
                </button>
              </div>
            </div>
          </section>
        )}

        {showForm && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
                  Add customer feedback
                </h2>

                <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                  Create a new feedback record in the workspace.
                </p>
              </div>

              <CloseButton
                label="Close feedback form"
                onClick={
                  closeFeedbackForm
                }
              />
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="grid gap-5 p-5 md:grid-cols-2"
            >
              <FormField label="Customer name">
                <input
                  value={
                    customerName
                  }
                  onChange={(
                    event,
                  ) => {
                    setCustomerName(
                      event
                        .target
                        .value,
                    );

                    setFormError(
                      "",
                    );
                  }}
                  placeholder="Customer name"
                  className={inputClassName}
                />
              </FormField>

              <FormField label="Channel">
                <select
                  value={
                    channel
                  }
                  onChange={(
                    event,
                  ) =>
                    setChannel(
                      event
                        .target
                        .value,
                    )
                  }
                  className={inputClassName}
                >
                  {channelOptions
                    .filter(
                      (
                        option,
                      ) =>
                        option !==
                        "CSV Import",
                    )
                    .map(
                      (
                        option,
                      ) => (
                        <option
                          key={
                            option
                          }
                          value={
                            option
                          }
                        >
                          {
                            option
                          }
                        </option>
                      ),
                    )}
                </select>
              </FormField>

              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="feedback-content"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Feedback content
                  </label>

                  <span className="text-[10px] text-slate-400">
                    {
                      content.length
                    }
                    /2000
                  </span>
                </div>

                <textarea
                  id="feedback-content"
                  rows={5}
                  required
                  maxLength={
                    2000
                  }
                  value={
                    content
                  }
                  onChange={(
                    event,
                  ) => {
                    setContent(
                      event
                        .target
                        .value,
                    );

                    setFormError(
                      "",
                    );
                  }}
                  placeholder="Enter customer feedback…"
                  className={`${inputClassName} resize-none leading-6`}
                />
              </div>

              {formError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300 md:col-span-2">
                  {
                    formError
                  }
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 md:col-span-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeFeedbackForm
                  }
                  disabled={
                    submitting
                  }
                  className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner />

                      Saving…
                    </>
                  ) : (
                    <>
                      Save feedback

                      <ArrowIcon />
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.5fr)_1fr_1fr_1fr_auto]">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>

              <input
                value={search}
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                placeholder="Search feedback…"
                className={`${inputClassName} pl-10`}
              />
            </div>

            <FilterSelect
              label="Sentiment"
              value={
                sentimentFilter
              }
              onChange={
                changeSentimentFilter
              }
              options={[
                {
                  value:
                    "All",
                  label:
                    "All sentiments",
                },
                {
                  value:
                    "POSITIVE",
                  label:
                    "Positive",
                },
                {
                  value:
                    "NEUTRAL",
                  label:
                    "Neutral",
                },
                {
                  value:
                    "NEGATIVE",
                  label:
                    "Negative",
                },
              ]}
            />

            <FilterSelect
              label="Channel"
              value={
                channelFilter
              }
              onChange={
                changeChannelFilter
              }
              options={[
                {
                  value:
                    "All",
                  label:
                    "All channels",
                },

                ...channelOptions.map(
                  (
                    option,
                  ) => ({
                    value:
                      option,
                    label:
                      option,
                  }),
                ),
              ]}
            />

            <FilterSelect
              label="Status"
              value={
                statusFilter
              }
              onChange={
                changeStatusFilter
              }
              options={[
                {
                  value:
                    "All",
                  label:
                    "All statuses",
                },
                {
                  value:
                    "NEW",
                  label:
                    "New",
                },
                {
                  value:
                    "REVIEWED",
                  label:
                    "Reviewed",
                },
                {
                  value:
                    "ACTIONED",
                  label:
                    "Actioned",
                },
              ]}
            />

            {hasActiveFilters && (
              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="h-10 rounded-xl border border-slate-200 px-3.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
                  Workspace feedback
                </h2>

                <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {
                    totalCount
                  }{" "}
                  total
                </span>
              </div>

              <p className="mt-1 text-[10px] text-slate-400">
                Showing{" "}
                {
                  feedbackList.length
                }{" "}
                records on page{" "}
                {page}
              </p>
            </div>

            <p className="text-[10px] font-medium text-slate-400">
              Page {page} of{" "}
              {totalPages}
            </p>
          </div>

          {loading ? (
            <FeedbackSkeleton />
          ) : fetchError ? (
            <ErrorState
              error={
                fetchError
              }
              onRetry={
                retryFeedback
              }
            />
          ) : feedbackList.length ===
            0 ? (
            <EmptyState
              hasFilters={
                hasActiveFilters
              }
              onClear={
                resetFilters
              }
              onAdd={() => {
                setShowForm(
                  true,
                );

                setShowCsvModal(
                  false,
                );
              }}
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1060px] text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <TableHeading>
                        Customer
                      </TableHeading>

                      <TableHeading>
                        Feedback
                      </TableHeading>

                      <TableHeading>
                        Channel
                      </TableHeading>

                      <TableHeading>
                        Sentiment
                      </TableHeading>

                      <TableHeading>
                        Themes
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

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {feedbackList.map(
                      (
                        item,
                      ) => (
                        <FeedbackTableRow
                          key={
                            item.id
                          }
                          item={
                            item
                          }
                          onView={() =>
                            setSelectedFeedback(
                              item,
                            )
                          }
                        />
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 lg:hidden">
                {feedbackList.map(
                  (
                    item,
                  ) => (
                    <FeedbackMobileCard
                      key={
                        item.id
                      }
                      item={
                        item
                      }
                      onView={() =>
                        setSelectedFeedback(
                          item,
                        )
                      }
                    />
                  ),
                )}
              </div>
            </>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/30 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Page {page} of{" "}
              {totalPages} ·{" "}
              {totalCount} total
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={
                  page <= 1 ||
                  loading
                }
                onClick={
                  goToPreviousPage
                }
                className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                ← Previous
              </button>

              <button
                type="button"
                disabled={
                  page >=
                    totalPages ||
                  loading
                }
                onClick={
                  goToNextPage
                }
                className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Next →
              </button>
            </div>
          </div>
        </section>

        {selectedFeedback && (
          <FeedbackDetailModal
            item={
              selectedFeedback
            }
            onClose={() =>
              setSelectedFeedback(
                null,
              )
            }
          />
        )}
      </div>
    </LoopShell>
  );
}

const inputClassName =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500";

function MetricCard({
  label,
  value,
  helper,
  icon,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
  tone:
    | "blue"
    | "emerald"
    | "rose"
    | "violet";
}) {
  const tones = {
    blue:
      "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",

    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",

    rose:
      "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300",

    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {value}
          </p>
        </div>

        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-3 text-[10px] text-slate-400">
        {helper}
      </p>
    </article>
  );
}

function FeedbackTableRow({
  item,
  onView,
}: {
  item: FeedbackItem;
  onView: () => void;
}) {
  return (
    <tr className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {getInitials(
              item.customerName,
            )}
          </span>

          <p className="max-w-36 truncate text-xs font-semibold text-slate-900 dark:text-white">
            {item.customerName ||
              "Anonymous Customer"}
          </p>
        </div>
      </td>

      <td className="max-w-sm px-5 py-4">
        <p className="line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
          {item.content}
        </p>
      </td>

      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
        {item.channel}
      </td>

      <td className="px-5 py-4">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold ${getSentimentStyle(
            item.sentiment,
          )}`}
        >
          {formatSentiment(
            item.sentiment,
          )}
        </span>

        {typeof item.sentimentScore ===
          "number" && (
          <p className="mt-1 text-[9px] text-slate-400">
            {Math.round(
              item.sentimentScore *
                100,
            )}
            %
          </p>
        )}
      </td>

      <td className="px-5 py-4">
        <div className="flex max-w-44 flex-wrap gap-1">
          {item.themes &&
          item.themes.length >
            0 ? (
            item.themes
              .slice(0, 3)
              .map(
                (
                  themeItem,
                ) => (
                  <span
                    key={
                      themeItem
                        .theme
                        .name
                    }
                    className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                  >
                    {
                      themeItem
                        .theme
                        .name
                    }
                  </span>
                ),
              )
          ) : (
            <span className="text-[10px] text-slate-400">
              None
            </span>
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold ${getStatusStyle(
            item.status,
          )}`}
        >
          {formatLabel(
            item.status,
          )}
        </span>
      </td>

      <td className="whitespace-nowrap px-5 py-4">
        <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
          {formatDate(
            item.createdAt,
          )}
        </p>

        <p className="mt-1 text-[9px] text-slate-400">
          {formatTime(
            item.createdAt,
          )}
        </p>
      </td>

      <td className="px-5 py-4">
        <button
          type="button"
          onClick={onView}
          className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          View
        </button>
      </td>
    </tr>
  );
}

function FeedbackMobileCard({
  item,
  onView,
}: {
  item: FeedbackItem;
  onView: () => void;
}) {
  return (
    <article className="p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {getInitials(
            item.customerName,
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                {item.customerName ||
                  "Anonymous Customer"}
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                {item.channel} ·{" "}
                {formatDate(
                  item.createdAt,
                )}
              </p>
            </div>

            <span
              className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold ${getSentimentStyle(
                item.sentiment,
              )}`}
            >
              {formatSentiment(
                item.sentiment,
              )}
            </span>
          </div>

          <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-600 dark:text-slate-300">
            {item.content}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span
              className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold ${getStatusStyle(
                item.status,
              )}`}
            >
              {formatLabel(
                item.status,
              )}
            </span>

            {item.themes
              ?.slice(0, 2)
              .map(
                (
                  themeItem,
                ) => (
                  <span
                    key={
                      themeItem
                        .theme
                        .name
                    }
                    className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                  >
                    {
                      themeItem
                        .theme
                        .name
                    }
                  </span>
                ),
              )}
          </div>

          <button
            type="button"
            onClick={onView}
            className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            View details
          </button>
        </div>
      </div>
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
      <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
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
  onChange: (
    value: string,
  ) => void;
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
        aria-label={
          label
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target
              .value,
          )
        }
        className={inputClassName}
      >
        {options.map(
          (
            option,
          ) => (
            <option
              key={`${label}-${option.value}`}
              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>
          ),
        )}
      </select>
    </div>
  );
}

function AlertToast({
  alert,
  onClose,
}: {
  alert: AlertMessage;
  onClose: () => void;
}) {
  const style =
    alert.type ===
    "success"
      ? "border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-300"
      : alert.type ===
          "error"
        ? "border-rose-200 text-rose-700 dark:border-rose-900 dark:text-rose-300"
        : "border-blue-200 text-blue-700 dark:border-blue-900 dark:text-blue-300";

  return (
    <div
      className={`fixed right-4 top-24 z-[70] flex max-w-sm items-start gap-3 rounded-xl border bg-white p-4 shadow-xl dark:bg-slate-900 ${style}`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-current/10 text-xs font-bold">
        {alert.type ===
        "success"
          ? "✓"
          : alert.type ===
              "error"
            ? "!"
            : "i"}
      </span>

      <p className="min-w-0 flex-1 text-xs leading-5">
        {alert.message}
      </p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close message"
        className="text-slate-400 transition hover:text-slate-700 dark:hover:text-white"
      >
        ×
      </button>
    </div>
  );
}

function FeedbackSkeleton() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({
        length: 5,
      }).map(
        (_, index) => (
          <div
            key={
              index
            }
            className="flex animate-pulse gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800"
          >
            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-800" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-800" />

              <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />

              <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
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
  return (
    <div className="px-5 py-12">
      <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-amber-50/60 p-6 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
          <WarningIcon />
        </span>

        <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
          {error.title}
        </h3>

        <p className="mt-2 text-[11px] leading-5 text-slate-600 dark:text-slate-400">
          {error.message}
        </p>

        <button
          type="button"
          onClick={
            onRetry
          }
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-xl bg-slate-950 px-4 text-[11px] font-semibold text-white dark:bg-blue-600"
        >
          <RefreshIcon
            spinning={
              false
            }
          />

          Retry
        </button>

        {error.technicalMessage && (
          <details className="mt-5 rounded-xl border border-slate-200 bg-white p-3 text-left dark:border-slate-700 dark:bg-slate-900">
            <summary className="cursor-pointer text-[10px] font-semibold text-slate-500">
              Technical details
            </summary>

            <p className="mt-2 break-words font-mono text-[10px] leading-5 text-slate-500 dark:text-slate-400">
              {
                error.technicalMessage
              }
            </p>
          </details>
        )}
      </div>
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
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <MessageIcon />
      </span>

      <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
        {hasFilters
          ? "No matching feedback"
          : "No feedback available"}
      </h3>

      <p className="mt-2 max-w-md text-[11px] leading-5 text-slate-500 dark:text-slate-400">
        {hasFilters
          ? "Try changing or clearing the active filters."
          : "Add customer feedback to start building the workspace inbox."}
      </p>

      <div className="mt-5 flex gap-2">
        {hasFilters && (
          <button
            type="button"
            onClick={
              onClear
            }
            className="h-9 rounded-xl border border-slate-200 px-4 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            Clear filters
          </button>
        )}

        <button
          type="button"
          onClick={onAdd}
          className="h-9 rounded-xl bg-blue-600 px-4 text-[11px] font-semibold text-white"
        >
          Add feedback
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

      <article className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {getInitials(
                item.customerName,
              )}
            </span>

            <div>
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                {item.customerName ||
                  "Anonymous Customer"}
              </h3>

              <p className="mt-1 text-[10px] text-slate-400">
                {item.channel} ·{" "}
                {formatDate(
                  item.createdAt,
                )}
              </p>
            </div>
          </div>

          <CloseButton
            label="Close feedback details"
            onClick={
              onClose
            }
          />
        </div>

        <div className="space-y-5 p-5">
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold ${getSentimentStyle(
                item.sentiment,
              )}`}
            >
              {formatSentiment(
                item.sentiment,
              )}
            </span>

            <span
              className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold ${getStatusStyle(
                item.status,
              )}`}
            >
              {formatLabel(
                item.status,
              )}
            </span>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Feedback
            </p>

            <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
              {item.content}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Themes
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {item.themes &&
              item.themes.length >
                0 ? (
                item.themes.map(
                  (
                    themeItem,
                  ) => (
                    <span
                      key={
                        themeItem
                          .theme
                          .name
                      }
                      className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                    >
                      {
                        themeItem
                          .theme
                          .name
                      }
                    </span>
                  ),
                )
              ) : (
                <span className="text-[11px] text-slate-400">
                  No linked themes
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailCard
              label="Channel"
              value={
                item.channel
              }
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
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
    <th className="whitespace-nowrap px-5 py-3.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
      {children}
    </th>
  );
}

function CloseButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      ×
    </button>
  );
}

function LoadingSpinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

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
        spinning
          ? "animate-spin"
          : ""
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
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 16V4M7 9l5-5 5 5"
      />

      <path
        strokeLinecap="round"
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
      className="h-4 w-4"
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
      className="h-5 w-5"
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

function DatabaseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
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
      className="h-4 w-4"
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
      className="h-4 w-4"
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

function AnalysisIcon() {
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
        d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 18l-1.8-6.2L5 10l5.2-1.8L12 3Z"
      />
    </svg>
  );
}