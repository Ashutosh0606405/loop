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
      "LOOP brings customer feedback, sentiment, themes and evidence-backed insights into one workspace.",
    helperText:
      "This short tour introduces the main frontend areas currently available in your LOOP workspace.",
    icon: <SparklesIcon />,
    badge: "Welcome",
  },
  {
    id: "dashboard",
    title: "Understand Workspace Feedback",
    description:
      "The dashboard summarizes real workspace feedback activity, classification coverage, sentiment, workflow status, themes and sources.",
    helperText:
      "Use the 7-day, 30-day and 90-day controls to review feedback across different periods.",
    href: "/dashboard",
    buttonLabel: "Open Dashboard",
    icon: <DashboardIcon />,
    badge: "Dashboard",
  },
  {
    id: "feedback",
    title: "Manage Customer Feedback",
    description:
      "Add individual feedback, import CSV records, search feedback and filter by sentiment, channel or workflow status.",
    helperText:
      "Feedback that has not been classified yet is shown honestly as Unclassified rather than being assigned a placeholder sentiment.",
    href: "/feedback",
    buttonLabel: "Open Feedback",
    icon: <FeedbackIcon />,
    badge: "Feedback",
  },
  {
    id: "ask-loop",
    title: "Ask Questions with Evidence",
    description:
      "Ask LOOP sends natural-language questions through the application API and displays answers with supporting feedback citations when available.",
    helperText:
      "Grounded answers should be based on retrieved workspace feedback rather than invented customer comments.",
    href: "/ask-loop",
    buttonLabel: "Open Ask LOOP",
    icon: <AskIcon />,
    badge: "Ask LOOP",
  },
  {
    id: "reports",
    title: "Review Feedback Reports",
    description:
      "Reports summarizes real feedback volume, classification coverage, sentiment, themes, channels and workflow data for the selected period.",
    helperText:
      "The current report page can export the selected feedback records as CSV without adding fake report metrics.",
    href: "/reports",
    buttonLabel: "Open Reports",
    icon: <ReportsIcon />,
    badge: "Reports",
  },
  {
    id: "productivity",
    title: "Use Workspace Shortcuts",
    description:
      "Use the command palette, notification centre and appearance controls from the LOOP header.",
    helperText:
      "Press Ctrl + K anywhere inside the workspace to quickly open pages, account areas and theme controls.",
    icon: <CommandIcon />,
    badge: "Workspace",
  },
  {
    id: "complete",
    title: "Workspace Tour Complete",
    description:
      "You now know the main frontend areas currently available in Project LOOP.",
    helperText:
      "You can restart this tour at any time using the help control in the workspace header.",
    icon: <CheckIcon />,
    badge: "Complete",
  },
];

export default function ProductTour() {
  const router = useRouter();

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    currentStep,
    setCurrentStep,
  ] = useState(0);

  const step =
    tourSteps[currentStep];

  const progress =
    ((currentStep + 1) /
      tourSteps.length) *
    100;

  const isFirstStep =
    currentStep === 0;

  const isLastStep =
    currentStep ===
    tourSteps.length - 1;

  useEffect(() => {
    let timer:
      | number
      | undefined;

    try {
      const completed =
        window.localStorage.getItem(
          tourStorageKey,
        );

      if (
        completed !== "true"
      ) {
        timer =
          window.setTimeout(
            () => {
              setCurrentStep(
                0,
              );

              setIsOpen(
                true,
              );
            },
            900,
          );
      }
    } catch {
      // Local storage may be unavailable in
      // restricted browser environments.
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
      if (
        timer !==
        undefined
      ) {
        window.clearTimeout(
          timer,
        );
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
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        "ArrowRight"
      ) {
        event.preventDefault();

        setCurrentStep(
          (previous) =>
            Math.min(
              previous + 1,
              tourSteps.length -
                1,
            ),
        );

        return;
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        event.preventDefault();

        setCurrentStep(
          (previous) =>
            Math.max(
              previous - 1,
              0,
            ),
        );

        return;
      }

      if (
        event.key ===
        "Escape"
      ) {
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

    setCurrentStep(
      (previous) =>
        Math.min(
          previous + 1,
          tourSteps.length -
            1,
        ),
    );
  }

  function handlePrevious() {
    setCurrentStep(
      (previous) =>
        Math.max(
          previous - 1,
          0,
        ),
    );
  }

  function markTourComplete() {
    try {
      window.localStorage.setItem(
        tourStorageKey,
        "true",
      );
    } catch {
      // Keep the tour usable even if local
      // storage is unavailable.
    }
  }

  function skipTour() {
    markTourComplete();

    setIsOpen(false);
  }

  function finishTour() {
    markTourComplete();

    setIsOpen(false);
  }

  function openStepPage() {
    if (!step.href) {
      return;
    }

    setIsOpen(false);

    router.push(
      step.href,
    );
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close product tour"
        onClick={
          skipTour
        }
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-tour-title"
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="h-1 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-blue-600 transition-[width] duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              {step.badge}
            </span>

            <span className="text-[10px] font-medium text-slate-400">
              Step{" "}
              {currentStep +
                1}{" "}
              of{" "}
              {
                tourSteps.length
              }
            </span>
          </div>

          <button
            type="button"
            onClick={
              skipTour
            }
            className="shrink-0 text-[10px] font-semibold text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
          >
            Skip tour
          </button>
        </header>

        <div className="p-6 sm:p-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            {step.icon}
          </div>

          <h2
            id="product-tour-title"
            className="mt-5 text-xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-2xl"
          >
            {step.title}
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {
              step.description
            }
          </p>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
              <InfoIcon />
            </span>

            <p className="text-[11px] leading-5 text-slate-600 dark:text-slate-300">
              {
                step.helperText
              }
            </p>
          </div>

          {step.href && (
            <button
              type="button"
              onClick={
                openStepPage
              }
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[11px] font-semibold text-blue-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
            >
              {
                step.buttonLabel
              }

              <span
                aria-hidden="true"
              >
                ↗
              </span>
            </button>
          )}

          <div className="mt-7 flex flex-wrap gap-2">
            {tourSteps.map(
              (
                tourStep,
                index,
              ) => (
                <button
                  key={
                    tourStep.id
                  }
                  type="button"
                  onClick={() =>
                    setCurrentStep(
                      index,
                    )
                  }
                  aria-label={`Open tour step ${
                    index + 1
                  }`}
                  aria-current={
                    index ===
                    currentStep
                      ? "step"
                      : undefined
                  }
                  className={`h-2 rounded-full transition-all ${
                    index ===
                    currentStep
                      ? "w-8 bg-blue-600"
                      : index <
                          currentStep
                        ? "w-2 bg-slate-500"
                        : "w-2 bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              ),
            )}
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={
              handlePrevious
            }
            disabled={
              isFirstStep
            }
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Previous
          </button>

          <div className="flex items-center justify-end gap-3">
            <span className="hidden text-[9px] font-medium text-slate-400 sm:block">
              ← → keyboard
            </span>

            <button
              type="button"
              onClick={
                handleNext
              }
              className="h-10 min-w-28 rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white transition hover:bg-blue-500"
            >
              {isLastStep
                ? "Finish"
                : "Next"}
            </button>
          </div>
        </footer>
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
      className="h-5 w-5"
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
      <circle
        cx="12"
        cy="12"
        r="9"
      />

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
      <circle
        cx="12"
        cy="12"
        r="9"
      />

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