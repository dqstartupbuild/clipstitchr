"use client";

import { useState } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { HookLabAnalyzerWorkspace } from "@/app/_components/hooks/HookLabAnalyzerWorkspace";
import { HookLabTabs } from "@/app/_components/hooks/HookLabTabs";
import { HookLibraryWorkspace } from "@/app/_components/hooks/HookLibraryWorkspace";
import type { HookLabTab } from "@/lib/clipstitchr/types/HookLabTab";

export function HookLabPageClient() {
  const [activeTab, setActiveTab] = useState<HookLabTab>("analysis");

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-7">
        <DashboardPageHeader
          eyebrow="Hook research workspace"
          title="Hook Lab"
          description="Study a public TikTok or Instagram post, then browse more than a thousand hook patterns for your next piece of content."
        />
        <HookLabTabs activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === "analysis" ? (
          <HookLabAnalyzerWorkspace />
        ) : (
          <HookLibraryWorkspace />
        )}
      </div>
    </DashboardShell>
  );
}
