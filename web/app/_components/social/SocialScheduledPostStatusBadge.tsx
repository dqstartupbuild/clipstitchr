import { getSocialDeliveryStatusLabel } from "@/lib/clipstitchr/social/getSocialDeliveryStatusLabel";

type SocialScheduledPostStatusBadgeProps = {
  status: string;
};

const statusClasses: Record<string, string> = {
  canceled: "border-border bg-surface-muted text-text-secondary",
  draft: "border-border bg-surface-muted text-text-secondary",
  failed: "border-red-200 bg-red-50 text-red-700",
  held: "border-amber-200 bg-amber-50 text-amber-800",
  needs_attention: "border-amber-200 bg-amber-50 text-amber-800",
  outcome_unknown: "border-amber-200 bg-amber-50 text-amber-800",
  partially_published: "border-amber-200 bg-amber-50 text-amber-800",
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  publishing: "border-amber-200 bg-amber-50 text-amber-800",
  scheduled: "border-border bg-surface-muted text-text-primary",
  waiting_for_user: "border-amber-200 bg-amber-50 text-amber-800",
};

export function SocialScheduledPostStatusBadge({
  status,
}: SocialScheduledPostStatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold",
        statusClasses[status] ??
          "border-border bg-surface-muted text-text-secondary",
      ].join(" ")}
    >
      {getSocialDeliveryStatusLabel(status)}
    </span>
  );
}
