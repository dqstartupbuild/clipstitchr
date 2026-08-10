import type { SocialPublishingPost } from "@/lib/clipstitchr/types/SocialPublishingPost";
import type { SocialPublishingPostStatus } from "@/lib/clipstitchr/types/SocialPublishingPostStatus";
import { formatSocialPublishingNumber } from "@/lib/clipstitchr/utils/formatSocialPublishingNumber";
import { getSocialPublishingPostStatusLabel } from "@/lib/clipstitchr/utils/getSocialPublishingPostStatusLabel";

type ScheduledPostsSummaryProps = {
  posts: SocialPublishingPost[];
};

const statuses: SocialPublishingPostStatus[] = [
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
            {getSocialPublishingPostStatusLabel(status)}
          </p>
          <p className="mt-2 text-2xl font-bold text-text-primary">
            {formatSocialPublishingNumber(
              posts.filter((post) => post.status === status).length,
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
