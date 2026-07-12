"use client";

import { MessageSquareText } from "lucide-react";
import { HookLabReviewCard } from "@/app/_components/hooks/HookLabReviewCard";
import { HookLabReviewCardSkeleton } from "@/app/_components/hooks/HookLabReviewCardSkeleton";
import { Button } from "@/app/_components/ui/Button";
import type { HookLabReviewOption } from "@/lib/clipstitchr/types/HookLabReviewOption";

type HookLabReviewGridProps = {
  canLoadMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  options: HookLabReviewOption[];
  savingOptionId: string | null;
  onLoadMore: () => void;
  onMarkNotForMe: (id: string) => void;
  onSaveIdea: (id: string, productId?: string) => void;
  onUndo: (id: string) => void;
  onUse: (id: string) => void;
};

export function HookLabReviewGrid({
  canLoadMore,
  isLoading,
  isLoadingMore,
  options,
  savingOptionId,
  onLoadMore,
  onMarkNotForMe,
  onSaveIdea,
  onUndo,
  onUse,
}: HookLabReviewGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading hooks">
        {[0, 1, 2].map((item) => (
          <HookLabReviewCardSkeleton key={item} />
        ))}
      </div>
    );
  }

  if (!options.length) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <MessageSquareText aria-hidden className="mx-auto size-8 text-accent" />
        <h2 className="mt-3 text-balance text-lg font-bold text-text-primary">
          Nothing waiting here
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-pretty text-sm leading-6 text-text-secondary">
          New generated hooks will show up here one by one, so every choice only
          affects that hook.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => (
          <HookLabReviewCard
            key={option.id}
            isSaving={savingOptionId === option.id}
            option={option}
            onMarkNotForMe={onMarkNotForMe}
            onSaveIdea={onSaveIdea}
            onUndo={onUndo}
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
            Load more hooks
          </Button>
        </div>
      ) : null}
    </div>
  );
}
