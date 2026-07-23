"use client";

import type { FormEvent } from "react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import LoopShell from "../../components/LoopShell";

type Evidence = {
  quote: string;
  source: string;
  sentiment: "Positive" | "Neutral" | "Negative";
};

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  evidence?: Evidence[];
};

const suggestedQuestions = [
  "What are customers saying about payments?",
  "Which issues need immediate attention?",
  "Summarize the onboarding feedback",
  "What features do customers like the most?",
];

function generateDemoAnswer(question: string) {
  const normalizedQuestion = question.toLowerCase();

  if (
    normalizedQuestion.includes("payment") ||
    normalizedQuestion.includes("transaction")
  ) {
    return {
      content:
        "Payment-related feedback is increasing. Most customers report that the transaction succeeds, but the confirmation message takes too long. Customers want a clearer real-time payment status and faster confirmation.",
      evidence: [
        {
          quote:
            "Payment succeeded, but the confirmation message arrived late.",
          source: "Support Ticket",
          sentiment: "Neutral" as const,
        },
        {
          quote:
            "I was not sure whether my payment was completed.",
          source: "App Review",
          sentiment: "Negative" as const,
        },
      ],
    };
  }

  if (
    normalizedQuestion.includes("onboarding") ||
    normalizedQuestion.includes("new user")
  ) {
    return {
      content:
        "Customers find the product useful, but first-time users feel that the onboarding process contains too many steps. A shorter walkthrough and clearer first-action guidance could improve the experience.",
      evidence: [
        {
          quote:
            "I would like a simpler onboarding guide for first-time users.",
          source: "NPS Survey",
          sentiment: "Neutral" as const,
        },
        {
          quote:
            "The first screen contains too many options.",
          source: "User Interview",
          sentiment: "Negative" as const,
        },
      ],
    };
  }

  if (
    normalizedQuestion.includes("like") ||
    normalizedQuestion.includes("positive") ||
    normalizedQuestion.includes("best")
  ) {
    return {
      content:
        "Customers respond positively to the clean dashboard, responsive user interface and quick customer-support resolution. User experience is currently the strongest positive theme.",
      evidence: [
        {
          quote:
            "The latest dashboard update is clean and very easy to use.",
          source: "App Review",
          sentiment: "Positive" as const,
        },
        {
          quote:
            "The support executive resolved my account issue quickly.",
          source: "Social Media",
          sentiment: "Positive" as const,
        },
      ],
    };
  }

  if (
    normalizedQuestion.includes("issue") ||
    normalizedQuestion.includes("attention") ||
    normalizedQuestion.includes("problem")
  ) {
    return {
      content:
        "The most urgent issue is checkout performance, followed by delayed payment confirmation. Customers experience page slowdown when multiple products are added. These two areas should receive immediate attention.",
      evidence: [
        {
          quote:
            "The checkout page becomes slow when multiple products are added.",
          source: "Survey",
          sentiment: "Negative" as const,
        },
        {
          quote:
            "Payment confirmation took too long.",
          source: "Support Ticket",
          sentiment: "Neutral" as const,
        },
      ],
    };
  }

  return {
    content:
      "Based on the available demo feedback, customers generally like the dashboard and customer-support experience. The main improvement opportunities are checkout speed, payment confirmation and onboarding clarity.",
    evidence: [
      {
        quote:
          "The dashboard is clean and easy to use.",
        source: "App Review",
        sentiment: "Positive" as const,
      },
      {
        quote:
          "The checkout page becomes slow when multiple products are added.",
        source: "Survey",
        sentiment: "Negative" as const,
      },
    ],
  };
}

function getEvidenceStyle(
  sentiment: Evidence["sentiment"],
) {
  if (sentiment === "Positive") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (sentiment === "Negative") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-amber-100 text-amber-700";
}

export default function AskLoopPage() {
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] =
    useState(false);

  const [messages, setMessages] = useState<
    ChatMessage[]
  >([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I am LOOP AI. Ask me about customer sentiment, recurring issues, product opportunities or feedback themes.",
    },
  ]);

  const chatBottomRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  function sendQuestion(customQuestion?: string) {
    const question = (
      customQuestion ?? input
    ).trim();

    if (!question || isThinking) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setInput("");
    setIsThinking(true);

    window.setTimeout(() => {
      const answer =
        generateDemoAnswer(question);

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: answer.content,
        evidence: answer.evidence,
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        assistantMessage,
      ]);

      setIsThinking(false);
    }, 900);
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    sendQuestion();
  }

  function clearConversation() {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content:
          "Conversation cleared. Ask me a new question about your customer feedback.",
      },
    ]);

    setInput("");
  }

  return (
    <LoopShell
      title="Ask LOOP"
      subtitle="Ask questions and receive evidence-backed customer insights."
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-blue-700 to-slate-950 p-7 text-white shadow-xl md:p-9">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            AI feedback analyst
          </div>

          <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight md:text-4xl">
            Ask your customer feedback a
            question.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
            LOOP finds relevant customer
            conversations and returns a clear
            answer supported by real feedback
            evidence.
          </p>
        </div>
      </section>

      {/* Prototype Notice */}
      <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="text-sm font-bold text-amber-800">
          Frontend Prototype
        </p>

        <p className="mt-1 text-sm leading-6 text-amber-700">
          These responses currently use frontend
          demo logic. Claude API, embeddings,
          database search and real RAG functionality
          will be connected by the backend.
        </p>
      </section>

      <section className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        {/* Chat Area */}
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Chat Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-blue-200">
                AI
              </div>

              <div>
                <h2 className="font-bold">
                  LOOP Intelligence Assistant
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Evidence-backed feedback
                  conversation
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearConversation}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Clear Chat
            </button>
          </div>

          {/* Messages */}
          <div className="h-[540px] space-y-5 overflow-y-auto bg-slate-50 p-5 md:p-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-md bg-slate-950 px-5 py-4 text-sm leading-6 text-white shadow-sm"
                      : "max-w-[92%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-700 shadow-sm"
                  }
                >
                  {message.role ===
                    "assistant" && (
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-[10px] font-bold text-blue-700">
                        AI
                      </span>

                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        LOOP Answer
                      </p>
                    </div>
                  )}

                  <p>{message.content}</p>

                  {message.evidence &&
                    message.evidence.length >
                      0 && (
                      <div className="mt-5 space-y-3 border-t border-slate-200 pt-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Supporting Evidence
                        </p>

                        {message.evidence.map(
                          (evidence, index) => (
                            <article
                              key={`${evidence.source}-${index}`}
                              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                            >
                              <p className="text-sm italic leading-6 text-slate-600">
                                “{evidence.quote}”
                              </p>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                  {evidence.source}
                                </span>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getEvidenceStyle(
                                    evidence.sentiment,
                                  )}`}
                                >
                                  {
                                    evidence.sentiment
                                  }
                                </span>
                              </div>
                            </article>
                          ),
                        )}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {/* AI Loading */}
            {isThinking && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-5 py-4 shadow-sm">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-600">
                    LOOP is analysing
                  </p>

                  <div className="flex items-center gap-1.5">
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
            className="border-t border-slate-200 bg-white p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                placeholder="Ask about payments, onboarding, sentiment..."
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="submit"
                disabled={
                  isThinking || !input.trim()
                }
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isThinking
                  ? "Thinking..."
                  : "Send →"}
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Ask only questions related to the
              collected customer feedback.
            </p>
          </form>
        </article>

        {/* Right Panel */}
        <aside className="space-y-6">
          {/* Suggested Questions */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">
              Suggested Questions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a question to begin.
            </p>

            <div className="mt-5 space-y-3">
              {suggestedQuestions.map(
                (question, index) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() =>
                      sendQuestion(question)
                    }
                    disabled={isThinking}
                    className="group flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-blue-700 shadow-sm">
                      {index + 1}
                    </span>

                    <span className="text-sm font-medium leading-5 text-slate-700 group-hover:text-blue-700">
                      {question}
                    </span>
                  </button>
                ),
              )}
            </div>
          </section>

          {/* How it Works */}
          <section className="rounded-2xl bg-slate-950 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">
                How Ask LOOP Works
              </h2>

              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                RAG
              </span>
            </div>

            <div className="mt-6 space-y-6">
              {[
                {
                  number: "1",
                  title: "Understand",
                  description:
                    "LOOP understands the meaning of the question.",
                },
                {
                  number: "2",
                  title: "Retrieve",
                  description:
                    "Relevant customer feedback records are selected.",
                },
                {
                  number: "3",
                  title: "Generate",
                  description:
                    "AI creates an answer using only that evidence.",
                },
                {
                  number: "4",
                  title: "Cite",
                  description:
                    "Supporting feedback is displayed with the answer.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="flex gap-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold">
                    {step.number}
                  </span>

                  <div>
                    <p className="text-sm font-semibold">
                      {step.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Insight Stats */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">
              Knowledge Base
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-2xl font-bold text-blue-700">
                  1,248
                </p>

                <p className="mt-1 text-xs text-blue-600">
                  Feedback records
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-4">
                <p className="text-2xl font-bold text-violet-700">
                  12
                </p>

                <p className="mt-1 text-xs text-violet-600">
                  Active themes
                </p>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </LoopShell>
  );
}