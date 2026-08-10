"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { Button } from "@/app/_components/ui/Button";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { SocialPublishingAnalyticsResultsSection } from "@/app/dashboard/analytics/SocialPublishingAnalyticsResultsSection";
import { SocialPublishingAnalyticsStatsGrid } from "@/app/dashboard/analytics/SocialPublishingAnalyticsStatsGrid";
import { SocialPublishingAnalyticsSyncStatus } from "@/app/dashboard/analytics/SocialPublishingAnalyticsSyncStatus";
import { SocialPublishingAnalyticsTimeRangeFilter } from "@/app/dashboard/analytics/SocialPublishingAnalyticsTimeRangeFilter";
import { fetchSocialPublishingAnalytics } from "@/lib/clipstitchr/client/fetchSocialPublishingAnalytics";
import { refreshSocialPublishingAnalytics } from "@/lib/clipstitchr/client/refreshSocialPublishingAnalytics";
import { socialPublishingListPageSize } from "@/lib/clipstitchr/constants/socialPublishingListPageSize";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";
import type { SocialPublishingAnalyticsLoadResult } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsLoadResult";
import type { SocialPublishingAnalyticsTimeRange } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsTimeRange";
import { defaultSocialPublishingAnalyticsTimeRange } from "@/lib/clipstitchr/utils/defaultSocialPublishingAnalyticsTimeRange";
import { filterSocialPublishingAnalyticsByTimeRange } from "@/lib/clipstitchr/utils/filterSocialPublishingAnalyticsByTimeRange";
import { getSocialPublishingAnalyticsTotals } from "@/lib/clipstitchr/utils/getSocialPublishingAnalyticsTotals";
import { sortSocialPublishingAnalyticsNewestFirst } from "@/lib/clipstitchr/utils/sortSocialPublishingAnalyticsNewestFirst";

const emptySyncStatus = {
  lastSyncedAt: null,
  stale: false,
};

export function SocialPublishingAnalyticsPageClient() {
  const products = useDashboardProduct();
  const [analytics, setAnalytics] = useState<SocialPublishingAnalytics[]>([]);
  const [syncStatus, setSyncStatus] = useState<{
    lastSyncedAt: string | null;
    stale: boolean;
  }>(emptySyncStatus);
  const [timeRange, setTimeRange] = useState<SocialPublishingAnalyticsTimeRange>(
    defaultSocialPublishingAnalyticsTimeRange,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filteredAnalytics = useMemo(
    () => filterSocialPublishingAnalyticsByTimeRange(analytics, timeRange),
    [analytics, timeRange],
  );
  const totals = useMemo(
    () => getSocialPublishingAnalyticsTotals(filteredAnalytics),
    [filteredAnalytics],
  );
  const orderedAnalytics = useMemo(
    () => sortSocialPublishingAnalyticsNewestFirst(filteredAnalytics),
    [filteredAnalytics],
  );
  const pagination = usePagination(orderedAnalytics, {
    pageSize: socialPublishingListPageSize,
  });
  const { resetPage } = pagination;
  const activeProductId = products.activeProduct?.id;

  useEffect(() => {
    resetPage();
  }, [activeProductId, resetPage, timeRange]);

  const applyLoadResult = useCallback(
    (result: SocialPublishingAnalyticsLoadResult) => {
      setAnalytics(result.analytics);
      setSyncStatus({
        lastSyncedAt: result.lastSyncedAt,
        stale: result.stale,
      });
    },
    [],
  );

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

        const result = await fetchSocialPublishingAnalytics({
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
      setError("Choose a product before refreshing analytics.");
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      applyLoadResult(
        await refreshSocialPublishingAnalytics({ productId: activeProductId }),
      );
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to refresh post analytics.",
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
            <Button
              type="button"
              icon={<RefreshCw aria-hidden className="h-4 w-4" />}
              isLoading={isSyncing}
              disabled={isLoading || isSyncing || !activeProductId}
              onClick={() => void handleSync()}
            >
              Refresh analytics
            </Button>
          }
        />

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SocialPublishingAnalyticsTimeRangeFilter
            onChange={setTimeRange}
            value={timeRange}
          />
          <div className="flex flex-col gap-1 sm:items-end">
            <p className="text-sm font-semibold text-text-secondary">
              {filteredAnalytics.length} posts with results
            </p>
            <SocialPublishingAnalyticsSyncStatus
              isRefreshing={isSyncing}
              lastSyncedAt={syncStatus.lastSyncedAt}
              stale={syncStatus.stale}
            />
          </div>
        </div>

        <SocialPublishingAnalyticsStatsGrid totals={totals} />

        <SocialPublishingAnalyticsResultsSection analytics={pagination.pageItems} />

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
