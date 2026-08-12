"use client";

import { useState } from "react";
import { Panel } from "@/app/_components/ui/Panel";
import { DevelopmentBlockedActionButton } from "@/app/dashboard/development/DevelopmentBlockedActionButton";
import { DevelopmentDashboardShell } from "@/app/dashboard/development/DevelopmentDashboardShell";
import { DevelopmentFixtureContent } from "@/app/dashboard/development/DevelopmentFixtureContent";
import { DevelopmentFixtureStateSelector } from "@/app/dashboard/development/DevelopmentFixtureStateSelector";
import { DevelopmentPageHeader } from "@/app/dashboard/development/DevelopmentPageHeader";
import { hookLabDevelopmentFixture } from "@/lib/clipstitchr/development/fixtures/hookLabDevelopmentFixture";
import { useDevelopmentFixtureState } from "@/lib/clipstitchr/development/hooks/useDevelopmentFixtureState";

export function DevelopmentHookLabPage() {
  const fixtureState = useDevelopmentFixtureState();
  const [postUrl, setPostUrl] = useState("https://www.tiktok.com/@creator/video/123456789");

  return (
    <DevelopmentDashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-7">
        <DevelopmentPageHeader
          title="Hook Lab"
          description="Study representative social openings without importing a post or running paid analysis."
        />
        <DevelopmentFixtureStateSelector value={fixtureState} />
        <Panel className="p-5 shadow-none">
          <label htmlFor="development-hook-url" className="text-sm font-bold text-text-primary">
            Public post URL
          </label>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start">
            <input
              id="development-hook-url"
              value={postUrl}
              className="min-h-10 min-w-0 flex-1 rounded-md bg-surface-muted px-3 py-2 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onChange={(event) => setPostUrl(event.target.value)}
            />
            <DevelopmentBlockedActionButton message="Post imports and paid analysis are paused in Development preview.">
              Analyze post
            </DevelopmentBlockedActionButton>
          </div>
        </Panel>
        <DevelopmentFixtureContent
          state={fixtureState}
          emptyTitle="No analyzed posts"
          emptyDescription="This shows Hook Lab before someone has analyzed their first public post."
          errorMessage="A simulated Hook Lab error is active. No provider or worker request was sent."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {hookLabDevelopmentFixture.map((item) => (
              <Panel key={item.opening} className="p-5 shadow-none">
                <p className="text-sm font-semibold text-text-tertiary">
                  {item.platform} · {item.status}
                </p>
                <h2 className="mt-3 text-xl font-bold leading-7 text-text-primary">
                  {item.opening}
                </h2>
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  {item.takeaway}
                </p>
              </Panel>
            ))}
          </div>
        </DevelopmentFixtureContent>
      </div>
    </DevelopmentDashboardShell>
  );
}
