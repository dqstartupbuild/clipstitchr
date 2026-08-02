import type { SocialSchedulePost } from "@/lib/clipstitchr/social/types/SocialSchedulePost";
import { getSocialDeliveryStatusLabel } from "@/lib/clipstitchr/social/getSocialDeliveryStatusLabel";
import { SocialDeliveryRow } from "./SocialDeliveryRow";
import { SocialPostActions } from "./SocialPostActions";

type SocialScheduledPostCardProps = {
  post: SocialSchedulePost;
};

export function SocialScheduledPostCard({
  post,
}: SocialScheduledPostCardProps) {
  return (
    <article className="rounded-lg bg-surface p-4">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-text-primary">
            {post.title}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-text-secondary">
            {post.caption || "No caption"}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm font-bold text-text-primary">
            {getSocialDeliveryStatusLabel(post.status)}
          </p>
          <time
            className="text-sm text-text-secondary"
            dateTime={post.scheduledFor}
          >
            {new Date(post.scheduledFor).toLocaleString()}
          </time>
        </div>
      </div>
      <div className="mt-3 divide-y divide-border">
        {post.targets.map((target) => (
          <SocialDeliveryRow
            key={target.id}
            target={target}
          />
        ))}
      </div>
      {post.publications.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {post.publications.map((publication) =>
            publication.permalink ? (
              <a
                key={publication.id}
                className="font-semibold text-accent-dark hover:text-white"
                href={publication.permalink}
                rel="noreferrer"
                target="_blank"
              >
                Open {publication.platform === "tiktok" ? "TikTok" : "Instagram"} post
              </a>
            ) : null,
          )}
        </div>
      ) : null}
      <div className="mt-3">
        <SocialPostActions post={post} />
      </div>
    </article>
  );
}
