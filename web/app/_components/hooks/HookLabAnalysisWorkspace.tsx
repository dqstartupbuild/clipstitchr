"use client";

import { useState } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { HookLabFullBreakdown } from "@/app/_components/hooks/HookLabFullBreakdown";
import { HookLabQuickRead } from "@/app/_components/hooks/HookLabQuickRead";
import { HookLabScriptWorkspace } from "@/app/_components/hooks/HookLabScriptWorkspace";
import { useHookLabProductAdaptation } from "@/lib/clipstitchr/hooks/useHookLabProductAdaptation";
import type { HookLabAnalysisView } from "@/lib/clipstitchr/types/HookLabAnalysisView";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";

export function HookLabAnalysisWorkspace({ post }: { post: HookLabPost }) {
  const [activeView, setActiveView] =
    useState<HookLabAnalysisView>("summary");
  const adaptation = useHookLabProductAdaptation(post.id);

  if (!post.analysis) {
    return null;
  }

  const generateAndOpenScript = async () => {
    if (await adaptation.generate()) {
      setActiveView("script");
    }
  };

  return (
    <Tabs.Root
      className="flex min-h-0 flex-1 flex-col"
      value={activeView}
      onValueChange={(value) => {
        if (
          value === "summary" ||
          value === "breakdown" ||
          value === "script"
        ) {
          setActiveView(value);
        }
      }}
    >
      <Tabs.List
        activateOnFocus
        aria-label="Analysis details"
        className="flex shrink-0 gap-1 overflow-x-auto bg-surface px-4 py-2 sm:px-5"
      >
        <Tabs.Tab
          className="min-h-10 shrink-0 rounded-md px-3 text-sm font-semibold text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent data-[active]:bg-surface-muted data-[active]:text-text-primary"
          value="summary"
        >
          Quick read
        </Tabs.Tab>
        <Tabs.Tab
          className="min-h-10 shrink-0 rounded-md px-3 text-sm font-semibold text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent data-[active]:bg-surface-muted data-[active]:text-text-primary"
          value="breakdown"
        >
          Full breakdown
        </Tabs.Tab>
        <Tabs.Tab
          className="min-h-10 shrink-0 rounded-md px-3 text-sm font-semibold text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent data-[active]:bg-surface-muted data-[active]:text-text-primary"
          value="script"
        >
          Your script
          {adaptation.brief ? (
            <span className="ml-2 text-xs font-medium text-accent-dark">
              Ready
            </span>
          ) : null}
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel
        className="min-h-0 flex-1 overflow-y-auto p-4 focus-visible:outline-none sm:p-6"
        value="summary"
      >
        <HookLabQuickRead
          adaptation={adaptation}
          analysis={post.analysis}
          onGenerate={() => void generateAndOpenScript()}
          onOpenScript={() => setActiveView("script")}
        />
      </Tabs.Panel>

      <Tabs.Panel
        className="min-h-0 flex-1 overflow-y-auto p-4 focus-visible:outline-none sm:p-6"
        value="breakdown"
      >
        <HookLabFullBreakdown post={post} />
      </Tabs.Panel>

      <Tabs.Panel
        className="min-h-0 flex-1 overflow-y-auto p-4 focus-visible:outline-none sm:p-6"
        value="script"
      >
        <HookLabScriptWorkspace
          adaptation={adaptation}
          onGenerate={() => void generateAndOpenScript()}
        />
      </Tabs.Panel>
    </Tabs.Root>
  );
}
