import type { StitchrHookFeedbackStatus } from "@/lib/clipstitchr/types/StitchrHookFeedbackStatus";

type HookOptionFeedbackBadgeProps = {
  status?: StitchrHookFeedbackStatus;
};

export function HookOptionFeedbackBadge({
  status,
}: HookOptionFeedbackBadgeProps) {
  if (!status) {
    return null;
  }

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center rounded-md border px-2 py-1 text-[11px] font-bold uppercase leading-none",
        status === "accepted"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700",
      ].join(" ")}
    >
      {status === "accepted" ? "Winner" : "Avoid"}
    </span>
  );
}
