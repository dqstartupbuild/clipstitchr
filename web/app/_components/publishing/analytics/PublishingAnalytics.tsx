"use client";

import { useState } from "react";
import { PublishingAnalyticsMetricList } from "@/app/_components/publishing/analytics/PublishingAnalyticsMetricList";
import { PublishingAnalyticsPublicationRow } from "@/app/_components/publishing/analytics/PublishingAnalyticsPublicationRow";
import { PublishingStateMessage } from "@/app/_components/publishing/common/PublishingStateMessage";
import { PublishingViewHeader } from "@/app/_components/publishing/common/PublishingViewHeader";
import { getPublishingAnalytics } from "@/lib/clipstitchr/publishing/client/requests/getPublishingAnalytics";
import { usePublishingResource } from "@/lib/clipstitchr/publishing/client/usePublishingResource";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";

type PublishingAnalyticsProps = {
  initialRange: "30d" | "7d" | "90d";
};

export function PublishingAnalytics({ initialRange }: PublishingAnalyticsProps) {
  const { activeProduct, activeProductId } = useDashboardProduct();
  const [range, setRange] = useState(initialRange);
  const resource = usePublishingResource(
    (signal) => getPublishingAnalytics(range, activeProductId ?? "", signal),
    activeProductId ? `${activeProductId}:${range}` : null,
  );

  return (
    <section className="publishing-view" aria-labelledby="publishing-analytics-title">
      <PublishingViewHeader
        description={`Read provider metrics actually observed for ${activeProduct?.name ?? "this Product"}. Missing metrics stay missing.`}
        title="Analytics"
        titleId="publishing-analytics-title"
      />
      <div className="publishing-analytics-controls">
        <label htmlFor="publishing-analytics-range">Time range</label>
        <select
          id="publishing-analytics-range"
          value={range}
          onChange={(event) =>
            setRange(event.target.value as "30d" | "7d" | "90d")
          }
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
        <button type="button" onClick={resource.reload} disabled={resource.isLoading}>
          {resource.isLoading ? "Loading…" : "Reload saved results"}
        </button>
      </div>

      {resource.error ? (
        <PublishingStateMessage
          action={
            <button className="publishing-text-action" type="button" onClick={resource.reload}>
              Try again
            </button>
          }
          message={resource.error}
          title="Analytics could not load"
          tone="error"
        />
      ) : resource.isLoading && !resource.data ? (
        <PublishingStateMessage
          message="Loading saved provider observations."
          title="Loading analytics"
        />
      ) : !resource.data ? null : (
        <div className="publishing-analytics-content" aria-busy={resource.isLoading}>
          {resource.data.observedAt ? (
            <p className="publishing-analytics-observed">
              Last observed {new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(resource.data.observedAt))}
            </p>
          ) : null}
          {resource.data.metrics.length ? (
            <PublishingAnalyticsMetricList metrics={resource.data.metrics} />
          ) : null}
          {resource.data.unsupported.length ? (
            <section className="publishing-analytics-unsupported">
              <h2>Not reported by the provider</h2>
              <ul>
                {resource.data.unsupported.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {resource.data.publications.length ? (
            <section className="publishing-analytics-publications" aria-labelledby="publishing-publication-results">
              <h2 id="publishing-publication-results">Post results</h2>
              {resource.data.publications.map((publication) => (
                <PublishingAnalyticsPublicationRow
                  key={publication.id}
                  publication={publication}
                />
              ))}
            </section>
          ) : (
            <PublishingStateMessage
              message="No supported provider observations are saved for this range yet."
              title="No analytics yet"
            />
          )}
        </div>
      )}
    </section>
  );
}
