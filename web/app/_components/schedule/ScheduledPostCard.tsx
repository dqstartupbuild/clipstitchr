import { ScheduledPostAccountList } from "@/app/_components/schedule/ScheduledPostAccountList";
import { ScheduledPostStatusBadge } from "@/app/_components/schedule/ScheduledPostStatusBadge";
import type { SocialPublishingPost } from "@/lib/clipstitchr/types/SocialPublishingPost";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";
import { getSocialPublishingPostTimeLabel } from "@/lib/clipstitchr/utils/getSocialPublishingPostTimeLabel";
import { getSocialPublishingUnknownString } from "@/lib/clipstitchr/utils/getSocialPublishingUnknownString";

type ScheduledPostCardProps = {
  accounts: SocialPublishingSocialAccount[];
  post: SocialPublishingPost;
};

export function ScheduledPostCard({ accounts, post }: ScheduledPostCardProps) {
  const caption = getSocialPublishingUnknownString(post.caption) || "Untitled post";

  return (
    <article className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <ScheduledPostStatusBadge status={post.status} />
          {post.is_draft ? (
            <span className="inline-flex items-center rounded-md border border-border bg-white px-2 py-1 text-xs font-semibold text-text-secondary">
              Draft
            </span>
          ) : null}
        </div>
        <h2 className="mt-2 truncate text-base font-bold text-text-primary">
          {caption}
        </h2>
        <p className="mt-1 text-sm font-semibold text-text-tertiary">
          {getSocialPublishingPostTimeLabel(post)}
        </p>
        {post.warnings?.length ? (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
            {post.warnings.join(" ")}
          </p>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col gap-2 lg:min-w-64 lg:items-end">
        <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
          Accounts
        </p>
        <ScheduledPostAccountList
          accountIds={post.social_accounts}
          accounts={accounts}
        />
      </div>
    </article>
  );
}
