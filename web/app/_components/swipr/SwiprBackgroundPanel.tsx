"use client";

import { useEffect } from "react";
import { Database, ImagePlus, Images, Upload } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import { SwiprBackgroundLibraryCard } from "@/app/_components/swipr/SwiprBackgroundLibraryCard";
import { ACCEPTED_PHOTO_TYPES } from "@/lib/clipstitchr/constants/acceptedPhotoTypes";
import { clipSelectorPageSize } from "@/lib/clipstitchr/constants/clipSelectorPageSize";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { SwiprBackground } from "@/lib/clipstitchr/types/SwiprBackground";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";

type SwiprBackgroundPanelProps = {
  background: SwiprBackground | null;
  backgrounds: SwiprBackgroundAsset[];
  backgroundSearchQuery: string;
  isSaving: boolean;
  isGeneratingAi: boolean;
  isAiDisabled: boolean;
  isSeedingDevBackgrounds?: boolean;
  onBackgroundSearchChange: (query: string) => void;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onSelectBackground: (background: SwiprBackgroundAsset) => void;
  onGenerateAiBackground: () => void;
  onSeedBackgroundLibrary?: () => void;
  onUploadBackground: (file: File) => void;
};

export function SwiprBackgroundPanel({
  background,
  backgrounds,
  backgroundSearchQuery,
  isSaving,
  isGeneratingAi,
  isAiDisabled,
  isSeedingDevBackgrounds = false,
  onBackgroundSearchChange,
  onLoadBackgroundBlob,
  onSelectBackground,
  onGenerateAiBackground,
  onSeedBackgroundLibrary,
  onUploadBackground,
}: SwiprBackgroundPanelProps) {
  const pagination = usePagination(backgrounds, {
    pageSize: clipSelectorPageSize,
  });
  const isBusy = isSaving || isGeneratingAi || isSeedingDevBackgrounds;

  useEffect(() => {
    let isCancelled = false;
    const preloadBackgrounds = [
      ...pagination.pageItems,
      ...backgrounds.slice(
        pagination.endIndex,
        pagination.endIndex + clipSelectorPageSize,
      ),
    ];

    void Promise.resolve().then(async () => {
      for (const backgroundAsset of preloadBackgrounds) {
        if (isCancelled || backgroundAsset.blob) {
          continue;
        }

        await onLoadBackgroundBlob(backgroundAsset.id).catch(() => undefined);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [
    backgrounds,
    onLoadBackgroundBlob,
    pagination.endIndex,
    pagination.pageItems,
  ]);

  return (
    <section className="min-w-0 border-t border-border pt-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <ImagePlus aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Background</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Single image
          </h2>
        </div>
      </div>
      <div className="grid min-w-0 gap-3">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <SearchInput
            label="Search backgrounds"
            value={backgroundSearchQuery}
            onChange={onBackgroundSearchChange}
            placeholder="Search backgrounds"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              icon={<Images aria-hidden className="h-4 w-4" />}
              isLoading={isGeneratingAi}
              disabled={isSaving || isSeedingDevBackgrounds || isAiDisabled}
              onClick={onGenerateAiBackground}
            >
              Generate
            </Button>
            {onSeedBackgroundLibrary ? (
              <Button
                type="button"
                size="sm"
                icon={<Database aria-hidden className="h-4 w-4" />}
                isLoading={isSeedingDevBackgrounds}
                disabled={isSaving || isGeneratingAi}
                onClick={onSeedBackgroundLibrary}
              >
                Seed 5
              </Button>
            ) : null}
            <label
              className={[
                "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-text-primary transition-colors hover:border-accent",
                isBusy ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              ].join(" ")}
            >
              <Upload aria-hidden className="h-4 w-4" />
              Upload
              <input
                type="file"
                accept={ACCEPTED_PHOTO_TYPES.join(",")}
                className="sr-only"
                disabled={isBusy}
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    onUploadBackground(file);
                  }

                  event.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
        <div className="min-w-0">
          {backgrounds.length ? (
            <>
              <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                {pagination.pageItems.map((backgroundAsset) => (
                  <SwiprBackgroundLibraryCard
                    key={backgroundAsset.id}
                    background={backgroundAsset}
                    isSelected={backgroundAsset.id === background?.id}
                    onSelect={onSelectBackground}
                  />
                ))}
              </div>
              {pagination.totalPages > 1 ? (
                <PaginationControls
                  canGoNext={pagination.canGoNext}
                  canGoPrevious={pagination.canGoPrevious}
                  currentPage={pagination.currentPage}
                  totalItems={pagination.totalItems}
                  totalPages={pagination.totalPages}
                  visibleEnd={pagination.visibleEnd}
                  visibleStart={pagination.visibleStart}
                  onNext={pagination.goToNextPage}
                  onPrevious={pagination.goToPreviousPage}
                />
              ) : null}
            </>
          ) : (
            <div className="rounded-lg border border-border bg-surface-elevated px-3 py-3 text-sm font-semibold text-text-secondary">
              No backgrounds yet
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
