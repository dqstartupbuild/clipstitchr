import type { SocialPublishingPostStatus } from "@/lib/clipstitchr/types/SocialPublishingPostStatus";
import { getSocialPublishingPostStatusLabel } from "@/lib/clipstitchr/utils/getSocialPublishingPostStatusLabel";

type ScheduledPostStatusBadgeProps = {
  status: SocialPublishingPostStatus;
};

const statusClasses: Record<SocialPublishingPostStatus, string> = {
  failed: "border-red-200 bg-red-50 text-red-700",
  partial: "border-orange-200 bg-orange-50 text-orange-800",
  posted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  processing: "border-amber-200 bg-amber-50 text-amber-700",
  scheduled: "border-blue-200 bg-blue-50 text-blue-700",
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
