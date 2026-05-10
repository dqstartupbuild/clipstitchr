"use client";

import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { SettingsSubscriptionPanel } from "@/app/_components/settings/SettingsSubscriptionPanel";
import { SettingsSupportPanel } from "@/app/_components/settings/SettingsSupportPanel";
import { WorkspaceSettingsForm } from "@/app/_components/settings/WorkspaceSettingsForm";
import { useWorkspaceSettings } from "@/lib/clipstitchr/hooks/useWorkspaceSettings";

export function SettingsPageClient() {
  const workspaceSettings = useWorkspaceSettings();

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <DashboardPageHeader
          eyebrow="Workspace"
          title="Settings"
          description="Save product and audience context for carousel generation and future workspace controls."
          actions={null}
        />
        {workspaceSettings.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {workspaceSettings.error}
          </div>
        ) : null}
        <WorkspaceSettingsForm
          key={workspaceSettings.settings?.updatedAt ?? "new-settings"}
          settings={workspaceSettings.settings}
          isLoading={workspaceSettings.isLoading}
          isSaving={workspaceSettings.isSaving}
          onSave={workspaceSettings.saveSettings}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <SettingsSupportPanel />
          <SettingsSubscriptionPanel />
        </div>
      </div>
    </DashboardShell>
  );
}
