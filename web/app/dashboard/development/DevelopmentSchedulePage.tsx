"use client";

import { Panel } from "@/app/_components/ui/Panel";
import { DevelopmentBlockedActionButton } from "@/app/dashboard/development/DevelopmentBlockedActionButton";
import { DevelopmentDashboardShell } from "@/app/dashboard/development/DevelopmentDashboardShell";
import { DevelopmentFixtureContent } from "@/app/dashboard/development/DevelopmentFixtureContent";
import { DevelopmentFixtureStateSelector } from "@/app/dashboard/development/DevelopmentFixtureStateSelector";
import { DevelopmentPageHeader } from "@/app/dashboard/development/DevelopmentPageHeader";
import { scheduleDevelopmentFixture } from "@/lib/clipstitchr/development/fixtures/scheduleDevelopmentFixture";
import { useDevelopmentFixtureState } from "@/lib/clipstitchr/development/hooks/useDevelopmentFixtureState";

export function DevelopmentSchedulePage() {
  const fixtureState = useDevelopmentFixtureState();

  return (
    <DevelopmentDashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-7">
        <DevelopmentPageHeader
          title="Schedule"
          description="Review representative publishing plans without connecting an account or sending a post."
          actions={
            <DevelopmentBlockedActionButton message="Publishing is paused in Development preview. Nothing will be queued.">
              Schedule a post
            </DevelopmentBlockedActionButton>
          }
        />
        <DevelopmentFixtureStateSelector value={fixtureState} />
        <DevelopmentFixtureContent
          state={fixtureState}
          emptyTitle="Nothing scheduled"
          emptyDescription="This is the first-use state before a finished ad has been added to the calendar."
          errorMessage="The schedule fixture is showing a simulated account error. No publishing service was contacted."
        >
          <div className="grid gap-3">
            {scheduleDevelopmentFixture.map((post) => (
              <Panel key={post.name} className="p-5 shadow-none">
                <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_11rem_9rem] md:items-center">
                  <div>
                    <h2 className="font-bold text-text-primary">{post.name}</h2>
                    <p className="mt-1 text-sm text-text-secondary">{post.channel}</p>
                  </div>
                  <p className="text-sm font-semibold text-text-secondary">{post.date}</p>
                  <p className="text-sm font-bold text-text-primary">{post.status}</p>
                </div>
              </Panel>
            ))}
          </div>
        </DevelopmentFixtureContent>
      </div>
    </DevelopmentDashboardShell>
  );
}
