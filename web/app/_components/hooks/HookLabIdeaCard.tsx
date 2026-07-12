"use client";

import {
  Archive,
  ExternalLink,
  Pencil,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { HookLabIdeaCapabilityChips } from "@/app/_components/hooks/HookLabIdeaCapabilityChips";
import { HookLabIdeaDeleteDialog } from "@/app/_components/hooks/HookLabIdeaDeleteDialog";
import { HookLabIdeaEditDialog } from "@/app/_components/hooks/HookLabIdeaEditDialog";
import { HookLabIdeaStatusBadge } from "@/app/_components/hooks/HookLabIdeaStatusBadge";
import { HookLabIdeaThumbnail } from "@/app/_components/hooks/HookLabIdeaThumbnail";
import { HookLabIdeaUseProgressPanel } from "@/app/_components/hooks/HookLabIdeaUseProgressPanel";
import { HookLabIdeaUseControls } from "@/app/_components/hooks/HookLabIdeaUseControls";
import { Button } from "@/app/_components/ui/Button";
import {
  MediaCardActionMenu,
  type MediaCardActionMenuItem,
} from "@/app/_components/ui/MediaCardActionMenu";
import type { HookLabIdea } from "@/lib/clipstitchr/types/HookLabIdea";
import type { HookLabIdeaUpdateInput } from "@/lib/clipstitchr/types/HookLabIdeaUpdateInput";
import type { HookLabIdeaVariationCount } from "@/lib/clipstitchr/types/HookLabIdeaVariationCount";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { getHookLabIdeaSourceLabel } from "@/lib/clipstitchr/utils/getHookLabIdeaSourceLabel";

type HookLabIdeaCardProps = {
  activeProductId?: string;
  currentUseId?: string;
  idea: HookLabIdea;
  isArchiving: boolean;
  isDeleting: boolean;
  isRetrying: boolean;
  isSaving: boolean;
  isUsing: boolean;
  onArchive: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onPasteInstead: () => void;
  onRetry: (id: string) => void;
  onUpdate: (id: string, input: HookLabIdeaUpdateInput) => Promise<void>;
  onUse: (idea: HookLabIdea, count: HookLabIdeaVariationCount) => void;
};

export function HookLabIdeaCard({
  activeProductId,
  currentUseId,
  idea,
  isArchiving,
  isDeleting,
  isRetrying,
  isSaving,
  isUsing,
  onArchive,
  onDelete,
  onPasteInstead,
  onRetry,
  onUpdate,
  onUse,
}: HookLabIdeaCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [variationCount, setVariationCount] =
    useState<HookLabIdeaVariationCount>(1);
  const isWrongProduct =
    idea.scope === "product" && idea.productId !== activeProductId;
  const canUse =
    idea.status === "ready" && Boolean(activeProductId) && !isWrongProduct;
  const sourceLabel = getHookLabIdeaSourceLabel(idea.sourceType);
  const sourceUrl = idea.attributionUrl ?? idea.canonicalUrl;
  const actionItems: MediaCardActionMenuItem[] = [
    {
      icon: <Pencil aria-hidden className="size-4" />,
      label: "Edit idea",
      onClick: () => setIsEditOpen(true),
    },
    ...(idea.sourceStitchId
      ? [
          {
            href: `/dashboard/stitchr?templateStitchId=${encodeURIComponent(idea.sourceStitchId)}`,
            icon: <RotateCcw aria-hidden className="size-4" />,
            label: "Use original setup",
          },
        ]
      : []),
    ...(idea.status === "failed" || idea.status === "needs_attention"
      ? [
          {
            disabled: isRetrying,
            icon: <RefreshCw aria-hidden className="size-4" />,
            label: "Try again",
            onClick: () => onRetry(idea.id),
          },
        ]
      : []),
    ...(idea.status !== "archived"
      ? [
          {
            disabled: isArchiving,
            icon: <Archive aria-hidden className="size-4" />,
            label: "Archive idea",
            onClick: () => onArchive(idea.id),
          },
        ]
      : []),
    {
      disabled: isDeleting,
      icon: <Trash2 aria-hidden className="size-4" />,
      label: "Delete idea",
      onClick: () => setIsDeleteOpen(true),
      variant: "danger",
    },
  ];

  return (
    <article className="flex min-w-0 flex-col rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <HookLabIdeaStatusBadge status={idea.status} />
            <span className="text-xs font-semibold text-text-tertiary">
              {sourceLabel}
            </span>
            <span className="rounded-md border border-border bg-white px-2 py-1 text-xs font-semibold text-text-secondary">
              {idea.scope === "shared" ? "All products" : "One product"}
            </span>
          </div>
          <h3 className="mt-3 line-clamp-2 text-balance text-lg font-bold text-text-primary">
            {idea.name}
          </h3>
        </div>
        <MediaCardActionMenu
          items={actionItems}
          label={`More actions for ${idea.name}`}
        />
      </div>

      <HookLabIdeaThumbnail
        ideaName={idea.name}
        originalText={idea.originalText}
        sourceLabel={sourceLabel}
        thumbnailObject={idea.thumbnailObject}
      />

      <div className="mt-4">
        <HookLabIdeaCapabilityChips
          hasCreativeBeat={idea.hasCreativeBeat}
          hasStitchRecipe={idea.hasStitchRecipe}
          hasTextPattern={idea.hasTextPattern}
        />
      </div>

      <div className="mt-4 flex-1 rounded-lg border border-border bg-white p-3">
        <p className="text-xs font-bold text-text-tertiary">
          What ClipStitchr will repeat
        </p>
        <p className="mt-1 text-pretty text-sm leading-6 text-text-secondary">
          {idea.whatToRepeat ||
            (idea.status === "analyzing"
              ? "ClipStitchr is finding the part worth trying again."
              : "Open the menu to add a quick note about what makes this idea useful.")}
        </p>
      </div>

      {idea.failureMessage ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-pretty text-sm font-semibold text-red-700">
            {idea.failureMessage}
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-3"
            icon={<RefreshCw aria-hidden className="size-4" />}
            isLoading={isRetrying}
            onClick={() => onRetry(idea.id)}
          >
            Try again
          </Button>
          {idea.sourceType === "social_link" ? (
            <Button
              type="button"
              size="sm"
              variant="subtle"
              className="mt-3 ml-2"
              onClick={onPasteInstead}
            >
              Paste the text instead
            </Button>
          ) : null}
        </div>
      ) : null}

      {isWrongProduct ? (
        <p className="mt-3 text-pretty text-xs font-semibold text-amber-700">
          Switch to this idea’s product before using it.
        </p>
      ) : null}

      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-3 flex flex-wrap justify-between gap-2 text-xs font-semibold text-text-tertiary tabular-nums">
          <span>{idea.useCount} {idea.useCount === 1 ? "use" : "uses"}</span>
          <span>
            {idea.lastUsedAt ? `Last used ${formatDate(idea.lastUsedAt)}` : "Not used yet"}
          </span>
        </div>
        <HookLabIdeaUseControls
          disabled={!canUse}
          isUsing={isUsing}
          variationCount={variationCount}
          onUse={() => onUse(idea, variationCount)}
          onVariationCountChange={setVariationCount}
        />
        {currentUseId ? (
          <HookLabIdeaUseProgressPanel useId={currentUseId} />
        ) : null}
      </div>

      {sourceUrl ? (
        <a
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-dark hover:underline"
          href={sourceUrl}
          rel="noreferrer"
          target="_blank"
        >
          {idea.attributionName || "View the source"}
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      ) : null}

      {isEditOpen ? (
        <HookLabIdeaEditDialog
          activeProductId={activeProductId}
          idea={idea}
          isSaving={isSaving}
          onClose={() => setIsEditOpen(false)}
          onSave={(input) => onUpdate(idea.id, input)}
        />
      ) : null}
      {isDeleteOpen ? (
        <HookLabIdeaDeleteDialog
          ideaName={idea.name}
          isDeleting={isDeleting}
          isWorking={idea.status === "analyzing" || idea.status === "generating"}
          onClose={() => setIsDeleteOpen(false)}
          onDelete={() => onDelete(idea.id)}
        />
      ) : null}
    </article>
  );
}
