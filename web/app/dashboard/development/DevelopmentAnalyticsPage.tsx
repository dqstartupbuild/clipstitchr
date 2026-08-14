"use client";

import { useMemo, useState } from "react";
import { SocialPublishingAnalyticsOverview } from "@/app/dashboard/analytics/SocialPublishingAnalyticsOverview";
import { SocialPublishingAnalyticsResultsSection } from "@/app/dashboard/analytics/SocialPublishingAnalyticsResultsSection";
import { SocialPublishingAnalyticsStrategy } from "@/app/dashboard/analytics/SocialPublishingAnalyticsStrategy";
import {
  SocialPublishingAnalyticsWorkspaceNav,
  type SocialPublishingAnalyticsWorkspace,
} from "@/app/dashboard/analytics/SocialPublishingAnalyticsWorkspaceNav";
import { DevelopmentBlockedActionButton } from "@/app/dashboard/development/DevelopmentBlockedActionButton";
import { DevelopmentDashboardShell } from "@/app/dashboard/development/DevelopmentDashboardShell";
import { DevelopmentFixtureContent } from "@/app/dashboard/development/DevelopmentFixtureContent";
import { DevelopmentFixtureStateSelector } from "@/app/dashboard/development/DevelopmentFixtureStateSelector";
import { DevelopmentPageHeader } from "@/app/dashboard/development/DevelopmentPageHeader";
import { analyticsDevelopmentFixture } from "@/lib/clipstitchr/development/fixtures/analyticsDevelopmentFixture";
import { useDevelopmentFixtureState } from "@/lib/clipstitchr/development/hooks/useDevelopmentFixtureState";
import { getSocialPublishingAnalyticsTotals } from "@/lib/clipstitchr/utils/getSocialPublishingAnalyticsTotals";
import { getSocialPublishingPlatformAnalyticsSummaries } from "@/lib/clipstitchr/utils/getSocialPublishingPlatformAnalyticsSummaries";

export function DevelopmentAnalyticsPage() {
  const fixtureState = useDevelopmentFixtureState();
  const [workspace, setWorkspace] =
    useState<SocialPublishingAnalyticsWorkspace>("overview");
  const totals = useMemo(
    () => getSocialPublishingAnalyticsTotals(analyticsDevelopmentFixture.analytics),
    [],
  );
  const platformSummaries = useMemo(
    () =>
      getSocialPublishingPlatformAnalyticsSummaries(
        analyticsDevelopmentFixture.analytics,
      ),
    [],
  );

  return (
    <DevelopmentDashboardShell>
      <div className="mx-auto flex min-w-0 max-w-7xl flex-col gap-7">
        <DevelopmentPageHeader
          title="Analytics"
          description="See every post from connected accounts, including posts published outside ClipStitchr."
          actions={
            <DevelopmentBlockedActionButton message="Analytics sync is paused in Development preview. No provider request was sent.">
              Refresh analytics
            </DevelopmentBlockedActionButton>
          }
        />
        <DevelopmentFixtureStateSelector value={fixtureState} />
        <DevelopmentFixtureContent
          state={fixtureState}
          emptyTitle="No post results yet"
          emptyDescription="This state appears before connected channels return their first metrics."
          errorMessage="The analytics fixture is showing a simulated sync error. Live accounts remain untouched."
        >
          <div className="grid min-w-0 gap-5">
            <SocialPublishingAnalyticsWorkspaceNav
              postCount={analyticsDevelopmentFixture.analytics.length}
              value={workspace}
              onChange={setWorkspace}
            />
            {workspace === "overview" ? (
              <SocialPublishingAnalyticsOverview
                dailyMetrics={analyticsDevelopmentFixture.dailyMetrics}
                platformSummaries={platformSummaries}
                totals={totals}
              />
            ) : null}
            {workspace === "strategy" ? (
              <SocialPublishingAnalyticsStrategy
                bestTimes={analyticsDevelopmentFixture.bestTimes}
                contentDecay={analyticsDevelopmentFixture.contentDecay}
                followerStats={analyticsDevelopmentFixture.followerStats}
                postingFrequency={analyticsDevelopmentFixture.postingFrequency}
              />
            ) : null}
            {workspace === "posts" ? (
              <SocialPublishingAnalyticsResultsSection
                analytics={analyticsDevelopmentFixture.analytics}
              />
            ) : null}
          </div>
        </DevelopmentFixtureContent>
      </div>
    </DevelopmentDashboardShell>
  );
}
