"use client";

import { Panel } from "@/app/_components/ui/Panel";
import { DevelopmentBlockedActionButton } from "@/app/dashboard/development/DevelopmentBlockedActionButton";
import { DevelopmentDashboardShell } from "@/app/dashboard/development/DevelopmentDashboardShell";
import { DevelopmentFixtureContent } from "@/app/dashboard/development/DevelopmentFixtureContent";
import { DevelopmentFixtureStateSelector } from "@/app/dashboard/development/DevelopmentFixtureStateSelector";
import { DevelopmentPageHeader } from "@/app/dashboard/development/DevelopmentPageHeader";
import { libraryDevelopmentFixture } from "@/lib/clipstitchr/development/fixtures/libraryDevelopmentFixture";
import { useDevelopmentFixtureState } from "@/lib/clipstitchr/development/hooks/useDevelopmentFixtureState";

export function DevelopmentLibraryPage() {
  const fixtureState = useDevelopmentFixtureState();

  return (
    <DevelopmentDashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-7">
        <DevelopmentPageHeader
          title="Library"
          description="Browse representative UGC, demos, Stitches, avatars, and Swipes without loading account media."
          actions={<DevelopmentBlockedActionButton>Add files</DevelopmentBlockedActionButton>}
        />
        <DevelopmentFixtureStateSelector value={fixtureState} />
        <DevelopmentFixtureContent
          state={fixtureState}
          emptyTitle="No local media"
          emptyDescription="This state shows how the Library guides someone before their first upload."
          errorMessage="The local Library fixture hit a simulated error. Production storage remains untouched."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {libraryDevelopmentFixture.map((item) => (
              <Panel key={item.name} className="overflow-hidden shadow-none">
                <div className="flex aspect-video items-center justify-center bg-[#18231d] px-6 text-center text-sm font-semibold text-[#d9e8de]">
                  Local media preview
                </div>
                <div className="p-5">
                  <p className="text-sm font-semibold text-text-tertiary">{item.kind}</p>
                  <h2 className="mt-1 text-lg font-bold text-text-primary">{item.name}</h2>
                  <p className="mt-2 text-sm text-text-secondary">{item.detail}</p>
                  <p className="mt-3 text-sm text-text-tertiary">
                    {item.tags.join(" · ")}
                  </p>
                </div>
              </Panel>
            ))}
          </div>
        </DevelopmentFixtureContent>
      </div>
    </DevelopmentDashboardShell>
  );
}
