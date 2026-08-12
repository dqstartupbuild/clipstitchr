"use client";

import { Panel } from "@/app/_components/ui/Panel";
import { DevelopmentBlockedActionButton } from "@/app/dashboard/development/DevelopmentBlockedActionButton";
import { DevelopmentDashboardShell } from "@/app/dashboard/development/DevelopmentDashboardShell";
import { DevelopmentFixtureContent } from "@/app/dashboard/development/DevelopmentFixtureContent";
import { DevelopmentFixtureStateSelector } from "@/app/dashboard/development/DevelopmentFixtureStateSelector";
import { DevelopmentPageHeader } from "@/app/dashboard/development/DevelopmentPageHeader";
import { dashboardDevelopmentFixture } from "@/lib/clipstitchr/development/fixtures/dashboardDevelopmentFixture";
import { useDevelopmentFixtureState } from "@/lib/clipstitchr/development/hooks/useDevelopmentFixtureState";

export function DevelopmentDashboardHomePage() {
  const fixtureState = useDevelopmentFixtureState();

  return (
    <DevelopmentDashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-7">
        <DevelopmentPageHeader
          title="Dashboard"
          description="A local, read-only view of recent clips, drafts, and finished work."
          actions={<DevelopmentBlockedActionButton>Upload media</DevelopmentBlockedActionButton>}
        />
        <DevelopmentFixtureStateSelector value={fixtureState} />
        <DevelopmentFixtureContent
          state={fixtureState}
          emptyTitle="This workspace is empty"
          emptyDescription="Use Sample data to preview a workspace with saved clips and drafts."
          errorMessage="The dashboard fixture could not be loaded. No live service was contacted."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {dashboardDevelopmentFixture.stats.map((stat) => (
              <Panel key={stat.label} className="p-5 shadow-none">
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold text-text-primary">
                  {stat.value}
                </p>
              </Panel>
            ))}
          </div>
          <section aria-labelledby="recent-local-work" className="grid gap-3">
            <h2 id="recent-local-work" className="text-xl font-bold text-text-primary">
              Recent local work
            </h2>
            {dashboardDevelopmentFixture.recentWork.map((item) => (
              <Panel key={item.name} className="p-5 shadow-none">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-bold text-text-primary">{item.name}</p>
                  <p className="text-sm font-semibold text-text-tertiary">{item.kind}</p>
                </div>
                <p className="mt-2 text-sm text-text-secondary">{item.detail}</p>
              </Panel>
            ))}
          </section>
        </DevelopmentFixtureContent>
      </div>
    </DevelopmentDashboardShell>
  );
}
