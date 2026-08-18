"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import LoopShell from "../../components/LoopShell";

type AnswerMode =
  | "Concise"
  | "Detailed";

type EvidenceSentiment =
  | "Positive"
  | "Neutral"
  | "Negative"
  | "Unclassified";

type Evidence = {
  id: string;
  quote: string;
  customer: string;
  source: string;
  sentiment: EvidenceSentiment;
  relevance: number | null;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  evidence?: Evidence[];
  engine?: string;
};

type ToastMessage = {
  type:
    | "success"
    | "error"
    | "info";
  message: string;
};

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
  answer?: string;
  citations?: AskLoopCitation[];
  aiEngine?: string;
  error?: string;
};

type AnswerResult = {
  content: string;
  evidence: Evidence[];
  engine?: string;
};

const maximumQuestionLength = 500;

const suggestedQuestions = [
  {
    title:
      "What are customers saying about payments?",
    category: "Payments",
    description:
      "Review feedback related to payment experiences.",
  },
  {
    title:
      "Which issues need immediate attention?",
    category: "Priority",
    description:
      "Look for customer concerns that may require review.",
  },
  {
    title:
      "Summarize the onboarding feedback",
    category: "Onboarding",
    description:
      "Explore feedback about first-time customer experiences.",
  },
  {
    title:
      "What features do customers like the most?",
    category: "Positive",
    description:
      "Find positive feedback and recurring product strengths.",
  },
];

function createMessageId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function createWelcomeMessage(): ChatMessage {
  return {
    id: "welcome-message",
    role: "assistant",
    content:
      "Ask a question about the feedback in your LOOP workspace. When relevant feedback is returned by the API, I will show it as supporting evidence.",
    createdAt: "",
  };
}

function mapApiSentiment(
  sentiment?: string,
): EvidenceSentiment {
  if (sentiment === "POSITIVE") {
    return "Positive";
  }

  if (sentiment === "NEGATIVE") {
    return "Negative";
  }

  if (sentiment === "NEUTRAL") {
    return "Neutral";
  }

  return "Unclassified";
}

async function readJsonSafely<T>(
  response: Response,
): Promise<T | null> {
  const text =
    await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function fetchAskLoopAnswer(
  question: string,
  mode: AnswerMode,
): Promise<AnswerResult> {
  const response =
    await fetch("/api/ask-loop", {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        question,
        mode,
      }),
    });

  const data =
    await readJsonSafely<AskLoopResponse>(
      response,
    );

  if (!response.ok) {
    throw new Error(
      data?.error ||
        "Ask LOOP could not answer that question.",
    );
  }

  if (!data?.answer?.trim()) {
    throw new Error(
      "Ask LOOP returned an empty answer.",
    );
  }

  const evidence: Evidence[] =
    (data.citations ?? []).map(
      (citation) => ({
        id: citation.id,

        quote:
          citation.content,

        customer:
          citation.customer ||
          "Anonymous Customer",

        source:
          citation.channel ||
          "Customer Feedback",

        sentiment:
          mapApiSentiment(
            citation.sentiment,
          ),

        relevance:
          typeof citation.relevance ===
          "number"
            ? citation.relevance
            : null,
      }),
    );

  return {
    content:
      data.answer.trim(),

    evidence,

    engine:
      data.aiEngine,
  };
}

function formatMessageTime(
  value: string,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

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

function getSentimentStyle(
  sentiment: EvidenceSentiment,
) {
  if (
    sentiment === "Positive"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300";
  }

  if (
    sentiment === "Negative"
  ) {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300";
  }

  if (
    sentiment === "Neutral"
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300";
  }

  return "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400";
}

function formatRelevance(
  relevance: number | null,
) {
  if (
    relevance === null ||
    !Number.isFinite(
      relevance,
    )
  ) {
    return null;
  }

  return `${Math.round(
    relevance,
  )}% relevance`;
}

export default function AskLoopPage() {
  const [
    input,
    setInput,
  ] = useState("");

  const [
    answerMode,
    setAnswerMode,
  ] =
    useState<AnswerMode>(
      "Detailed",
    );

  const [
    isThinking,
    setIsThinking,
  ] = useState(false);

  const [
    messages,
    setMessages,
  ] = useState<
    ChatMessage[]
  >(() => [
    createWelcomeMessage(),
  ]);

  const [
    copiedMessageId,
    setCopiedMessageId,
  ] = useState("");

  const [
    toastMessage,
    setToastMessage,
  ] =
    useState<
      ToastMessage | null
    >(null);

  const chatBottomRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const inputRef =
    useRef<HTMLTextAreaElement | null>(
      null,
    );

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView(
      {
        behavior: "smooth",
        block: "end",
      },
    );
  }, [
    messages,
    isThinking,
  ]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setToastMessage(
            null,
          );
        },
        3000,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [toastMessage]);

  const conversationStats =
    useMemo(() => {
      const questions =
        messages.filter(
          (message) =>
            message.role ===
            "user",
        ).length;

      const answers =
        messages.filter(
          (message) =>
            message.role ===
              "assistant" &&
            message.id !==
              "welcome-message",
        ).length;

      const evidence =
        messages.reduce(
          (
            total,
            message,
          ) =>
            total +
            (message
              .evidence
              ?.length ??
              0),
          0,
        );

      return {
        questions,
        answers,
        evidence,
      };
    }, [messages]);

  const recentQuestions =
    useMemo(() => {
      return messages
        .filter(
          (message) =>
            message.role ===
            "user",
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
    const question =
      (
        customQuestion ??
        input
      ).trim();

    if (
      !question ||
      isThinking
    ) {
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

    const userMessage: ChatMessage =
      {
        id: createMessageId(),
        role: "user",
        content: question,
        createdAt:
          new Date().toISOString(),
      };

    setMessages(
      (previous) => [
        ...previous,
        userMessage,
      ],
    );

    setInput("");
    setIsThinking(true);

    try {
      const answer =
        await fetchAskLoopAnswer(
          question,
          answerMode,
        );

      const assistantMessage: ChatMessage =
        {
          id: createMessageId(),

          role: "assistant",

          content:
            answer.content,

          createdAt:
            new Date().toISOString(),

          evidence:
            answer.evidence
              .length > 0
              ? answer.evidence
              : undefined,

          engine:
            answer.engine,
        };

      setMessages(
        (previous) => [
          ...previous,
          assistantMessage,
        ],
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ask LOOP could not answer that question.";

      showToast(
        "error",
        message,
      );

      setMessages(
        (previous) => [
          ...previous,
          {
            id:
              createMessageId(),

            role:
              "assistant",

            content:
              "I could not complete that request. Please try again after checking the workspace feedback service.",

            createdAt:
              new Date().toISOString(),
          },
        ],
      );
    } finally {
      setIsThinking(
        false,
      );

      window.setTimeout(
        () => {
          inputRef.current?.focus();
        },
        0,
      );
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    void sendQuestion();
  }

  function handleInputKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key ===
        "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      void sendQuestion();
    }
  }

  function clearConversation() {
    setMessages([
      {
        ...createWelcomeMessage(),

        id:
          createMessageId(),

        content:
          "Conversation cleared. Ask a new question about your workspace feedback.",

        createdAt:
          new Date().toISOString(),
      },
    ]);

    setInput("");

    setCopiedMessageId(
      "",
    );

    showToast(
      "success",
      "Conversation cleared.",
    );
  }

  async function copyAnswer(
    message: ChatMessage,
  ) {
    try {
      await navigator.clipboard.writeText(
        message.content,
      );

      setCopiedMessageId(
        message.id,
      );

      showToast(
        "success",
        "Answer copied to clipboard.",
      );

      window.setTimeout(
        () => {
          setCopiedMessageId(
            "",
          );
        },
        2000,
      );
    } catch {
      showToast(
        "error",
        "Unable to copy the answer.",
      );
    }
  }

  return (
    <LoopShell
      title="Ask LOOP"
      subtitle="Ask questions using feedback from the authenticated workspace."
    >
      <div className="mx-auto max-w-[1500px] space-y-5">
        {toastMessage && (
          <Toast
            toast={
              toastMessage
            }
            onClose={() =>
              setToastMessage(
                null,
              )
            }
          />
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  Evidence-backed Q&A
                </span>

                <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[9px] font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Workspace scoped
                </span>
              </div>

              <h1 className="mt-4 text-xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                Ask your customer
                feedback a
                question.
              </h1>

              <p className="mt-2 max-w-xl text-xs leading-6 text-slate-500 dark:text-slate-400">
                LOOP sends your
                question through
                the application API
                and displays
                supporting
                feedback when the
                response includes
                citations.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-[330px]">
              <HeaderMetric
                value={
                  conversationStats.questions
                }
                label="Questions"
              />

              <HeaderMetric
                value={
                  conversationStats.answers
                }
                label="Answers"
              />

              <HeaderMetric
                value={
                  conversationStats.evidence
                }
                label="Citations"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <header className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-[10px] font-bold text-white">
                  AI
                </span>

                <div>
                  <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
                    LOOP Assistant
                  </h2>

                  <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                    Answers are
                    requested from
                    the Ask LOOP API.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                  {(
                    [
                      "Concise",
                      "Detailed",
                    ] as AnswerMode[]
                  ).map(
                    (mode) => (
                      <button
                        key={
                          mode
                        }
                        type="button"
                        onClick={() =>
                          setAnswerMode(
                            mode,
                          )
                        }
                        className={`rounded-lg px-3 py-2 text-[10px] font-semibold transition ${
                          answerMode ===
                          mode
                            ? "bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        {
                          mode
                        }
                      </button>
                    ),
                  )}
                </div>

                <button
                  type="button"
                  onClick={
                    clearConversation
                  }
                  disabled={
                    isThinking ||
                    (messages.length ===
                      1 &&
                      messages[0]
                        .id ===
                        "welcome-message")
                  }
                  className="h-9 rounded-xl border border-slate-200 px-3.5 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Clear
                </button>
              </div>
            </header>

            <div className="h-[590px] space-y-5 overflow-y-auto bg-slate-50/70 p-4 dark:bg-slate-950/40 sm:p-5">
              {messages.map(
                (message) => (
                  <MessageBubble
                    key={
                      message.id
                    }
                    message={
                      message
                    }
                    copied={
                      copiedMessageId ===
                      message.id
                    }
                    onCopy={() =>
                      void copyAnswer(
                        message,
                      )
                    }
                  />
                ),
              )}

              {isThinking && (
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-[9px] font-bold text-white">
                    AI
                  </span>

                  <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-300">
                      Searching
                      workspace
                      feedback…
                    </p>

                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" />

                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:120ms]" />

                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div
                ref={
                  chatBottomRef
                }
              />
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="border-t border-slate-200 p-4 dark:border-slate-800 sm:p-5"
            >
              <div className="rounded-xl border border-slate-200 bg-white p-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900">
                <textarea
                  ref={
                    inputRef
                  }
                  rows={3}
                  value={
                    input
                  }
                  maxLength={
                    maximumQuestionLength
                  }
                  disabled={
                    isThinking
                  }
                  onKeyDown={
                    handleInputKeyDown
                  }
                  onChange={(
                    event,
                  ) =>
                    setInput(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Ask about sentiment, recurring issues, product feedback or customer concerns…"
                  className="w-full resize-none bg-transparent px-1 py-1 text-xs leading-6 text-slate-950 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-white dark:placeholder:text-slate-500"
                />

                <div className="mt-2 flex flex-col gap-3 border-t border-slate-200 pt-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[9px] text-slate-400">
                      Enter to send
                      · Shift +
                      Enter for new
                      line
                    </p>

                    <span
                      className={`text-[9px] font-semibold ${
                        input.length >
                        maximumQuestionLength -
                          50
                          ? "text-rose-600"
                          : "text-slate-400"
                      }`}
                    >
                      {
                        input.length
                      }
                      /
                      {
                        maximumQuestionLength
                      }
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isThinking ||
                      !input.trim()
                    }
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-[11px] font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isThinking ? (
                      <>
                        <LoadingSpinner />

                        Asking…
                      </>
                    ) : (
                      <>
                        Ask LOOP

                        <SendIcon />
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="mt-3 text-center text-[9px] leading-5 text-slate-400">
                Review important
                conclusions against
                the cited customer
                feedback.
              </p>
            </form>
          </article>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
                  Suggested
                  questions
                </h2>

                <p className="mt-1 text-[10px] leading-5 text-slate-500 dark:text-slate-400">
                  Use a prompt as a
                  starting point.
                </p>
              </div>

              <div className="mt-4 space-y-2">
                {suggestedQuestions.map(
                  (
                    question,
                    index,
                  ) => (
                    <button
                      key={
                        question.title
                      }
                      type="button"
                      disabled={
                        isThinking
                      }
                      onClick={() =>
                        void sendQuestion(
                          question.title,
                        )
                      }
                      className="group w-full rounded-xl border border-slate-200 p-3.5 text-left transition hover:border-blue-300 hover:bg-blue-50/50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[9px] font-bold text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-slate-800 dark:text-slate-400">
                          {index +
                            1}
                        </span>

                        <div className="min-w-0">
                          <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-blue-600 dark:text-blue-300">
                            {
                              question.category
                            }
                          </span>

                          <p className="mt-1.5 text-[11px] font-semibold leading-5 text-slate-800 dark:text-slate-200">
                            {
                              question.title
                            }
                          </p>

                          <p className="mt-1 text-[9px] leading-4 text-slate-400">
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

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
                Conversation
              </h2>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <SmallStat
                  value={
                    conversationStats.questions
                  }
                  label="Questions"
                />

                <SmallStat
                  value={
                    conversationStats.answers
                  }
                  label="Answers"
                />

                <SmallStat
                  value={
                    conversationStats.evidence
                  }
                  label="Citations"
                />
              </div>

              {recentQuestions.length >
                0 && (
                <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Recent
                    questions
                  </p>

                  <div className="mt-3 space-y-2">
                    {recentQuestions.map(
                      (
                        message,
                      ) => (
                        <button
                          key={
                            message.id
                          }
                          type="button"
                          disabled={
                            isThinking
                          }
                          onClick={() =>
                            void sendQuestion(
                              message.content,
                            )
                          }
                          className="line-clamp-2 w-full rounded-lg bg-slate-50 px-3 py-2.5 text-left text-[10px] font-medium leading-5 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
                        >
                          {
                            message.content
                          }
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">
                  How Ask LOOP
                  works
                </h2>

                <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-blue-300">
                  Grounded Q&A
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <ProcessStep
                  number="1"
                  title="Ask"
                  description="Your question is sent to the Ask LOOP API."
                />

                <ProcessStep
                  number="2"
                  title="Retrieve"
                  description="Relevant workspace feedback is retrieved by the server."
                />

                <ProcessStep
                  number="3"
                  title="Answer"
                  description="The server produces an answer using the retrieved context."
                />

                <ProcessStep
                  number="4"
                  title="Cite"
                  description="Returned feedback citations are displayed with the answer."
                />
              </div>
            </section>
          </aside>
        </section>
      </div>
    </LoopShell>
  );
}

function MessageBubble({
  message,
  copied,
  onCopy,
}: {
  message: ChatMessage;
  copied: boolean;
  onCopy: () => void;
}) {
  const isUser =
    message.role ===
    "user";

  const messageTime =
    formatMessageTime(
      message.createdAt,
    );

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      {!isUser && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-[9px] font-bold text-white">
          AI
        </span>
      )}

      <div
        className={`max-w-[92%] sm:max-w-[84%] ${
          isUser
            ? "rounded-2xl rounded-tr-md bg-slate-950 px-4 py-3 text-white dark:bg-blue-600"
            : "rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <p
            className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${
              isUser
                ? "text-slate-300 dark:text-blue-100"
                : "text-blue-600 dark:text-blue-300"
            }`}
          >
            {isUser
              ? "You"
              : "LOOP Answer"}
          </p>

          {messageTime && (
            <span
              className={`text-[8px] ${
                isUser
                  ? "text-slate-400 dark:text-blue-100/70"
                  : "text-slate-400"
              }`}
            >
              {
                messageTime
              }
            </span>
          )}
        </div>

        <p
          className={`mt-2 whitespace-pre-wrap text-xs leading-6 ${
            isUser
              ? "text-slate-100"
              : "text-slate-700 dark:text-slate-300"
          }`}
        >
          {message.content}
        </p>

        {message.engine && (
          <p className="mt-3 text-[8px] text-slate-400">
            Engine:{" "}
            {
              message.engine
            }
          </p>
        )}

        {message.evidence &&
          message.evidence.length >
            0 && (
            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Supporting
                  evidence
                </p>

                <span className="rounded-full bg-blue-50 px-2 py-1 text-[8px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  {
                    message
                      .evidence
                      .length
                  }{" "}
                  citation
                  {message
                    .evidence
                    .length ===
                  1
                    ? ""
                    : "s"}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {message.evidence.map(
                  (
                    evidence,
                    index,
                  ) => (
                    <EvidenceCard
                      key={`${message.id}-${evidence.id}-${index}`}
                      evidence={
                        evidence
                      }
                      index={
                        index
                      }
                    />
                  ),
                )}
              </div>
            </div>
          )}

        {!isUser &&
          message.id !==
            "welcome-message" && (
            <div className="mt-4 flex justify-end border-t border-slate-200 pt-3 dark:border-slate-700">
              <button
                type="button"
                onClick={
                  onCopy
                }
                className="inline-flex h-8 items-center gap-2 rounded-lg px-2.5 text-[9px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-300"
              >
                {copied ? (
                  <>
                    <CheckIcon />

                    Copied
                  </>
                ) : (
                  <>
                    <CopyIcon />

                    Copy
                  </>
                )}
              </button>
            </div>
          )}
      </div>

      {isUser && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-[8px] font-bold text-white dark:bg-slate-700">
          YOU
        </span>
      )}
    </div>
  );
}

function EvidenceCard({
  evidence,
  index,
}: {
  evidence: Evidence;
  index: number;
}) {
  const relevance =
    formatRelevance(
      evidence.relevance,
    );

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[9px] font-bold text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300">
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] leading-5 text-slate-600 dark:text-slate-300">
            “
            {
              evidence.quote
            }
            ”
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[8px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {
                evidence.customer
              }
            </span>

            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[8px] font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
              {
                evidence.source
              }
            </span>

            <span
              className={`rounded-full border px-2 py-1 text-[8px] font-semibold ${getSentimentStyle(
                evidence.sentiment,
              )}`}
            >
              {
                evidence.sentiment
              }
            </span>

            {relevance && (
              <span className="text-[8px] font-medium text-slate-400">
                {
                  relevance
                }
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function HeaderMetric({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center dark:border-slate-700 dark:bg-slate-800/60">
      <p className="text-lg font-semibold text-slate-950 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function SmallStat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/60">
      <p className="text-lg font-semibold text-slate-950 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-[8px] text-slate-400">
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
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-[9px] font-bold">
        {number}
      </span>

      <div>
        <p className="text-[11px] font-semibold text-white">
          {title}
        </p>

        <p className="mt-1 text-[9px] leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function Toast({
  toast,
  onClose,
}: {
  toast: ToastMessage;
  onClose: () => void;
}) {
  const styles =
    toast.type ===
    "success"
      ? "border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-300"
      : toast.type ===
          "error"
        ? "border-rose-200 text-rose-700 dark:border-rose-900 dark:text-rose-300"
        : "border-blue-200 text-blue-700 dark:border-blue-900 dark:text-blue-300";

  return (
    <div
      className={`fixed right-4 top-24 z-[90] flex max-w-sm items-start gap-3 rounded-xl border bg-white p-4 shadow-xl dark:bg-slate-900 ${styles}`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold">
        {toast.type ===
        "success"
          ? "✓"
          : toast.type ===
              "error"
            ? "!"
            : "i"}
      </span>

      <p className="min-w-0 flex-1 text-[11px] leading-5">
        {
          toast.message
        }
      </p>

      <button
        type="button"
        onClick={
          onClose
        }
        aria-label="Close message"
        className="text-slate-400 transition hover:text-slate-700 dark:hover:text-white"
      >
        ×
      </button>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-3.5 w-3.5"
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
      className="h-3.5 w-3.5"
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
      className="h-3.5 w-3.5"
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