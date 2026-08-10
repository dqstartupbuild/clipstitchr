import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SocialPublishingAnalyticsSyncStatus } from "@/app/dashboard/analytics/SocialPublishingAnalyticsSyncStatus";

describe("SocialPublishingAnalyticsSyncStatus", () => {
  it("renders the last synced date for fresh snapshots", () => {
    const markup = renderToStaticMarkup(
      <SocialPublishingAnalyticsSyncStatus
        isRefreshing={false}
        lastSyncedAt="2026-07-01T12:00:00.000Z"
        stale={false}
      />,
    );

    expect(markup).toContain("Last synced");
  });

  it("announces an in-flight sync before anything else", () => {
    const markup = renderToStaticMarkup(
      <SocialPublishingAnalyticsSyncStatus
        isRefreshing={true}
        lastSyncedAt="2026-07-01T12:00:00.000Z"
        stale={true}
      />,
    );

    expect(markup).toContain("Syncing latest metrics");
    expect(markup).not.toContain("older metrics");
  });

  it("explains when Zernio is refreshing stale metrics", () => {
    const markup = renderToStaticMarkup(
      <SocialPublishingAnalyticsSyncStatus
        isRefreshing={false}
        lastSyncedAt="2026-07-01T12:00:00.000Z"
        stale={true}
      />,
    );

    expect(markup).toContain("Zernio is refreshing older metrics");
  });

  it("renders nothing when there is no snapshot yet", () => {
    const markup = renderToStaticMarkup(
      <SocialPublishingAnalyticsSyncStatus
        isRefreshing={false}
        lastSyncedAt={null}
        stale={false}
      />,
    );

    expect(markup).toBe("");
  });
});
