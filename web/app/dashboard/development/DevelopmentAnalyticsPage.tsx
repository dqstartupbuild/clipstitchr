"use client";

import { Panel } from "@/app/_components/ui/Panel";
import { DevelopmentBlockedActionButton } from "@/app/dashboard/development/DevelopmentBlockedActionButton";
import { DevelopmentDashboardShell } from "@/app/dashboard/development/DevelopmentDashboardShell";
import { DevelopmentFixtureContent } from "@/app/dashboard/development/DevelopmentFixtureContent";
import { DevelopmentFixtureStateSelector } from "@/app/dashboard/development/DevelopmentFixtureStateSelector";
import { DevelopmentPageHeader } from "@/app/dashboard/development/DevelopmentPageHeader";
import { analyticsDevelopmentFixture } from "@/lib/clipstitchr/development/fixtures/analyticsDevelopmentFixture";
import { useDevelopmentFixtureState } from "@/lib/clipstitchr/development/hooks/useDevelopmentFixtureState";

export function DevelopmentAnalyticsPage() {
  const fixtureState = useDevelopmentFixtureState();

  return (
    <DevelopmentDashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-7">
        <DevelopmentPageHeader
          title="Analytics"
          description="Explore realistic post results without syncing a social account."
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
          <div className="grid gap-3 sm:grid-cols-3">
            {analyticsDevelopmentFixture.stats.map((stat) => (
              <Panel key={stat.label} className="p-5 shadow-none">
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold text-text-primary">{stat.value}</p>
              </Panel>
            ))}
          </div>
          <section aria-labelledby="local-post-results" className="grid gap-3">
            <h2 id="local-post-results" className="text-xl font-bold text-text-primary">
              Post results
            </h2>
            {analyticsDevelopmentFixture.results.map((result) => (
              <Panel key={result.name} className="p-5 shadow-none">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem_8rem] sm:items-center">
                  <p className="font-bold text-text-primary">{result.name}</p>
                  <p className="text-sm text-text-secondary">{result.plays} plays</p>
                  <p className="text-sm text-text-secondary">{result.rate} engaged</p>
                </div>
              </Panel>
            ))}
          </section>
        </DevelopmentFixtureContent>
      </div>
    </DevelopmentDashboardShell>
  );
}
