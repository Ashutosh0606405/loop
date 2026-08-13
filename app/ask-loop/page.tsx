"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import LoopShell from "../../components/LoopShell";

type Sentiment =
  | "Positive"
  | "Neutral"
  | "Negative";

type AnswerMode = "Concise" | "Detailed";

type Evidence = {
  quote: string;
  source: string;
  sentiment: Sentiment;
  relevance: number;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  evidence?: Evidence[];
  themes?: string[];
  confidence?: number;
};

type AnswerResult = {
  content: string;
  evidence: Evidence[];
  themes: string[];
  confidence: number;
};

type ToastMessage = {
  type: "success" | "error" | "info";
  message: string;
};

const maximumQuestionLength = 500;

const suggestedQuestions = [
  {
    title:
      "What are customers saying about payments?",
    category: "Payments",
    description:
      "Understand payment delays and transaction concerns.",
  },
  {
    title:
      "Which issues need immediate attention?",
    category: "Urgent",
    description:
      "Identify high-priority customer problems.",
  },
  {
    title:
      "Summarize the onboarding feedback",
    category: "Onboarding",
    description:
      "Review the first-time user experience.",
  },
  {
    title:
      "What features do customers like the most?",
    category: "Positive",
    description:
      "Discover the strongest positive themes.",
  },
];

const initialAssistantMessage: ChatMessage = {
  id: "welcome-message",
  role: "assistant",
  content:
    "Hello! I am LOOP AI. Ask me about customer sentiment, recurring issues, product opportunities, feedback themes or urgent customer concerns.",
  createdAt: new Date().toISOString(),
  themes: [
    "Sentiment",
    "Themes",
    "Customer Experience",
  ],
};

function createMessageId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function mapApiSentiment(
  sentiment?: string,
): Sentiment {
  if (sentiment === "POSITIVE") {
    return "Positive";
  }

  if (sentiment === "NEGATIVE") {
    return "Negative";
  }

  return "Neutral";
}

type AskLoopCitation = {
  id: string;
  index: number;
  customer: string;
  channel: string;
  content: string;
  sentiment: string;
  relevance: number | null;
};

type AskLoopResponse = {
  answer: string;
  citations: AskLoopCitation[];
  error?: string;
};

async function fetchAskLoopAnswer(
  question: string,
  mode: AnswerMode,
): Promise<AnswerResult> {
  const response = await fetch(
    "/api/ask-loop",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        mode,
      }),
    },
  );

  const data: AskLoopResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ??
        "Ask LOOP could not answer that question.",
    );
  }

  const evidence: Evidence[] = (
    data.citations ?? []
  ).map((citation) => ({
    quote: citation.content,
    source:
      citation.channel ||
      "Customer Feedback",
    sentiment: mapApiSentiment(
      citation.sentiment,
    ),
    relevance:
      typeof citation.relevance ===
      "number"
        ? citation.relevance
        : Math.max(
            50,
            95 - citation.index * 5,
          ),
  }));

  return {
    content:
      data.answer ||
      "I could not find an answer based on your current feedback data.",
    evidence,
    themes: [],
    confidence: 0,
  };
}

function getEvidenceStyle(
  sentiment: Sentiment,
) {
  if (sentiment === "Positive") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (sentiment === "Negative") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function formatMessageTime(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
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

export default function AskLoopPage() {
  const [input, setInput] = useState("");

  const [answerMode, setAnswerMode] =
    useState<AnswerMode>("Detailed");

  const [isThinking, setIsThinking] =
    useState(false);

  const [messages, setMessages] = useState<
    ChatMessage[]
  >([initialAssistantMessage]);

  const [
    selectedFeedbackRating,
    setSelectedFeedbackRating,
  ] = useState<
    Record<string, "helpful" | "not-helpful">
  >({});

  const [
    copiedMessageId,
    setCopiedMessageId,
  ] = useState("");

  const [toastMessage, setToastMessage] =
    useState<ToastMessage | null>(null);

  const chatBottomRef =
    useRef<HTMLDivElement | null>(null);

  const inputRef =
    useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isThinking]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [toastMessage]);

  const conversationStats = useMemo(() => {
    const userQuestions = messages.filter(
      (message) => message.role === "user",
    ).length;

    const assistantAnswers = messages.filter(
      (message) =>
        message.role === "assistant" &&
        message.evidence,
    ).length;

    const evidenceCount = messages.reduce(
      (total, message) =>
        total +
        (message.evidence?.length ?? 0),
      0,
    );

    return {
      userQuestions,
      assistantAnswers,
      evidenceCount,
    };
  }, [messages]);

  const recentQuestions = useMemo(() => {
    return messages
      .filter(
        (message) => message.role === "user",
      )
      .slice(-3)
      .reverse();
  }, [messages]);

  function showToast(
    type: ToastMessage["type"],
    message: string,
  ) {
    setToastMessage({
      type,
      message,
    });
  }

  async function sendQuestion(
    customQuestion?: string,
  ) {
    const question = (
      customQuestion ?? input
    ).trim();

    if (!question || isThinking) {
      return;
    }

    if (
      question.length >
      maximumQuestionLength
    ) {
      showToast(
        "error",
        `Question must be within ${maximumQuestionLength} characters.`,
      );
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: question,
      createdAt: new Date().toISOString(),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setInput("");
    setIsThinking(true);

    try {
      const answer =
        await fetchAskLoopAnswer(
          question,
          answerMode,
        );

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: answer.content,
        evidence:
          answer.evidence.length > 0
            ? answer.evidence
            : undefined,
        themes:
          answer.themes.length > 0
            ? answer.themes
            : undefined,
        confidence:
          answer.confidence > 0
            ? answer.confidence
            : undefined,
        createdAt: new Date().toISOString(),
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        assistantMessage,
      ]);
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Ask LOOP could not answer that question.",
      );

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content:
          "Something went wrong answering that question. Please try again.",
        createdAt: new Date().toISOString(),
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        assistantMessage,
      ]);
    } finally {
      setIsThinking(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    sendQuestion();
  }

  function handleInputKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendQuestion();
    }
  }

  function clearConversation() {
    setMessages([
      {
        ...initialAssistantMessage,
        id: createMessageId(),
        content:
          "Conversation cleared. Ask me a new question about your customer feedback.",
        createdAt: new Date().toISOString(),
      },
    ]);

    setInput("");
    setSelectedFeedbackRating({});
    setCopiedMessageId("");

    showToast(
      "success",
      "Conversation cleared successfully.",
    );
  }

  async function copyAnswer(
    message: ChatMessage,
  ) {
    try {
      await navigator.clipboard.writeText(
        message.content,
      );

      setCopiedMessageId(message.id);

      showToast(
        "success",
        "Answer copied to clipboard.",
      );

      window.setTimeout(() => {
        setCopiedMessageId("");
      }, 2000);
    } catch {
      showToast(
        "error",
        "Unable to copy the answer.",
      );
    }
  }

  function rateAnswer(
    messageId: string,
    rating: "helpful" | "not-helpful",
  ) {
    setSelectedFeedbackRating(
      (previous) => ({
        ...previous,
        [messageId]: rating,
      }),
    );

    showToast(
      "info",
      rating === "helpful"
        ? "Thanks for your feedback."
        : "Feedback recorded. The answer can be improved.",
    );
  }

  return (
    <LoopShell
      title="Ask LOOP"
      subtitle="Ask questions and receive evidence-backed customer insights."
    >
      <div className="relative space-y-6">
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
                    ? "Unable to complete"
                    : "Information"}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                {toastMessage.message}
              </p>
            </div>
          </div>
        )}

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-blue-700 to-slate-950 p-6 text-white shadow-xl sm:p-8">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-20 left-1/3 h-60 w-60 rounded-full bg-violet-400/20 blur-3xl" />

          <div className="absolute right-[30%] top-10 hidden h-32 w-32 rounded-full border border-white/10 lg:block" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  AI Feedback Analyst
                </span>

                <span className="rounded-full bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-200">
                  Evidence-backed answers
                </span>
              </div>

              <h1 className="mt-5 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
                Ask your customer feedback a
                question.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                LOOP analyses customer
                conversations and returns a clear
                answer supported by relevant
                feedback evidence.
              </p>

              <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-blue-100">
                <HeroFeature>
                  Sentiment analysis
                </HeroFeature>

                <HeroFeature>
                  Theme detection
                </HeroFeature>

                <HeroFeature>
                  Supporting evidence
                </HeroFeature>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[430px] lg:grid-cols-1">
              <HeroStat
                value="1,248"
                label="Feedback records"
              />

              <HeroStat
                value="12"
                label="Active themes"
              />

              <HeroStat
                value="94%"
                label="AI confidence"
              />
            </div>
          </div>
        </section>

        {/* Workspace */}
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Chat */}
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Chat Header */}
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-center gap-3">
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-black text-white shadow-lg shadow-blue-200">
                  AI

                  <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
                </span>

                <div>
                  <h2 className="font-bold text-slate-950">
                    LOOP Intelligence Assistant
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Online · Feedback knowledge base
                    connected
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex rounded-xl bg-slate-100 p-1">
                  {(
                    [
                      "Concise",
                      "Detailed",
                    ] as AnswerMode[]
                  ).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() =>
                        setAnswerMode(mode)
                      }
                      className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                        answerMode === mode
                          ? "bg-white text-slate-950 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={clearConversation}
                  disabled={
                    messages.length === 1 &&
                    messages[0].id ===
                      "welcome-message"
                  }
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear Chat
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[610px] space-y-6 overflow-y-auto bg-slate-50 p-4 sm:p-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {message.role ===
                    "assistant" && (
                    <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-[10px] font-black text-white sm:flex">
                      AI
                    </span>
                  )}

                  <div
                    className={`max-w-[92%] sm:max-w-[85%] ${
                      message.role === "user"
                        ? "rounded-3xl rounded-br-md bg-slate-950 px-5 py-4 text-white shadow-sm"
                        : "rounded-3xl rounded-bl-md border border-slate-200 bg-white px-5 py-4 text-slate-700 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p
                        className={`text-xs font-bold uppercase tracking-wider ${
                          message.role === "user"
                            ? "text-slate-300"
                            : "text-blue-600"
                        }`}
                      >
                        {message.role === "user"
                          ? "Your Question"
                          : "LOOP Answer"}
                      </p>

                      <span
                        className={`text-[10px] ${
                          message.role === "user"
                            ? "text-slate-400"
                            : "text-slate-400"
                        }`}
                      >
                        {formatMessageTime(
                          message.createdAt,
                        )}
                      </span>
                    </div>

                    <p
                      className={`mt-3 text-sm leading-7 ${
                        message.role === "user"
                          ? "text-slate-100"
                          : "text-slate-700"
                      }`}
                    >
                      {message.content}
                    </p>

                    {message.themes &&
                      message.themes.length >
                        0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {message.themes.map(
                            (theme) => (
                              <span
                                key={theme}
                                className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700"
                              >
                                {theme}
                              </span>
                            ),
                          )}
                        </div>
                      )}

                    {typeof message.confidence ===
                      "number" && (
                      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-600">
                            Answer confidence
                          </p>

                          <p className="text-xs font-black text-blue-700">
                            {message.confidence}%
                          </p>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600"
                            style={{
                              width: `${message.confidence}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {message.evidence &&
                      message.evidence.length >
                        0 && (
                        <div className="mt-5 border-t border-slate-200 pt-5">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Supporting Evidence
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
                                {
                                  message.evidence
                                    .length
                                }{" "}
                                relevant feedback
                                records
                              </p>
                            </div>

                            <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-bold text-violet-700">
                              Evidence backed
                            </span>
                          </div>

                          <div className="mt-4 space-y-3">
                            {message.evidence.map(
                              (
                                evidence,
                                index,
                              ) => (
                                <article
                                  key={`${message.id}-${evidence.source}-${index}`}
                                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                >
                                  <div className="flex items-start gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-blue-700 shadow-sm">
                                      {index + 1}
                                    </span>

                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm italic leading-6 text-slate-600">
                                        “
                                        {
                                          evidence.quote
                                        }
                                        ”
                                      </p>

                                      <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                                          {
                                            evidence.source
                                          }
                                        </span>

                                        <span
                                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getEvidenceStyle(
                                            evidence.sentiment,
                                          )}`}
                                        >
                                          {
                                            evidence.sentiment
                                          }
                                        </span>

                                        <span className="text-[10px] font-semibold text-slate-400">
                                          {
                                            evidence.relevance
                                          }
                                          % relevance
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </article>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {message.role ===
                      "assistant" &&
                      message.evidence && (
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                rateAnswer(
                                  message.id,
                                  "helpful",
                                )
                              }
                              aria-label="Mark answer as helpful"
                              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                                selectedFeedbackRating[
                                  message.id
                                ] === "helpful"
                                  ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                                  : "border-slate-200 bg-white text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                              }`}
                            >
                              <ThumbUpIcon />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                rateAnswer(
                                  message.id,
                                  "not-helpful",
                                )
                              }
                              aria-label="Mark answer as not helpful"
                              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                                selectedFeedbackRating[
                                  message.id
                                ] ===
                                "not-helpful"
                                  ? "border-rose-300 bg-rose-100 text-rose-700"
                                  : "border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                              }`}
                            >
                              <ThumbDownIcon />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              void copyAnswer(
                                message,
                              )
                            }
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-blue-700"
                          >
                            {copiedMessageId ===
                            message.id ? (
                              <>
                                <CheckIcon />
                                Copied
                              </>
                            ) : (
                              <>
                                <CopyIcon />
                                Copy answer
                              </>
                            )}
                          </button>
                        </div>
                      )}
                  </div>

                  {message.role === "user" && (
                    <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-[10px] font-black text-white sm:flex">
                      YOU
                    </span>
                  )}
                </div>
              ))}

              {/* Thinking */}
              {isThinking && (
                <div className="flex gap-3">
                  <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-[10px] font-black text-white sm:flex">
                    AI
                  </span>

                  <div className="rounded-3xl rounded-bl-md border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-[10px] font-bold text-blue-700">
                        AI
                      </span>

                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Analysing feedback
                      </p>
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      Retrieving relevant customer
                      evidence…
                    </p>

                    <div className="mt-4 flex items-center gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />

                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:120ms]" />

                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-slate-200 bg-white p-4 sm:p-5"
            >
              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-3 transition focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                <textarea
                  ref={inputRef}
                  rows={3}
                  value={input}
                  maxLength={
                    maximumQuestionLength
                  }
                  disabled={isThinking}
                  onKeyDown={
                    handleInputKeyDown
                  }
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  placeholder="Ask about payments, onboarding, sentiment, urgent issues or customer themes…"
                  className="w-full resize-none bg-transparent px-1 py-1 text-sm leading-6 text-slate-950 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />

                <div className="mt-2 flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[10px] font-semibold text-slate-400">
                      Enter to send · Shift + Enter
                      for new line
                    </p>

                    <span
                      className={`text-[10px] font-bold ${
                        input.length >
                        maximumQuestionLength -
                          50
                          ? "text-rose-600"
                          : "text-slate-400"
                      }`}
                    >
                      {input.length}/
                      {maximumQuestionLength}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isThinking ||
                      !input.trim()
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isThinking ? (
                      <>
                        <LoadingSpinner />
                        Thinking…
                      </>
                    ) : (
                      <>
                        Send Question
                        <SendIcon />
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="mt-3 text-center text-[10px] text-slate-400">
                LOOP may produce inaccurate answers.
                Verify important insights using the
                supporting evidence.
              </p>
            </form>
          </article>

          {/* Right Sidebar */}
          <aside className="space-y-6">
            {/* Suggestions */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-950">
                    Suggested Questions
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Select a question to begin.
                  </p>
                </div>

                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <QuestionIcon />
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {suggestedQuestions.map(
                  (question, index) => (
                    <button
                      key={question.title}
                      type="button"
                      disabled={isThinking}
                      onClick={() =>
                        sendQuestion(
                          question.title,
                        )
                      }
                      className="group w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-blue-700 shadow-sm">
                          {index + 1}
                        </span>

                        <div className="min-w-0">
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-blue-700">
                            {question.category}
                          </span>

                          <p className="mt-3 text-sm font-bold leading-5 text-slate-700 group-hover:text-blue-800">
                            {question.title}
                          </p>

                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            {
                              question.description
                            }
                          </p>
                        </div>
                      </div>
                    </button>
                  ),
                )}
              </div>
            </section>

            {/* Conversation Stats */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-slate-950">
                Conversation Insights
              </h2>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <SmallStat
                  value={
                    conversationStats.userQuestions
                  }
                  label="Questions"
                  tone="blue"
                />

                <SmallStat
                  value={
                    conversationStats.assistantAnswers
                  }
                  label="Answers"
                  tone="violet"
                />

                <SmallStat
                  value={
                    conversationStats.evidenceCount
                  }
                  label="Evidence"
                  tone="emerald"
                />
              </div>

              {recentQuestions.length > 0 && (
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Recent questions
                  </p>

                  <div className="mt-3 space-y-2">
                    {recentQuestions.map(
                      (message) => (
                        <button
                          key={message.id}
                          type="button"
                          disabled={isThinking}
                          onClick={() =>
                            sendQuestion(
                              message.content,
                            )
                          }
                          className="line-clamp-2 w-full rounded-xl bg-slate-50 px-3 py-2.5 text-left text-xs font-semibold leading-5 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                        >
                          {message.content}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* How It Works */}
            <section className="rounded-3xl bg-gradient-to-br from-slate-950 to-indigo-950 p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">
                  How Ask LOOP Works
                </h2>

                <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                  RAG
                </span>
              </div>

              <div className="mt-6 space-y-5">
                <ProcessStep
                  number="1"
                  title="Understand"
                  description="LOOP understands the meaning and intent of the question."
                />

                <ProcessStep
                  number="2"
                  title="Retrieve"
                  description="Relevant customer feedback records are selected."
                />

                <ProcessStep
                  number="3"
                  title="Generate"
                  description="AI creates an answer using the retrieved evidence."
                />

                <ProcessStep
                  number="4"
                  title="Cite"
                  description="Supporting feedback is displayed with the answer."
                />
              </div>
            </section>

            {/* Knowledge Base */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-950">
                  Knowledge Base
                </h2>

                <span className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Ready
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <KnowledgeCard
                  value="1,248"
                  label="Feedback records"
                  tone="blue"
                />

                <KnowledgeCard
                  value="12"
                  label="Active themes"
                  tone="violet"
                />

                <KnowledgeCard
                  value="5"
                  label="Data sources"
                  tone="emerald"
                />

                <KnowledgeCard
                  value="94%"
                  label="AI confidence"
                  tone="amber"
                />
              </div>
            </section>
          </aside>
        </section>
      </div>
    </LoopShell>
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

function HeroStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
      <p className="text-2xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold text-blue-100">
        {label}
      </p>
    </div>
  );
}

function SmallStat({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "blue" | "violet" | "emerald";
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-700",
    violet:
      "bg-violet-50 text-violet-700",
    emerald:
      "bg-emerald-50 text-emerald-700",
  };

  return (
    <div
      className={`rounded-2xl p-3 text-center ${styles[tone]}`}
    >
      <p className="text-xl font-black">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-bold">
        {label}
      </p>
    </div>
  );
}

function KnowledgeCard({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone:
    | "blue"
    | "violet"
    | "emerald"
    | "amber";
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-700",
    violet:
      "bg-violet-50 text-violet-700",
    emerald:
      "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div
      className={`rounded-2xl p-4 ${styles[tone]}`}
    >
      <p className="text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-bold leading-4">
        {label}
      </p>
    </div>
  );
}

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-black">
        {number}
      </span>

      <div>
        <p className="text-sm font-bold">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}

function InfoIcon() {
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
        d="M12 11v5M12 8h.01"
      />
    </svg>
  );
}

function SendIcon() {
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
        d="m4 4 17 8-17 8 3-8-3-8Z"
      />

      <path
        strokeLinecap="round"
        d="M7 12h14"
      />
    </svg>
  );
}

function CopyIcon() {
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
        x="8"
        y="8"
        width="11"
        height="11"
        rx="2"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"
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
      className="h-4 w-4"
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

function ThumbUpIcon() {
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
        d="M7 10v10H4V10h3ZM7 18h9a3 3 0 0 0 3-2.4l1-5A2 2 0 0 0 18 8h-4l1-3a2 2 0 0 0-3.7-1.5L7 10"
      />
    </svg>
  );
}

function ThumbDownIcon() {
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
        d="M7 14V4H4v10h3ZM7 6h9a3 3 0 0 1 3 2.4l1 5A2 2 0 0 1 18 16h-4l1 3a2 2 0 0 1-3.7 1.5L7 14"
      />
    </svg>
  );
}

function QuestionIcon() {
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
        strokeLinejoin="round"
        d="M9.7 9a2.5 2.5 0 1 1 4 2c-1 .7-1.7 1.1-1.7 2.2"
      />

      <path
        strokeLinecap="round"
        d="M12 16.5h.01"
      />
    </svg>
  );
}