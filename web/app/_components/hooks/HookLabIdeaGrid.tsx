"use client";

import { Lightbulb } from "lucide-react";
import { HookLabIdeaCard } from "@/app/_components/hooks/HookLabIdeaCard";
import { HookLabIdeaCardSkeleton } from "@/app/_components/hooks/HookLabIdeaCardSkeleton";
import { Button } from "@/app/_components/ui/Button";
import type { HookLabIdea } from "@/lib/clipstitchr/types/HookLabIdea";
import type { HookLabCurrentUseIdsByIdeaId } from "@/lib/clipstitchr/types/HookLabCurrentUseIdsByIdeaId";
import type { HookLabIdeaCapabilityFilter } from "@/lib/clipstitchr/types/HookLabIdeaCapabilityFilter";
import type { HookLabIdeaUpdateInput } from "@/lib/clipstitchr/types/HookLabIdeaUpdateInput";
import type { HookLabIdeaVariationCount } from "@/lib/clipstitchr/types/HookLabIdeaVariationCount";
import { getHookLabIdeaMatchesCapability } from "@/lib/clipstitchr/utils/getHookLabIdeaMatchesCapability";

type HookLabIdeaGridProps = {
  activeProductId?: string;
  archivingIdeaId: string | null;
  capabilityFilter: HookLabIdeaCapabilityFilter;
  canLoadMore: boolean;
  currentUseIdsByIdeaId: HookLabCurrentUseIdsByIdeaId;
  deletingIdeaId: string | null;
  ideas: HookLabIdea[];
  isLoading: boolean;
  isLoadingMore: boolean;
  retryingIdeaId: string | null;
  savingIdeaId: string | null;
  usingIdeaId: string | null;
  onArchive: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onLoadMore: () => void;
  onStartAdding: () => void;
  onRetry: (id: string) => void;
  onUpdate: (id: string, input: HookLabIdeaUpdateInput) => Promise<void>;
  onUse: (idea: HookLabIdea, count: HookLabIdeaVariationCount) => void;
};

export function HookLabIdeaGrid({
  activeProductId,
  archivingIdeaId,
  capabilityFilter,
  canLoadMore,
  currentUseIdsByIdeaId,
  deletingIdeaId,
  ideas,
  isLoading,
  isLoadingMore,
  retryingIdeaId,
  savingIdeaId,
  usingIdeaId,
  onArchive,
  onDelete,
  onLoadMore,
  onStartAdding,
  onRetry,
  onUpdate,
  onUse,
}: HookLabIdeaGridProps) {
  const visibleIdeas = ideas.filter((idea) =>
    getHookLabIdeaMatchesCapability(idea, capabilityFilter),
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading ideas">
        {[0, 1, 2].map((item) => (
          <HookLabIdeaCardSkeleton key={item} />
        ))}
      </div>
    );
  }

  if (!visibleIdeas.length) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <Lightbulb aria-hidden className="mx-auto size-8 text-accent" />
        <h2 className="mt-3 text-balance text-lg font-bold text-text-primary">
          {canLoadMore ? "No matches in this group yet" : "See something worth trying?"}
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-pretty text-sm leading-6 text-text-secondary">
          {canLoadMore
            ? "Keep looking through your saved ideas, or change a filter."
            : "Paste the line or link here. Hook Lab will learn the idea without copying the post."}
        </p>
        <Button
          type="button"
          className="mt-4"
          variant={canLoadMore ? "secondary" : "primary"}
          isLoading={canLoadMore && isLoadingMore}
          onClick={canLoadMore ? onLoadMore : onStartAdding}
        >
          {canLoadMore ? "Keep looking" : "Add an idea"}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleIdeas.map((idea) => (
          <HookLabIdeaCard
            key={idea.id}
            activeProductId={activeProductId}
            currentUseId={currentUseIdsByIdeaId[idea.id]}
            idea={idea}
            isArchiving={archivingIdeaId === idea.id}
            isDeleting={deletingIdeaId === idea.id}
            isRetrying={retryingIdeaId === idea.id}
            isSaving={savingIdeaId === idea.id}
            isUsing={usingIdeaId === idea.id}
            onArchive={onArchive}
            onDelete={onDelete}
            onPasteInstead={onStartAdding}
            onRetry={onRetry}
            onUpdate={onUpdate}
            onUse={onUse}
          />
        ))}
      </div>
      {canLoadMore ? (
        <div className="mt-5 flex justify-center">
          <Button
            type="button"
            variant="secondary"
            isLoading={isLoadingMore}
            onClick={onLoadMore}
          >
            Load more ideas
          </Button>
        </div>
      ) : null}
    </div>
  );
}
