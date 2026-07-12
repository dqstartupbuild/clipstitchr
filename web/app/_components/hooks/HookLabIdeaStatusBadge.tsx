import type { HookLabIdeaStatus } from "@/lib/clipstitchr/types/HookLabIdeaStatus";

type HookLabIdeaStatusBadgeProps = {
  status: HookLabIdeaStatus;
};

const statusContent: Record<
  HookLabIdeaStatus,
  { classes: string; label: string }
> = {
  analyzing: {
    classes: "border-blue-200 bg-blue-50 text-blue-700",
    label: "Analyzing",
  },
  archived: {
    classes: "border-border bg-surface-muted text-text-secondary",
    label: "Archived",
  },
  failed: {
    classes: "border-red-200 bg-red-50 text-red-700",
    label: "Failed",
  },
  generating: {
    classes: "border-blue-200 bg-blue-50 text-blue-700",
    label: "Generating",
  },
  needs_attention: {
    classes: "border-amber-200 bg-amber-50 text-amber-700",
    label: "Needs attention",
  },
  ready: {
    classes: "border-emerald-200 bg-emerald-50 text-emerald-700",
    label: "Ready",
  },
};

export function HookLabIdeaStatusBadge({ status }: HookLabIdeaStatusBadgeProps) {
  const content = statusContent[status];

  return (
    <span
      className={`inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-bold ${content.classes}`}
    >
      {content.label}
    </span>
  );
}
