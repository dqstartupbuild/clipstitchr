"use client";

import { BookmarkPlus, RotateCcw, ThumbsDown, Wand2 } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { HookLabReviewStateBadge } from "@/app/_components/hooks/HookLabReviewStateBadge";
import type { HookLabReviewOption } from "@/lib/clipstitchr/types/HookLabReviewOption";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { getStitchrHookPlanSourceLabel } from "@/lib/clipstitchr/utils/getStitchrHookPlanSourceLabel";

type HookLabReviewCardProps = {
  isSaving: boolean;
  option: HookLabReviewOption;
  onMarkNotForMe: (id: string) => void;
  onSaveIdea: (id: string, productId?: string) => void;
  onUndo: (id: string) => void;
  onUse: (id: string) => void;
};

export function HookLabReviewCard({
  isSaving,
  option,
  onMarkNotForMe,
  onSaveIdea,
  onUndo,
  onUse,
}: HookLabReviewCardProps) {
  return (
    <article className="flex min-w-0 flex-col rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <HookLabReviewStateBadge state={option.reviewState} />
        <span className="text-xs font-semibold text-text-tertiary tabular-nums">
          {formatDate(option.planCreatedAt)}
        </span>
      </div>
      <h3 className="mt-4 text-pretty text-xl font-bold leading-snug text-text-primary">
        {option.hook}
      </h3>
      {option.angle ? (
        <p className="mt-2 text-sm font-semibold text-accent-dark">
          {option.angle}
        </p>
      ) : null}
      {option.reason ? (
        <p className="mt-2 flex-1 text-pretty text-sm leading-6 text-text-secondary">
          {option.reason}
        </p>
      ) : (
        <div className="flex-1" />
      )}
      <div className="mt-4 rounded-lg border border-border bg-surface-muted p-3 text-xs font-semibold text-text-secondary">
        <p>{option.productName || "No product attached"}</p>
        <p className="mt-1 text-text-tertiary">
          {getStitchrHookPlanSourceLabel(option.planSource)}
          {option.stitchId ? " · Linked to a saved Stitch" : ""}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={<Wand2 aria-hidden className="size-4" />}
          disabled={!option.stitchId || option.isSelected}
          isLoading={isSaving}
          onClick={() => onUse(option.id)}
        >
          {option.isSelected ? "In use" : "Use"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={<BookmarkPlus aria-hidden className="size-4" />}
          disabled={Boolean(option.linkedIdeaId)}
          isLoading={isSaving}
          onClick={() => onSaveIdea(option.id, option.productId)}
        >
          {option.linkedIdeaId ? "Idea saved" : "Save idea"}
        </Button>
        {option.reviewState === "needs_review" ? (
          <Button
            type="button"
            size="sm"
            variant="danger"
            icon={<ThumbsDown aria-hidden className="size-4" />}
            isLoading={isSaving}
            onClick={() => onMarkNotForMe(option.id)}
          >
            Not for me
          </Button>
        ) : option.reviewState === "not_for_me" ? (
          <Button
            type="button"
            size="sm"
            variant="subtle"
            icon={<RotateCcw aria-hidden className="size-4" />}
            isLoading={isSaving}
            onClick={() => onUndo(option.id)}
          >
            Undo
          </Button>
        ) : null}
      </div>
    </article>
  );
}
