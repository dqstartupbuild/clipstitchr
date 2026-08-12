"use client";

import { Panel } from "@/app/_components/ui/Panel";
import { DevelopmentBlockedActionButton } from "@/app/dashboard/development/DevelopmentBlockedActionButton";
import { DevelopmentDashboardShell } from "@/app/dashboard/development/DevelopmentDashboardShell";
import { DevelopmentFixtureContent } from "@/app/dashboard/development/DevelopmentFixtureContent";
import { DevelopmentFixtureStateSelector } from "@/app/dashboard/development/DevelopmentFixtureStateSelector";
import { DevelopmentPageHeader } from "@/app/dashboard/development/DevelopmentPageHeader";
import { toolDevelopmentFixture } from "@/lib/clipstitchr/development/fixtures/toolDevelopmentFixture";
import { useDevelopmentFixtureState } from "@/lib/clipstitchr/development/hooks/useDevelopmentFixtureState";

type DevelopmentToolKey = keyof typeof toolDevelopmentFixture;

type DevelopmentToolPageProps = {
  tool: DevelopmentToolKey;
};

export function DevelopmentToolPage({ tool }: DevelopmentToolPageProps) {
  const fixtureState = useDevelopmentFixtureState();
  const fixture = toolDevelopmentFixture[tool];

  return (
    <DevelopmentDashboardShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-7">
        <DevelopmentPageHeader title={fixture.title} description={fixture.description} />
        <DevelopmentFixtureStateSelector value={fixtureState} />
        <DevelopmentFixtureContent
          state={fixtureState}
          emptyTitle={`No ${fixture.title} draft`}
          emptyDescription="This state shows the workspace before source material has been selected."
          errorMessage={`The local ${fixture.title} fixture is showing a simulated error. No generation request was sent.`}
        >
          <Panel className="p-6 shadow-none">
            <h2 className="text-xl font-bold text-text-primary">Local draft</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
              {fixture.sample}
            </p>
            <div className="mt-6">
              <DevelopmentBlockedActionButton message="Generation, uploads, and worker jobs are paused in Development preview.">
                Run preview action
              </DevelopmentBlockedActionButton>
            </div>
          </Panel>
        </DevelopmentFixtureContent>
      </div>
    </DevelopmentDashboardShell>
  );
}
