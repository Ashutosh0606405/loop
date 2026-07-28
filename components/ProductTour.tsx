"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

type TourStep = {
  id: string;
  title: string;
  description: string;
  helperText: string;
  href?: string;
  buttonLabel?: string;
  icon: ReactNode;
  badge: string;
};

const tourStorageKey =
  "loop-product-tour-completed-v1";

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Project LOOP",
    description:
      "LOOP transforms customer feedback into sentiment, themes, trends and actionable insights.",
    helperText:
      "This short tour introduces the important areas of your workspace.",
    icon: <SparklesIcon />,
    badge: "Welcome",
  },
  {
    id: "dashboard",
    title: "Understand Feedback at a Glance",
    description:
      "The dashboard shows feedback volume, positive sentiment, open issues, AI confidence and recent activity.",
    helperText:
      "Use dashboard filters to compare feedback performance across different time periods.",
    href: "/dashboard",
    buttonLabel: "Open Dashboard",
    icon: <DashboardIcon />,
    badge: "Dashboard",
  },
  {
    id: "feedback",
    title: "Manage Customer Feedback",
    description:
      "Add individual feedback, import CSV records, search feedback and filter by sentiment, channel or status.",
    helperText:
      "Feedback data is classified by LOOP AI after backend processing is connected.",
    href: "/feedback",
    buttonLabel: "Open Feedback",
    icon: <FeedbackIcon />,
    badge: "Feedback",
  },
  {
    id: "ask-loop",
    title: "Ask Questions Using AI",
    description:
      "Ask LOOP helps users understand customer concerns, sentiment changes and recurring themes using natural-language questions.",
    helperText:
      "Try questions such as: What are the main payment complaints this month?",
    href: "/ask-loop",
    buttonLabel: "Open Ask LOOP",
    icon: <AskIcon />,
    badge: "AI Assistant",
  },
  {
    id: "reports",
    title: "Generate Insight Reports",
    description:
      "Create executive summaries, sentiment reports and theme analysis for selected reporting periods.",
    helperText:
      "Reports can be downloaded, exported and shared with stakeholders.",
    href: "/reports",
    buttonLabel: "Open Reports",
    icon: <ReportsIcon />,
    badge: "Reports",
  },
  {
    id: "productivity",
    title: "Work Faster with Quick Actions",
    description:
      "Use the command palette, notification centre and theme selector from the LOOP header.",
    helperText:
      "Press Ctrl + K anywhere inside LOOP to search pages, actions and appearance settings.",
    icon: <CommandIcon />,
    badge: "Productivity",
  },
  {
    id: "complete",
    title: "Your Workspace is Ready",
    description:
      "You now know the main features available in Project LOOP.",
    helperText:
      "You can restart this tour later from the help button in the header.",
    icon: <CheckIcon />,
    badge: "Completed",
  },
];

export default function ProductTour() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] =
    useState(0);
  const [mounted, setMounted] =
    useState(false);

  const step = tourSteps[currentStep];

  const progress =
    ((currentStep + 1) / tourSteps.length) *
    100;

  const isFirstStep = currentStep === 0;

  const isLastStep =
    currentStep === tourSteps.length - 1;

  useEffect(() => {
    setMounted(true);

    const completed =
      window.localStorage.getItem(
        tourStorageKey,
      );

    let timer: number | undefined;

    if (completed !== "true") {
      timer = window.setTimeout(() => {
        setCurrentStep(0);
        setIsOpen(true);
      }, 900);
    }

    function restartTour() {
      setCurrentStep(0);
      setIsOpen(true);
    }

    window.addEventListener(
      "loop-product-tour",
      restartTour,
    );

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }

      window.removeEventListener(
        "loop-product-tour",
        restartTour,
      );
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "ArrowRight") {
        event.preventDefault();

        setCurrentStep((previous) =>
          Math.min(
            previous + 1,
            tourSteps.length - 1,
          ),
        );
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();

        setCurrentStep((previous) =>
          Math.max(previous - 1, 0),
        );
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isOpen]);

  function handleNext() {
    if (isLastStep) {
      finishTour();
      return;
    }

    setCurrentStep((previous) =>
      Math.min(
        previous + 1,
        tourSteps.length - 1,
      ),
    );
  }

  function handlePrevious() {
    setCurrentStep((previous) =>
      Math.max(previous - 1, 0),
    );
  }

  function skipTour() {
    window.localStorage.setItem(
      tourStorageKey,
      "true",
    );

    setIsOpen(false);
  }

  function finishTour() {
    window.localStorage.setItem(
      tourStorageKey,
      "true",
    );

    setIsOpen(false);
  }

  function openStepPage() {
    if (!step.href) {
      return;
    }

    router.push(step.href);
  }

  if (!mounted || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md" />

      {/* Decorative Glow */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />

      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

      {/* Tour Card */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-tour-title"
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        {/* Progress */}
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {step.badge}
            </span>

            <span className="text-xs font-semibold text-slate-400">
              Step {currentStep + 1} of{" "}
              {tourSteps.length}
            </span>
          </div>

          <button
            type="button"
            onClick={skipTour}
            className="text-xs font-bold text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
          >
            Skip tour
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6 sm:p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-xl shadow-blue-200 dark:shadow-none">
            {step.icon}
          </div>

          <h2
            id="product-tour-title"
            className="mt-6 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl"
          >
            {step.title}
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            {step.description}
          </p>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-violet-50 p-4 dark:border-blue-900 dark:from-blue-950 dark:to-violet-950">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              <InfoIcon />
            </span>

            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {step.helperText}
            </p>
          </div>

          {step.href && (
            <button
              type="button"
              onClick={openStepPage}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-blue-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
            >
              {step.buttonLabel}

              <span aria-hidden="true">↗</span>
            </button>
          )}

          {/* Step Indicators */}
          <div className="mt-8 flex flex-wrap gap-2">
            {tourSteps.map(
              (tourStep, index) => (
                <button
                  key={tourStep.id}
                  type="button"
                  onClick={() =>
                    setCurrentStep(index)
                  }
                  aria-label={`Open tour step ${
                    index + 1
                  }`}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentStep
                      ? "w-9 bg-blue-600"
                      : index < currentStep
                        ? "w-2.5 bg-emerald-500"
                        : "w-2.5 bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              ),
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Previous
          </button>

          <div className="flex items-center justify-end gap-3">
            <span className="hidden text-[10px] font-semibold text-slate-400 sm:block">
              Use ← → arrow keys
            </span>

            <button
              type="button"
              onClick={handleNext}
              className="flex min-w-32 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl dark:shadow-none"
            >
              {isLastStep
                ? "Finish Tour"
                : "Next Step"}

              {!isLastStep && (
                <span aria-hidden="true">
                  →
                </span>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function IconBase({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-7 w-7"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function SparklesIcon() {
  return (
    <IconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m18 14 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z"
      />
    </IconBase>
  );
}

function DashboardIcon() {
  return (
    <IconBase>
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="2"
      />

      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="2"
      />

      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="2"
      />

      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="2"
      />
    </IconBase>
  );
}

function FeedbackIcon() {
  return (
    <IconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 18.5 3.5 21v-5.2A8.5 8.5 0 1 1 7 18.5Z"
      />

      <path
        strokeLinecap="round"
        d="M8 9h8M8 13h5"
      />
    </IconBase>
  );
}

function AskIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="9" />

      <path
        strokeLinecap="round"
        d="M9.5 9a2.7 2.7 0 1 1 4.4 2.1c-1 .8-1.9 1.2-1.9 2.4M12 17h.01"
      />
    </IconBase>
  );
}

function ReportsIcon() {
  return (
    <IconBase>
      <path
        strokeLinecap="round"
        d="M4 20V10M10 20V4M16 20v-7M22 20H2"
      />
    </IconBase>
  );
}

function CommandIcon() {
  return (
    <IconBase>
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="3"
      />

      <path
        strokeLinecap="round"
        d="M7 9h10M7 13h6M16 13h1M7 17h3"
      />
    </IconBase>
  );
}

function CheckIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="9" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8 12 2.5 2.5L16.5 8.5"
      />
    </IconBase>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />

      <path
        strokeLinecap="round"
        d="M12 11v5M12 8h.01"
      />
    </svg>
  );
}