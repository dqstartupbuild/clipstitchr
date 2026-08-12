"use client";

import { Panel } from "@/app/_components/ui/Panel";
import { DevelopmentAccountSummary } from "@/app/dashboard/development/DevelopmentAccountSummary";
import { DevelopmentBlockedActionButton } from "@/app/dashboard/development/DevelopmentBlockedActionButton";
import { DevelopmentDashboardShell } from "@/app/dashboard/development/DevelopmentDashboardShell";
import { DevelopmentFixtureContent } from "@/app/dashboard/development/DevelopmentFixtureContent";
import { DevelopmentFixtureStateSelector } from "@/app/dashboard/development/DevelopmentFixtureStateSelector";
import { DevelopmentPageHeader } from "@/app/dashboard/development/DevelopmentPageHeader";
import { settingsDevelopmentFixture } from "@/lib/clipstitchr/development/fixtures/settingsDevelopmentFixture";
import { useDevelopmentFixtureState } from "@/lib/clipstitchr/development/hooks/useDevelopmentFixtureState";

export function DevelopmentSettingsPage() {
  const fixtureState = useDevelopmentFixtureState();

  return (
    <DevelopmentDashboardShell>
      <div className="mx-auto flex max-w-5xl flex-col gap-7">
        <DevelopmentPageHeader
          title="Settings"
          description="Inspect product, automation, account, and plan states without saving changes."
        />
        <DevelopmentFixtureStateSelector value={fixtureState} />
        <DevelopmentFixtureContent
          state={fixtureState}
          emptyTitle="No product settings"
          emptyDescription="This state represents a new workspace before product setup is complete."
          errorMessage="The settings fixture is showing a simulated load error. No account service was contacted."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel className="p-5 shadow-none">
              <h2 className="text-xl font-bold text-text-primary">Product</h2>
              <dl className="mt-4 grid gap-4 text-sm">
                <div>
                  <dt className="text-text-tertiary">Name</dt>
                  <dd className="mt-1 font-semibold text-text-primary">
                    {settingsDevelopmentFixture.product.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-text-tertiary">Audience</dt>
                  <dd className="mt-1 leading-6 text-text-secondary">
                    {settingsDevelopmentFixture.product.audience}
                  </dd>
                </div>
                <div>
                  <dt className="text-text-tertiary">Website</dt>
                  <dd className="mt-1 break-all text-text-secondary">
                    {settingsDevelopmentFixture.product.website}
                  </dd>
                </div>
              </dl>
              <div className="mt-5">
                <DevelopmentBlockedActionButton message="Product changes are paused in Development preview.">
                  Save product changes
                </DevelopmentBlockedActionButton>
              </div>
            </Panel>
            <Panel className="p-5 shadow-none">
              <h2 className="text-xl font-bold text-text-primary">Development account</h2>
              <div className="mt-3 bg-surface-muted px-2">
                <DevelopmentAccountSummary />
              </div>
              <p className="mt-4 text-sm text-text-secondary">
                {settingsDevelopmentFixture.automation}
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Plan: {settingsDevelopmentFixture.plan}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <DevelopmentBlockedActionButton message="Billing is unavailable in Development preview.">
                  Manage billing
                </DevelopmentBlockedActionButton>
                <DevelopmentBlockedActionButton
                  variant="danger"
                  message="Destructive account actions are paused in Development preview."
                >
                  Delete product
                </DevelopmentBlockedActionButton>
              </div>
            </Panel>
          </div>
        </DevelopmentFixtureContent>
      </div>
    </DevelopmentDashboardShell>
  );
}
