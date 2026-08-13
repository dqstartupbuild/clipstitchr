import Link from "next/link";
import { PublishingPostStatus } from "@/app/_components/publishing/common/PublishingPostStatus";
import { PublishingProviderMark } from "@/app/_components/publishing/common/PublishingProviderMark";
import type { PublishingPostSummary } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostSummary";
import { formatPublishingTime } from "@/lib/clipstitchr/publishing/client/schedule/formatPublishingTime";

type PublishingCalendarPostProps = {
  post: PublishingPostSummary;
  timeZone: string;
};

export function PublishingCalendarPost({
  post,
  timeZone,
}: PublishingCalendarPostProps) {
  return (
    <Link
      className="publishing-calendar-post"
      href={`/dashboard/studio/publishing/posts?id=${encodeURIComponent(post.id)}`}
    >
      <span className="publishing-calendar-post-time">
        {post.scheduledAt
          ? formatPublishingTime(post.scheduledAt, timeZone)
          : "No time"}
      </span>
      <span className="publishing-calendar-post-account">
        <PublishingProviderMark provider={post.provider} size={18} />
        <span>{post.accountName}</span>
      </span>
      <span className="publishing-calendar-post-caption">
        {post.caption || "No caption"}
      </span>
      <PublishingPostStatus status={post.status} />
    </Link>
  );
}
