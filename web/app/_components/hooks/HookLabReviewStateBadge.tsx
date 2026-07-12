import type { HookLabReviewState } from "@/lib/clipstitchr/types/HookLabReviewState";

type HookLabReviewStateBadgeProps = {
  state: HookLabReviewState;
};

export function HookLabReviewStateBadge({ state }: HookLabReviewStateBadgeProps) {
  const content =
    state === "saved"
      ? {
          classes: "border-emerald-200 bg-emerald-50 text-emerald-700",
          label: "Saved",
        }
      : state === "not_for_me"
        ? {
            classes: "border-red-200 bg-red-50 text-red-700",
            label: "Not for me",
          }
        : {
            classes: "border-border bg-surface-muted text-text-secondary",
            label: "Needs review",
          };

  return (
    <span
      className={`inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-bold ${content.classes}`}
    >
      {content.label}
    </span>
  );
}
