import type { ReactNode } from "react";
import { Panel } from "@/app/_components/ui/Panel";
import { ProgressBar } from "@/app/_components/ui/ProgressBar";

type WorkflowStatusPanelProps = {
  children?: ReactNode;
  className?: string;
  error?: string | null;
  eyebrow?: string;
  message?: string | null;
  progress?: number | null;
  statusLabel?: string | null;
  title: string;
};

export function WorkflowStatusPanel({
  children,
  className = "",
  error = null,
  eyebrow,
  message = null,
  progress = null,
  statusLabel = null,
  title,
}: WorkflowStatusPanelProps) {
  const hasProgress = typeof progress === "number";

  return (
    <Panel className={["p-4", className].filter(Boolean).join(" ")}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-sm font-semibold text-accent-dark">{eyebrow}</p>
          ) : null}
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            {title}
          </h2>
        </div>
        {statusLabel ? (
          <span className="shrink-0 rounded-md border border-border bg-surface-muted px-2 py-1 text-xs font-semibold text-text-secondary">
            {statusLabel}
          </span>
        ) : null}
      </div>
      {hasProgress ? (
        <div className="mt-4">
          <ProgressBar value={progress} />
        </div>
      ) : null}
      {message ? (
        <p className="mt-3 text-sm font-semibold leading-6 text-text-secondary">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </Panel>
  );
}
