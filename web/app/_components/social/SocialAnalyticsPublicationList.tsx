import type { SocialAnalyticsReport } from "@/lib/clipstitchr/social/types/SocialAnalyticsReport";
import { formatSocialAnalyticsValue } from "@/lib/clipstitchr/social/analytics/formatSocialAnalyticsValue";
import { SocialPlatformMark } from "./SocialPlatformMark";

type SocialAnalyticsPublicationListProps = {
  publications: SocialAnalyticsReport["publications"];
  showSign: boolean;
};

export function SocialAnalyticsPublicationList({
  publications,
  showSign,
}: SocialAnalyticsPublicationListProps) {
  return (
    <details className="rounded-lg bg-surface">
      <summary className="cursor-pointer p-4 text-sm font-bold text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        Individual posts ({publications.length})
      </summary>
      <div className="divide-y divide-border border-t border-border">
        {publications.length > 0 ? (
          publications.map((publication) => (
            <article
              key={publication.id}
              className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <SocialPlatformMark
                    platform={publication.platform}
                    className="h-4 w-4 shrink-0"
                  />
                  <h3 className="truncate text-sm font-bold text-text-primary">
                    {publication.postTitle}
                  </h3>
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  {publication.accountName} · {publication.productName}
                </p>
                {publication.permalink ? (
                  <a
                    className="mt-2 inline-block text-sm font-semibold text-accent-dark hover:text-white"
                    href={publication.permalink}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open post
                  </a>
                ) : null}
              </div>
              <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm sm:grid-cols-5">
                {(
                  ["views", "likes", "comments", "shares", "saves"] as const
                ).map((metric) => (
                  <div key={metric}>
                    <dt className="capitalize text-text-tertiary">{metric}</dt>
                    <dd className="font-semibold text-text-primary">
                      {formatSocialAnalyticsValue(
                        publication.metrics[metric],
                        showSign,
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))
        ) : (
          <p className="p-4 text-sm text-text-secondary">
            No tracked publications match this view.
          </p>
        )}
      </div>
    </details>
  );
}
