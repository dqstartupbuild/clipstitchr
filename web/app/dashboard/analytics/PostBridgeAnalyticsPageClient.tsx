"use client";

import { RefreshCw, RotateCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { Button } from "@/app/_components/ui/Button";
import { ContentAnalyticsSourceFilter } from "@/app/dashboard/analytics/ContentAnalyticsSourceFilter";
import { PostBridgeAnalyticsResultsSection } from "@/app/dashboard/analytics/PostBridgeAnalyticsResultsSection";
import { PostBridgeAnalyticsStatsGrid } from "@/app/dashboard/analytics/PostBridgeAnalyticsStatsGrid";
import { PostBridgeAnalyticsTimeRangeFilter } from "@/app/dashboard/analytics/PostBridgeAnalyticsTimeRangeFilter";
import { fetchPostBridgeAnalytics } from "@/lib/clipstitchr/client/fetchPostBridgeAnalytics";
import { syncPostBridgeAnalytics } from "@/lib/clipstitchr/client/syncPostBridgeAnalytics";
import type { ContentAnalytics } from "@/lib/clipstitchr/types/ContentAnalytics";
import type { ContentAnalyticsSourceFilter as ContentAnalyticsSourceFilterValue } from "@/lib/clipstitchr/types/ContentAnalyticsSourceFilter";
import type { PostBridgeAnalyticsTimeRange } from "@/lib/clipstitchr/types/PostBridgeAnalyticsTimeRange";
import { defaultPostBridgeAnalyticsTimeRange } from "@/lib/clipstitchr/utils/defaultPostBridgeAnalyticsTimeRange";
import { filterContentAnalyticsBySource } from "@/lib/clipstitchr/utils/filterContentAnalyticsBySource";
import { filterPostBridgeAnalyticsByTimeRange } from "@/lib/clipstitchr/utils/filterPostBridgeAnalyticsByTimeRange";
import { getPostBridgeAnalyticsTotals } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsTotals";
import { mergeSyncedContentAnalytics } from "@/lib/clipstitchr/utils/mergeSyncedContentAnalytics";

export function PostBridgeAnalyticsPageClient() {
  const [analytics, setAnalytics] = useState<ContentAnalytics[]>([]);
  const [timeRange, setTimeRange] = useState<PostBridgeAnalyticsTimeRange>(
    defaultPostBridgeAnalyticsTimeRange,
  );
  const [sourceFilter, setSourceFilter] =
    useState<ContentAnalyticsSourceFilterValue>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualSyncWarning, setManualSyncWarning] = useState<string | null>(
    null,
  );
  const timeFilteredAnalytics = useMemo(
    () => filterPostBridgeAnalyticsByTimeRange(analytics, timeRange),
    [analytics, timeRange],
  );
  const filteredAnalytics = useMemo(
    () => filterContentAnalyticsBySource(timeFilteredAnalytics, sourceFilter),
    [sourceFilter, timeFilteredAnalytics],
  );
  const totals = useMemo(
    () => getPostBridgeAnalyticsTotals(filteredAnalytics),
    [filteredAnalytics],
  );

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setManualSyncWarning(null);

    try {
      const postBridgeAnalytics = await fetchPostBridgeAnalytics();

      setAnalytics((currentAnalytics) =>
        mergeSyncedContentAnalytics({
          currentAnalytics,
          keepCurrentManualAnalytics: true,
          syncedAnalytics: postBridgeAnalytics,
        }),
      );
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to load post analytics.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadInitialDashboard = async () => {
      try {
        const nextAnalytics = await fetchPostBridgeAnalytics();

        if (!isActive) {
          return;
        }

        setAnalytics(nextAnalytics);
      } catch (nextError) {
        if (!isActive) {
          return;
        }

        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load post analytics.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    setManualSyncWarning(null);

    try {
      const syncResponse = await syncPostBridgeAnalytics();

      setAnalytics((currentAnalytics) =>
        mergeSyncedContentAnalytics({
          currentAnalytics,
          keepCurrentManualAnalytics: Boolean(
            syncResponse.manualAnalyticsWarning,
          ),
          syncedAnalytics: syncResponse.analytics,
        }),
      );
      setManualSyncWarning(syncResponse.manualAnalyticsWarning);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to sync post analytics.",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Analytics"
          title="Analytics"
          description="See how your posted videos are doing across TikTok, Instagram, and YouTube Shorts. Sync to include posts you shared outside ClipStitchr."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                icon={<RefreshCw aria-hidden className="h-4 w-4" />}
                isLoading={isLoading}
                onClick={() => void loadDashboard()}
              >
                Refresh
              </Button>
              <Button
                type="button"
                icon={<RotateCw aria-hidden className="h-4 w-4" />}
                isLoading={isSyncing}
                onClick={() => void handleSync()}
              >
                Sync analytics
              </Button>
            </div>
          }
        />

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        {manualSyncWarning ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            {manualSyncWarning}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid gap-3 sm:grid-cols-2">
            <PostBridgeAnalyticsTimeRangeFilter
              onChange={setTimeRange}
              value={timeRange}
            />
            <ContentAnalyticsSourceFilter
              onChange={setSourceFilter}
              value={sourceFilter}
            />
          </div>
          <p className="text-sm font-semibold text-text-secondary">
            {filteredAnalytics.length} posts with results
          </p>
        </div>

        <PostBridgeAnalyticsStatsGrid totals={totals} />

        <PostBridgeAnalyticsResultsSection analytics={filteredAnalytics} />
      </div>
    </DashboardShell>
  );
}
