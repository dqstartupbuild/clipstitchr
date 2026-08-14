"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import { Button } from "@/app/_components/ui/Button";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { SocialPublishingAnalyticsOverview } from "@/app/dashboard/analytics/SocialPublishingAnalyticsOverview";
import { SocialPublishingAnalyticsResultsSection } from "@/app/dashboard/analytics/SocialPublishingAnalyticsResultsSection";
import { SocialPublishingAnalyticsStrategy } from "@/app/dashboard/analytics/SocialPublishingAnalyticsStrategy";
import { SocialPublishingAnalyticsSyncStatus } from "@/app/dashboard/analytics/SocialPublishingAnalyticsSyncStatus";
import { SocialPublishingAnalyticsTimeRangeFilter } from "@/app/dashboard/analytics/SocialPublishingAnalyticsTimeRangeFilter";
import {
  SocialPublishingAnalyticsWorkspaceNav,
  type SocialPublishingAnalyticsWorkspace,
} from "@/app/dashboard/analytics/SocialPublishingAnalyticsWorkspaceNav";
import { fetchSocialPublishingAnalytics } from "@/lib/clipstitchr/client/fetchSocialPublishingAnalytics";
import { refreshSocialPublishingAnalytics } from "@/lib/clipstitchr/client/refreshSocialPublishingAnalytics";
import { socialPublishingListPageSize } from "@/lib/clipstitchr/constants/socialPublishingListPageSize";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { SocialPublishingAnalyticsLoadResult } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsLoadResult";
import type { SocialPublishingAnalyticsTimeRange } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsTimeRange";
import { defaultSocialPublishingAnalyticsTimeRange } from "@/lib/clipstitchr/utils/defaultSocialPublishingAnalyticsTimeRange";
import { filterSocialPublishingAnalyticsByTimeRange } from "@/lib/clipstitchr/utils/filterSocialPublishingAnalyticsByTimeRange";
import { filterSocialPublishingDailyMetricsByTimeRange } from "@/lib/clipstitchr/utils/filterSocialPublishingDailyMetricsByTimeRange";
import { getSocialPublishingAnalyticsTotals } from "@/lib/clipstitchr/utils/getSocialPublishingAnalyticsTotals";
import { getSocialPublishingPlatformAnalyticsSummaries } from "@/lib/clipstitchr/utils/getSocialPublishingPlatformAnalyticsSummaries";
import { sortSocialPublishingAnalyticsNewestFirst } from "@/lib/clipstitchr/utils/sortSocialPublishingAnalyticsNewestFirst";

const emptyAnalyticsDashboard: SocialPublishingAnalyticsLoadResult = {
  accountCount: 0,
  analytics: [],
  bestTimes: [],
  contentDecay: [],
  dailyMetrics: [],
  externalSyncFailedAccountCount: 0,
  followerStats: { accounts: [], historyByAccountId: {} },
  lastSyncedAt: null,
  postingFrequency: [],
  stale: false,
  unavailableInsights: [],
};

export function SocialPublishingAnalyticsPageClient() {
  const products = useDashboardProduct();
  const [dashboard, setDashboard] =
    useState<SocialPublishingAnalyticsLoadResult>(emptyAnalyticsDashboard);
  const [workspace, setWorkspace] =
    useState<SocialPublishingAnalyticsWorkspace>("overview");
  const [timeRange, setTimeRange] = useState<SocialPublishingAnalyticsTimeRange>(
    defaultSocialPublishingAnalyticsTimeRange,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filteredAnalytics = useMemo(
    () => filterSocialPublishingAnalyticsByTimeRange(dashboard.analytics, timeRange),
    [dashboard.analytics, timeRange],
  );
  const filteredDailyMetrics = useMemo(
    () => filterSocialPublishingDailyMetricsByTimeRange(dashboard.dailyMetrics, timeRange),
    [dashboard.dailyMetrics, timeRange],
  );
  const totals = useMemo(
    () => getSocialPublishingAnalyticsTotals(filteredAnalytics),
    [filteredAnalytics],
  );
  const platformSummaries = useMemo(
    () => getSocialPublishingPlatformAnalyticsSummaries(filteredAnalytics),
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
      setDashboard(result);
    },
    [],
  );

  useEffect(() => {
    let isActive = true;

    const loadInitialDashboard = async () => {
      try {
        setIsLoading(true);
        setDashboard(emptyAnalyticsDashboard);
        setError(null);

        if (!activeProductId) {
          return;
        }

        const result = await fetchSocialPublishingAnalytics({
          productId: activeProductId,
        });

        if (isActive) {
          applyLoadResult(result);
        }
      } catch (nextError) {
        if (isActive) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Unable to load post analytics.",
          );
        }
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
      <div className="mx-auto flex min-w-0 max-w-7xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Zernio analytics"
          title="Analytics"
          description="See every post from this product’s connected accounts, including posts published outside ClipStitchr."
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

        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        {dashboard.externalSyncFailedAccountCount > 0 ? (
          <DashboardAlert variant="warning" title="Some accounts could not refresh">
            Zernio kept their most recent saved results. Reconnect any account that stays out of date.
          </DashboardAlert>
        ) : null}

        {dashboard.unavailableInsights.length ? (
          <DashboardAlert title="Some Zernio insights are unavailable">
            {dashboard.unavailableInsights.join(", ")} could not load. These views need Zernio&apos;s Analytics add-on and the right channel permissions.
          </DashboardAlert>
        ) : null}

        {isLoading ? (
          <p className="py-8 text-sm font-semibold text-text-secondary" role="status">
            Loading analytics from Zernio...
          </p>
        ) : dashboard.accountCount === 0 ? (
          <DashboardEmptyState
            title="Connect accounts to this product"
            description="Choose the social accounts this product uses in Settings. Analytics will then include posts made in ClipStitchr and posts made directly on those channels."
            action={<SecondaryButtonLink href="/dashboard/settings">Open Settings</SecondaryButtonLink>}
          />
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SocialPublishingAnalyticsWorkspaceNav
                postCount={filteredAnalytics.length}
                value={workspace}
                onChange={setWorkspace}
              />
              <div className="flex flex-col gap-3 sm:items-end">
                {workspace === "strategy" ? (
                  <p className="text-sm font-semibold text-text-tertiary">
                    Strategy uses all available history
                  </p>
                ) : (
                  <SocialPublishingAnalyticsTimeRangeFilter
                    onChange={setTimeRange}
                    value={timeRange}
                  />
                )}
                <SocialPublishingAnalyticsSyncStatus
                  isRefreshing={isSyncing}
                  lastSyncedAt={dashboard.lastSyncedAt}
                  stale={dashboard.stale}
                />
              </div>
            </div>

            {workspace === "overview" ? (
              <SocialPublishingAnalyticsOverview
                dailyMetrics={filteredDailyMetrics}
                platformSummaries={platformSummaries}
                totals={totals}
              />
            ) : null}

            {workspace === "strategy" ? (
              <SocialPublishingAnalyticsStrategy
                bestTimes={dashboard.bestTimes}
                contentDecay={dashboard.contentDecay}
                followerStats={dashboard.followerStats}
                postingFrequency={dashboard.postingFrequency}
              />
            ) : null}

            {workspace === "posts" ? (
              <>
                <SocialPublishingAnalyticsResultsSection
                  analytics={pagination.pageItems}
                />
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
              </>
            ) : null}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
