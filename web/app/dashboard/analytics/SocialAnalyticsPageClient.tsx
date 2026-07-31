"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { SocialAnalyticsFilters } from "@/app/_components/social/SocialAnalyticsFilters";
import { SocialAnalyticsMetricGrid } from "@/app/_components/social/SocialAnalyticsMetricGrid";
import { SocialAnalyticsPublicationList } from "@/app/_components/social/SocialAnalyticsPublicationList";
import { SocialAnalyticsRefreshPanel } from "@/app/_components/social/SocialAnalyticsRefreshPanel";
import { SocialAnalyticsRollupTable } from "@/app/_components/social/SocialAnalyticsRollupTable";
import { getSocialAnalyticsRange } from "@/lib/clipstitchr/social/analytics/getSocialAnalyticsRange";
import type { SocialAnalyticsRangePreset } from "@/lib/clipstitchr/social/analytics/SocialAnalyticsRangePreset";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";

export function SocialAnalyticsPageClient() {
  const { isAuthenticated } = useConvexAuth();
  const dashboardProducts = useDashboardProduct();
  const [view, setView] = useState<
    "published_in_period" | "growth_during_period"
  >("published_in_period");
  const [rangePreset, setRangePreset] =
    useState<SocialAnalyticsRangePreset>("7_days");
  const [selectedProductId, setSelectedProductId] = useState(
    dashboardProducts.activeProduct?.id ?? "",
  );
  const productSelectionInitializedRef = useRef(
    Boolean(dashboardProducts.activeProduct?.id),
  );
  const [socialAccountId, setSocialAccountId] = useState("");
  const [rangeNow] = useState(() => new Date().toISOString());
  const [customStart, setCustomStart] = useState(() =>
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1_000)
      .toISOString()
      .slice(0, 16),
  );
  const [customEnd, setCustomEnd] = useState(() =>
    new Date().toISOString().slice(0, 16),
  );
  const range = useMemo(
    () =>
      getSocialAnalyticsRange({
        preset: rangePreset,
        customStart,
        customEnd,
        now: rangeNow,
      }),
    [customEnd, customStart, rangeNow, rangePreset],
  );
  const accounts = useQuery(
    api.socialAccounts.listSocialAccounts.listSocialAccounts,
    isAuthenticated ? {} : "skip",
  );
  const report = useQuery(
    api.socialAnalytics.getSocialAnalyticsReport.getSocialAnalyticsReport,
    isAuthenticated && range.isValid
      ? {
          view,
          rangeStart: range.rangeStart,
          rangeEnd: range.rangeEnd,
          ...(selectedProductId ? { productId: selectedProductId } : {}),
          ...(socialAccountId ? { socialAccountId } : {}),
        }
      : "skip",
  );
  const showSign = view === "growth_during_period";
  const hasGrowthBaseline =
    !showSign ||
    Boolean(
      report?.publications.some((publication) =>
        Object.values(publication.metrics).some((value) => value !== null),
      ),
    );

  useEffect(() => {
    if (
      !productSelectionInitializedRef.current &&
      dashboardProducts.activeProduct?.id
    ) {
      productSelectionInitializedRef.current = true;
      setSelectedProductId(dashboardProducts.activeProduct.id);
    }
  }, [dashboardProducts.activeProduct?.id]);

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Analytics"
          title="Analytics"
          description="Review post performance across connected channels."
          actions={null}
        />
        <SocialAnalyticsFilters
          accounts={(accounts ?? []).map((account) => ({
            id: account.id,
            displayName: account.displayName,
            username: account.username,
            platform: account.platform,
          }))}
          customEnd={customEnd}
          customStart={customStart}
          productId={selectedProductId}
          products={dashboardProducts.products}
          rangePreset={rangePreset}
          socialAccountId={socialAccountId}
          view={view}
          onCustomEndChange={setCustomEnd}
          onCustomStartChange={setCustomStart}
          onProductChange={setSelectedProductId}
          onRangePresetChange={setRangePreset}
          onSocialAccountChange={setSocialAccountId}
          onViewChange={setView}
        />
        {range.isValid ? (
          <SocialAnalyticsRefreshPanel
            latestRun={report?.latestRefreshRun ?? null}
            productId={selectedProductId || undefined}
            socialAccountId={socialAccountId || undefined}
            rangeStart={range.rangeStart}
            rangeEnd={range.rangeEnd}
          />
        ) : null}
        <section
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
          aria-labelledby="analytics-view-title"
        >
          <div>
            <h2
              className="text-lg font-bold text-text-primary"
              id="analytics-view-title"
            >
              {showSign ? "Growth during period" : "Posts published in period"}
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-text-secondary">
              {showSign
                ? "Compare the newest saved count with the closest saved count at the start of this range."
                : "See the latest saved totals for posts published in this range."}
            </p>
          </div>
          {report?.combinesMultiplePlatforms ||
          report?.combinesMultipleAccounts ? (
            <p className="text-sm font-semibold text-amber-800">
              These totals combine{" "}
              {report.combinesMultiplePlatforms
                ? "multiple platforms"
                : "one platform"}{" "}
              across{" "}
              {report.combinesMultipleAccounts
                ? "multiple accounts"
                : "one account"}
              .
            </p>
          ) : null}
        </section>
        {!range.isValid ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
            role="alert"
          >
            Choose a valid custom date range.
          </p>
        ) : report === undefined ? (
          <p className="rounded-lg border border-border bg-white p-4 text-sm font-semibold text-text-secondary">
            Loading saved analytics...
          </p>
        ) : !hasGrowthBaseline ? (
          <p className="rounded-lg border border-border bg-white p-4 text-sm font-bold text-text-primary">
            Not enough history
          </p>
        ) : (
          <>
            <SocialAnalyticsMetricGrid
              metrics={report.allProducts.metrics}
              showSign={showSign}
            />
            <SocialAnalyticsPublicationList
              publications={report.publications}
              showSign={showSign}
            />
            <div className="grid gap-3">
              <SocialAnalyticsRollupTable
                label="Products"
                rollups={report.productTotals}
                showSign={showSign}
              />
              <SocialAnalyticsRollupTable
                label="Accounts"
                rollups={report.accountTotals}
                showSign={showSign}
              />
              <SocialAnalyticsRollupTable
                label="Logical posts"
                rollups={report.logicalPosts}
                showSign={showSign}
              />
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
