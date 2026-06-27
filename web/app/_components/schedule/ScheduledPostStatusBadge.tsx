import type { PostBridgePostStatus } from "@/lib/clipstitchr/types/PostBridgePostStatus";
import { getPostBridgePostStatusLabel } from "@/lib/clipstitchr/utils/getPostBridgePostStatusLabel";

type ScheduledPostStatusBadgeProps = {
  status: PostBridgePostStatus;
};

const statusClasses: Record<PostBridgePostStatus, string> = {
  failed: "border-red-200 bg-red-50 text-red-700",
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
      {getPostBridgePostStatusLabel(status)}
    </span>
  );
}
