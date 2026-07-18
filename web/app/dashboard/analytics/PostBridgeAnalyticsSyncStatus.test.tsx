import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PostBridgeAnalyticsSyncStatus } from "@/app/dashboard/analytics/PostBridgeAnalyticsSyncStatus";

describe("PostBridgeAnalyticsSyncStatus", () => {
  it("renders the last synced date for fresh snapshots", () => {
    const markup = renderToStaticMarkup(
      <PostBridgeAnalyticsSyncStatus
        lastSyncedAt="2026-07-01T12:00:00.000Z"
        stale={false}
        syncTriggered={false}
      />,
    );

    expect(markup).toContain("Last synced");
  });

  it("announces an in-flight sync before anything else", () => {
    const markup = renderToStaticMarkup(
      <PostBridgeAnalyticsSyncStatus
        lastSyncedAt="2026-07-01T12:00:00.000Z"
        stale={true}
        syncTriggered={true}
      />,
    );

    expect(markup).toContain("Syncing latest metrics");
    expect(markup).not.toContain("rate-limited");
  });

  it("warns when metrics are stale and sync was skipped", () => {
    const markup = renderToStaticMarkup(
      <PostBridgeAnalyticsSyncStatus
        lastSyncedAt="2026-07-01T12:00:00.000Z"
        stale={true}
        syncTriggered={false}
      />,
    );

    expect(markup).toContain("Metrics may be outdated");
    expect(markup).toContain("rate-limited");
  });

  it("renders nothing when there is no snapshot yet", () => {
    const markup = renderToStaticMarkup(
      <PostBridgeAnalyticsSyncStatus
        lastSyncedAt={null}
        stale={false}
        syncTriggered={false}
      />,
    );

    expect(markup).toBe("");
  });
});
