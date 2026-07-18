"use client";

import { RefreshCw, RotateCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { Button } from "@/app/_components/ui/Button";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { PostBridgeAnalyticsResultsSection } from "@/app/dashboard/analytics/PostBridgeAnalyticsResultsSection";
import { PostBridgeAnalyticsStatsGrid } from "@/app/dashboard/analytics/PostBridgeAnalyticsStatsGrid";
import { PostBridgeAnalyticsSyncStatus } from "@/app/dashboard/analytics/PostBridgeAnalyticsSyncStatus";
import { PostBridgeAnalyticsTimeRangeFilter } from "@/app/dashboard/analytics/PostBridgeAnalyticsTimeRangeFilter";
import { fetchPostBridgeAnalytics } from "@/lib/clipstitchr/client/fetchPostBridgeAnalytics";
import { syncPostBridgeAnalytics } from "@/lib/clipstitchr/client/syncPostBridgeAnalytics";
import { postBridgeListPageSize } from "@/lib/clipstitchr/constants/postBridgeListPageSize";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";
import type { PostBridgeAnalyticsLoadResult } from "@/lib/clipstitchr/types/PostBridgeAnalyticsLoadResult";
import type { PostBridgeAnalyticsTimeRange } from "@/lib/clipstitchr/types/PostBridgeAnalyticsTimeRange";
import { defaultPostBridgeAnalyticsTimeRange } from "@/lib/clipstitchr/utils/defaultPostBridgeAnalyticsTimeRange";
import { filterPostBridgeAnalyticsByTimeRange } from "@/lib/clipstitchr/utils/filterPostBridgeAnalyticsByTimeRange";
import { getPostBridgeAnalyticsTotals } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsTotals";

const emptySyncStatus = {
  lastSyncedAt: null,
  stale: false,
  syncTriggered: false,
};

export function PostBridgeAnalyticsPageClient() {
  const products = useDashboardProduct();
  const [analytics, setAnalytics] = useState<PostBridgeAnalytics[]>([]);
  const [syncStatus, setSyncStatus] = useState<{
    lastSyncedAt: string | null;
    stale: boolean;
    syncTriggered: boolean;
  }>(emptySyncStatus);
  const [timeRange, setTimeRange] = useState<PostBridgeAnalyticsTimeRange>(
    defaultPostBridgeAnalyticsTimeRange,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filteredAnalytics = useMemo(
    () => filterPostBridgeAnalyticsByTimeRange(analytics, timeRange),
    [analytics, timeRange],
  );
  const totals = useMemo(
    () => getPostBridgeAnalyticsTotals(filteredAnalytics),
    [filteredAnalytics],
  );
  const pagination = usePagination(filteredAnalytics, {
    pageSize: postBridgeListPageSize,
  });
  const { resetPage } = pagination;
  const activeProductId = products.activeProduct?.id;

  useEffect(() => {
    resetPage();
  }, [activeProductId, resetPage, timeRange]);

  const applyLoadResult = useCallback(
    (result: PostBridgeAnalyticsLoadResult) => {
      setAnalytics(result.analytics);
      setSyncStatus({
        lastSyncedAt: result.lastSyncedAt,
        stale: result.stale,
        syncTriggered: result.syncTriggered,
      });
    },
    [],
  );

  const loadDashboard = useCallback(async () => {
    if (!activeProductId) {
      setAnalytics([]);
      setSyncStatus(emptySyncStatus);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setAnalytics([]);
    setSyncStatus(emptySyncStatus);
    setError(null);

    try {
      applyLoadResult(
        await fetchPostBridgeAnalytics({ productId: activeProductId }),
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
  }, [activeProductId, applyLoadResult]);

  useEffect(() => {
    let isActive = true;

    const loadInitialDashboard = async () => {
      try {
        setIsLoading(true);
        setAnalytics([]);
        setSyncStatus(emptySyncStatus);
        setError(null);

        if (!activeProductId) {
          setAnalytics([]);
          return;
        }

        const result = await fetchPostBridgeAnalytics({
          productId: activeProductId,
        });

        if (!isActive) {
          return;
        }

        applyLoadResult(result);
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
  }, [activeProductId, applyLoadResult]);

  const handleSync = async () => {
    if (!activeProductId) {
      setError("Choose a product before syncing analytics.");
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      applyLoadResult(
        await syncPostBridgeAnalytics({ productId: activeProductId }),
      );
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
          description="Review post performance across connected channels."
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <PostBridgeAnalyticsTimeRangeFilter
            onChange={setTimeRange}
            value={timeRange}
          />
          <div className="flex flex-col gap-1 sm:items-end">
            <p className="text-sm font-semibold text-text-secondary">
              {filteredAnalytics.length} posts with results
            </p>
            <PostBridgeAnalyticsSyncStatus
              lastSyncedAt={syncStatus.lastSyncedAt}
              stale={syncStatus.stale}
              syncTriggered={syncStatus.syncTriggered || isSyncing}
            />
          </div>
        </div>

        <PostBridgeAnalyticsStatsGrid totals={totals} />

        <PostBridgeAnalyticsResultsSection analytics={pagination.pageItems} />

        {pagination.totalPages > 1 ? (
          <PaginationControls
            canGoNext={pagination.canGoNext}
            canGoPrevious={pagination.canGoPrevious}
            currentPage={pagination.currentPage}
            totalItems={pagination.totalItems}
            totalPages={pagination.totalPages}
            visibleEnd={pagination.visibleEnd}
            visibleStart={pagination.visibleStart}
            onNext={pagination.goToNextPage}
            onPrevious={pagination.goToPreviousPage}
          />
        ) : null}
      </div>
    </DashboardShell>
  );
}
