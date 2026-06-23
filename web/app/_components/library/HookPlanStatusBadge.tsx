import type { StitchrHookFeedbackStatus } from "@/lib/clipstitchr/types/StitchrHookFeedbackStatus";
import type { StitchrHookPlanStatus } from "@/lib/clipstitchr/types/StitchrHookPlanStatus";
import { getStitchrHookPlanStatusLabel } from "@/lib/clipstitchr/utils/getStitchrHookPlanStatusLabel";

type HookPlanStatusBadgeProps = {
  feedbackStatus?: StitchrHookFeedbackStatus;
  status: StitchrHookPlanStatus;
};

export function HookPlanStatusBadge({
  feedbackStatus,
  status,
}: HookPlanStatusBadgeProps) {
  const label =
    feedbackStatus === "accepted"
      ? "Winner"
      : feedbackStatus === "rejected"
        ? "Avoid"
        : getStitchrHookPlanStatusLabel(status);
  const classes =
    feedbackStatus === "accepted"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : feedbackStatus === "rejected"
        ? "border-red-200 bg-red-50 text-red-600"
        : status === "failed"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-border bg-surface-muted text-text-secondary";

  return (
    <span
      className={[
        "inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-bold",
        classes,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
