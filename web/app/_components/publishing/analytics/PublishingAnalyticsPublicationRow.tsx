import { PublishingProviderMark } from "@/app/_components/publishing/common/PublishingProviderMark";
import { PublishingAnalyticsMetricList } from "@/app/_components/publishing/analytics/PublishingAnalyticsMetricList";
import type { PublishingAnalyticsPublication } from "@/lib/clipstitchr/publishing/client/contracts/PublishingAnalyticsPublication";

type PublishingAnalyticsPublicationRowProps = {
  publication: PublishingAnalyticsPublication;
};

export function PublishingAnalyticsPublicationRow({
  publication,
}: PublishingAnalyticsPublicationRowProps) {
  return (
    <article className="publishing-analytics-publication">
      <header>
        <span>
          <PublishingProviderMark provider={publication.provider} size={20} />
          <strong>{publication.accountName}</strong>
        </span>
        <time dateTime={publication.observedAt}>
          Updated {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(publication.observedAt))}
        </time>
      </header>
      <p>{publication.caption || "No caption"}</p>
      <PublishingAnalyticsMetricList metrics={publication.metrics} />
      {publication.resultUrl ? (
        <a
          aria-label="View provider result in a new tab"
          href={publication.resultUrl}
          rel="noreferrer noopener"
          target="_blank"
        >
          View provider result
        </a>
      ) : null}
    </article>
  );
}
