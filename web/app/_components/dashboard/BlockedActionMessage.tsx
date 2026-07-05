import type { ReactNode } from "react";

type BlockedActionMessageProps = {
  action?: ReactNode;
  message: string;
};

export function BlockedActionMessage({
  action,
  message,
}: BlockedActionMessageProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary sm:flex-row sm:items-center sm:justify-between">
      <span>{message}</span>
      {action ? <span className="shrink-0">{action}</span> : null}
    </div>
  );
}
