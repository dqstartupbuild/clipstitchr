import type { SocialPublishingPostStatus } from "@/lib/clipstitchr/types/SocialPublishingPostStatus";
import { getSocialPublishingPostStatusLabel } from "@/lib/clipstitchr/utils/getSocialPublishingPostStatusLabel";

type ScheduledPostStatusBadgeProps = {
  status: SocialPublishingPostStatus;
};

const statusClasses: Record<SocialPublishingPostStatus, string> = {
  failed: "border-accent/40 bg-surface-muted text-accent-dark",
  partial: "border-warning/40 bg-surface-muted text-warning",
  posted: "border-border bg-surface-elevated text-text-primary",
  processing: "border-warning/30 bg-surface-muted text-warning",
  scheduled: "border-accent/30 bg-surface-muted text-accent-dark",
};

export function ScheduledPostStatusBadge({
  status,
}: ScheduledPostStatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold",
        statusClasses[status],
      ].join(" ")}
    >
      {getSocialPublishingPostStatusLabel(status)}
    </span>
  );
}
