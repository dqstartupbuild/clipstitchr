"use client";

import { useState } from "react";
import { HookLabIdeaComposer } from "@/app/_components/hooks/HookLabIdeaComposer";
import { HookLabIdeaFilters } from "@/app/_components/hooks/HookLabIdeaFilters";
import { HookLabIdeaGrid } from "@/app/_components/hooks/HookLabIdeaGrid";
import type { HookLabIdea } from "@/lib/clipstitchr/types/HookLabIdea";
import type { HookLabCurrentUseIdsByIdeaId } from "@/lib/clipstitchr/types/HookLabCurrentUseIdsByIdeaId";
import type { HookLabIdeaCapabilityFilter } from "@/lib/clipstitchr/types/HookLabIdeaCapabilityFilter";
import type { HookLabIdeaScope } from "@/lib/clipstitchr/types/HookLabIdeaScope";
import type { HookLabIdeaScopeFilter } from "@/lib/clipstitchr/types/HookLabIdeaScopeFilter";
import type { HookLabIdeaStatusFilter } from "@/lib/clipstitchr/types/HookLabIdeaStatusFilter";
import type { HookLabIdeaUpdateInput } from "@/lib/clipstitchr/types/HookLabIdeaUpdateInput";
import type { HookLabIdeaVariationCount } from "@/lib/clipstitchr/types/HookLabIdeaVariationCount";
import { useHookLabIdeas } from "@/lib/clipstitchr/hooks/useHookLabIdeas";
import { useHookLabIdeaLifecycleAnalytics } from "@/lib/clipstitchr/hooks/useHookLabIdeaLifecycleAnalytics";
import { useHookLabStitchSources } from "@/lib/clipstitchr/hooks/useHookLabStitchSources";

type HookLabIdeasViewProps = {
  activeProductId?: string;
  archivingIdeaId: string | null;
  currentUseIdsByIdeaId: HookLabCurrentUseIdsByIdeaId;
  deletingIdeaId: string | null;
  error: string | null;
  isCreating: boolean;
  retryingIdeaId: string | null;
  savingIdeaId: string | null;
  usingIdeaId: string | null;
  onArchive: (id: string) => void;
  onCreateFromStitch: (
    stitchId: string,
    scope: HookLabIdeaScope,
    productId?: string,
  ) => Promise<void>;
  onCreateFromValue: (
    value: string,
    scope: HookLabIdeaScope,
    productId?: string,
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRetry: (id: string) => void;
  onUpdate: (id: string, input: HookLabIdeaUpdateInput) => Promise<void>;
  onUse: (idea: HookLabIdea, count: HookLabIdeaVariationCount) => void;
};

export function HookLabIdeasView({
  activeProductId,
  archivingIdeaId,
  currentUseIdsByIdeaId,
  deletingIdeaId,
  error,
  isCreating,
  retryingIdeaId,
  savingIdeaId,
  usingIdeaId,
  onArchive,
  onCreateFromStitch,
  onCreateFromValue,
  onDelete,
  onRetry,
  onUpdate,
  onUse,
}: HookLabIdeasViewProps) {
  const [capabilityFilter, setCapabilityFilter] =
    useState<HookLabIdeaCapabilityFilter>("all");
  const [scopeFilter, setScopeFilter] =
    useState<HookLabIdeaScopeFilter>("current");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<HookLabIdeaStatusFilter>("all");
  const ideas = useHookLabIdeas({
    productId: activeProductId,
    scopeFilter,
    searchQuery,
    statusFilter,
  });
  const stitchSources = useHookLabStitchSources();

  useHookLabIdeaLifecycleAnalytics(ideas.ideas);

  return (
    <div className="grid gap-5">
      <HookLabIdeaComposer
        activeProductId={activeProductId}
        error={error}
        isLoadingStitches={stitchSources.isLoading}
        isSaving={isCreating}
        stitches={stitchSources.stitches}
        onSaveStitch={(stitchId, scope) =>
          onCreateFromStitch(stitchId, scope, activeProductId)
        }
        onSaveValue={(value, scope) =>
          onCreateFromValue(value, scope, activeProductId)
        }
      />
      <HookLabIdeaFilters
        capabilityFilter={capabilityFilter}
        scopeFilter={scopeFilter}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onCapabilityFilterChange={setCapabilityFilter}
        onScopeFilterChange={setScopeFilter}
        onSearchQueryChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
      />
      <HookLabIdeaGrid
        activeProductId={activeProductId}
        archivingIdeaId={archivingIdeaId}
        capabilityFilter={capabilityFilter}
        canLoadMore={ideas.canLoadMore}
        currentUseIdsByIdeaId={currentUseIdsByIdeaId}
        deletingIdeaId={deletingIdeaId}
        ideas={ideas.ideas}
        isLoading={ideas.isLoading}
        isLoadingMore={ideas.isLoadingMore}
        retryingIdeaId={retryingIdeaId}
        savingIdeaId={savingIdeaId}
        usingIdeaId={usingIdeaId}
        onArchive={onArchive}
        onDelete={onDelete}
        onLoadMore={ideas.loadMore}
        onRetry={onRetry}
        onStartAdding={() =>
          document.getElementById("hook-lab-idea-input")?.focus()
        }
        onUpdate={onUpdate}
        onUse={onUse}
      />
    </div>
  );
}
