import Link from "next/link";
import { PublishingMediaReference } from "@/app/_components/publishing/common/PublishingMediaReference";
import { PublishingPostStatus } from "@/app/_components/publishing/common/PublishingPostStatus";
import { PublishingProviderMark } from "@/app/_components/publishing/common/PublishingProviderMark";
import type { PublishingPostSummary } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostSummary";
import { formatPublishingTime } from "@/lib/clipstitchr/publishing/client/schedule/formatPublishingTime";

type PublishingPostListItemProps = {
  post: PublishingPostSummary;
  selected: boolean;
};

export function PublishingPostListItem({
  post,
  selected,
}: PublishingPostListItemProps) {
  return (
    <article className="publishing-post-list-item" data-selected={selected || undefined}>
      <div className="publishing-post-list-main">
        <div className="publishing-post-list-account">
          <PublishingProviderMark provider={post.provider} size={20} />
          <strong>{post.accountName}</strong>
          <PublishingPostStatus status={post.status} />
        </div>
        <p>{post.caption || "No caption"}</p>
        <PublishingMediaReference media={post.media} />
      </div>
      <div className="publishing-post-list-meta">
        <span>
          {post.scheduledAt
            ? `${new Intl.DateTimeFormat(undefined, {
                day: "numeric",
                month: "short",
                timeZone: post.timeZone,
              }).format(new Date(post.scheduledAt))} at ${formatPublishingTime(
                post.scheduledAt,
                post.timeZone,
              )}`
            : "Not scheduled"}
        </span>
        <Link href={`/dashboard/studio/publishing/posts?id=${encodeURIComponent(post.id)}`}>
          Open
        </Link>
      </div>
    </article>
  );
}
