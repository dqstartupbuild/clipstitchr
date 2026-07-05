export type WorkflowStep = {
  description?: string;
  label: string;
  status: "complete" | "current" | "upcoming";
};

type WorkflowStepListProps = {
  label: string;
  steps: readonly WorkflowStep[];
};

export function WorkflowStepList({ label, steps }: WorkflowStepListProps) {
  return (
    <nav aria-label={label}>
      <ol className="grid gap-2 rounded-lg border border-border bg-surface p-2 shadow-sm shadow-slate-200/60 sm:grid-cols-4">
        {steps.map((step, index) => (
          <li
            key={step.label}
            className={[
              "rounded-md px-3 py-2",
              step.status === "current"
                ? "bg-surface-muted"
                : step.status === "complete"
                  ? "bg-white"
                  : "",
            ].join(" ")}
          >
            <p
              className={[
                "text-xs font-bold uppercase text-text-tertiary",
                step.status === "current" ? "text-accent-dark" : "",
              ].join(" ")}
            >
              Step {index + 1}
            </p>
            <p className="mt-1 text-sm font-bold text-text-primary">
              {step.label}
            </p>
            {step.description ? (
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                {step.description}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
