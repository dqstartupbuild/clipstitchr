import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";
import type { PostBridgePostStatus } from "@/lib/clipstitchr/types/PostBridgePostStatus";
import { formatPostBridgeNumber } from "@/lib/clipstitchr/utils/formatPostBridgeNumber";
import { getPostBridgePostStatusLabel } from "@/lib/clipstitchr/utils/getPostBridgePostStatusLabel";

type ScheduledPostsSummaryProps = {
  posts: PostBridgePost[];
};

const statuses: PostBridgePostStatus[] = [
  "scheduled",
  "processing",
  "posted",
  "failed",
];

export function ScheduledPostsSummary({ posts }: ScheduledPostsSummaryProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statuses.map((status) => (
        <div
          key={status}
          className="rounded-lg border border-border bg-white p-4"
        >
          <p className="text-sm font-semibold text-text-secondary">
            {getPostBridgePostStatusLabel(status)}
          </p>
          <p className="mt-2 text-2xl font-bold text-text-primary">
            {formatPostBridgeNumber(
              posts.filter((post) => post.status === status).length,
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
