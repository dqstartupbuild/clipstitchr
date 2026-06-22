import { CheckCircle2 } from "lucide-react";
import type { OnboardingStep } from "@/lib/clipstitchr/types/OnboardingStep";

type OnboardingProgressStepsProps = {
  activeStep: OnboardingStep;
};

const progressSteps: {
  label: string;
  steps: OnboardingStep[];
}[] = [
  {
    label: "Product",
    steps: ["product-start", "product-review"],
  },
  {
    label: "UGC",
    steps: ["ugc-upload"],
  },
  {
    label: "Demo",
    steps: ["demo-upload"],
  },
  {
    label: "Batch",
    steps: ["batch"],
  },
];

export function OnboardingProgressSteps({
  activeStep,
}: OnboardingProgressStepsProps) {
  const activeIndex = progressSteps.findIndex((item) =>
    item.steps.includes(activeStep),
  );

  return (
    <ol className="grid gap-2 rounded-lg border border-border bg-surface p-2 shadow-sm shadow-slate-200/60 sm:grid-cols-4">
      {progressSteps.map((item, index) => {
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex;

        return (
          <li
            key={item.label}
            className={[
              "flex min-w-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold",
              isActive
                ? "bg-surface-muted text-accent-dark"
                : isComplete
                  ? "text-text-primary"
                  : "text-text-tertiary",
            ].join(" ")}
          >
            {isComplete ? (
              <CheckCircle2 aria-hidden className="h-4 w-4 shrink-0" />
            ) : (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs">
                {index + 1}
              </span>
            )}
            <span className="truncate">{item.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
