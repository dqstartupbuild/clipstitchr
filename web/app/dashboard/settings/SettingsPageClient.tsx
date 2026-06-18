"use client";

import { useMemo } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { SettingsAppearancePanel } from "@/app/_components/settings/SettingsAppearancePanel";
import { SettingsAutomationPanel } from "@/app/_components/settings/SettingsAutomationPanel";
import { SettingsSubscriptionPanel } from "@/app/_components/settings/SettingsSubscriptionPanel";
import { SettingsSupportPanel } from "@/app/_components/settings/SettingsSupportPanel";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { useAutomationPreferences } from "@/lib/clipstitchr/hooks/useAutomationPreferences";
import { useSwiprLibrary } from "@/lib/clipstitchr/hooks/useSwiprLibrary";
import { getSwiprLibraryPacks } from "@/lib/clipstitchr/utils/getSwiprLibraryPacks";

export function SettingsPageClient() {
  const { activeProduct } = useDashboardProduct();
  const swiprLibrary = useSwiprLibrary();
  const automation = useAutomationPreferences(activeProduct?.id);
  const swiprPacks = useMemo(
    () => getSwiprLibraryPacks(swiprLibrary.backgrounds),
    [swiprLibrary.backgrounds],
  );

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Workspace"
          title="Settings"
          description="Manage account preferences and automation."
          actions={null}
        />
        <SettingsAppearancePanel />
        <SettingsAutomationPanel
          error={automation.error}
          isLoading={automation.isLoading}
          isSaving={automation.isSaving}
          productName={activeProduct?.name}
          preferences={automation.preferences}
          swiprPacks={swiprPacks}
          onSave={automation.savePreferences}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <SettingsSupportPanel />
          <SettingsSubscriptionPanel />
        </div>
      </div>
    </DashboardShell>
  );
}
