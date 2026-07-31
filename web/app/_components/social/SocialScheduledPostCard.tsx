import type { SocialSchedulePost } from "@/lib/clipstitchr/social/types/SocialSchedulePost";
import { SocialDeliveryRow } from "./SocialDeliveryRow";
import { SocialPostActions } from "./SocialPostActions";
import { SocialScheduledPostStatusBadge } from "./SocialScheduledPostStatusBadge";

type SocialScheduledPostCardProps = {
  post: SocialSchedulePost;
};

export function SocialScheduledPostCard({ post }: SocialScheduledPostCardProps) {
  return (
    <article className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,auto)]">
      <div className="min-w-0">
        <SocialScheduledPostStatusBadge status={post.status} />
        <h2 className="mt-2 truncate text-base font-bold text-text-primary">
          {post.title}
        </h2>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-text-secondary">
          {post.caption || "No caption"}
        </p>
        <time
          className="mt-1 block text-sm font-semibold text-text-tertiary"
          dateTime={post.scheduledFor}
        >
          {new Date(post.scheduledFor).toLocaleString()}
        </time>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-text-tertiary">Accounts</p>
        <div className="mt-2 grid gap-1">
          {post.targets.map((target) => (
            <SocialDeliveryRow key={target.id} target={target} />
          ))}
        </div>
      </div>
      {post.publications.length > 0 ? (
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm lg:col-span-2">
          {post.publications.map((publication) =>
            publication.permalink ? (
              <a
                key={publication.id}
                className="font-semibold text-accent-dark hover:text-text-primary"
                href={publication.permalink}
                rel="noreferrer"
                target="_blank"
              >
                Open{" "}
                {publication.platform === "tiktok" ? "TikTok" : "Instagram"}{" "}
                post
              </a>
            ) : null,
          )}
        </div>
      ) : null}
      <div className="lg:col-span-2">
        <SocialPostActions post={post} />
      </div>
    </article>
  );
}
