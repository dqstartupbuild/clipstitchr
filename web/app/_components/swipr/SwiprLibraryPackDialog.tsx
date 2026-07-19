"use client";

import { Minus, X } from "lucide-react";
import { SwiprLibraryPackPhotoList } from "@/app/_components/swipr/SwiprLibraryPackPhotoList";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { swiprLibraryPackPageSize } from "@/lib/clipstitchr/constants/swiprLibraryPackPageSize";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import { getSwiprLibraryBackgroundsByPackName } from "@/lib/clipstitchr/utils/getSwiprLibraryBackgroundsByPackName";

type SwiprLibraryPackDialogProps = {
  backgrounds: SwiprBackgroundAsset[];
  isLoading?: boolean;
  isMine: boolean;
  isSaving: boolean;
  pack: SwiprLibraryPack;
  onDismiss: () => void;
  onLoadBackgroundBlob: (
    id: string,
    imageObject?: R2ObjectReference,
  ) => Promise<Blob>;
  onRemovePack: (packName: string) => Promise<void>;
  onRemovePhoto: (background: SwiprBackgroundAsset) => Promise<void>;
};

export function SwiprLibraryPackDialog({
  backgrounds,
  isLoading = false,
  isMine,
  isSaving,
  pack,
  onDismiss,
  onLoadBackgroundBlob,
  onRemovePack,
  onRemovePhoto,
}: SwiprLibraryPackDialogProps) {
  const packBackgrounds = getSwiprLibraryBackgroundsByPackName(
    backgrounds,
    pack.name,
  );
  const pagination = usePagination(packBackgrounds, {
    pageSize: swiprLibraryPackPageSize,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 px-3 py-4 [padding-bottom:max(1rem,env(safe-area-inset-bottom))] [padding-top:max(1rem,env(safe-area-inset-top))] sm:items-center sm:px-4"
      onClick={onDismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="swipr-library-pack-dialog-title"
        className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              Pack photos
            </p>
            <h2
              id="swipr-library-pack-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary text-balance"
            >
              {pack.name}
            </h2>
            <p className="mt-1 text-sm font-semibold text-text-tertiary tabular-nums">
              {isLoading
                ? "Loading photos."
                : `${packBackgrounds.length} photos`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isMine ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                icon={<Minus aria-hidden className="h-4 w-4" />}
                isLoading={isSaving}
                onClick={() => {
                  void onRemovePack(pack.name).catch(() => undefined);
                }}
              >
                Remove pack
              </Button>
            ) : null}
            <IconButton
              type="button"
              label="Close pack photos"
              icon={<X aria-hidden className="h-4 w-4" />}
              onClick={onDismiss}
            />
          </div>
        </div>
        <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
          {isLoading ? (
            <p className="rounded-lg border border-border bg-surface-muted px-3 py-4 text-sm font-semibold text-text-secondary text-pretty">
              Loading this pack.
            </p>
          ) : packBackgrounds.length ? (
            <>
              <SwiprLibraryPackPhotoList
                backgrounds={pagination.pageItems}
                canRemove={isMine}
                isSaving={isSaving}
                onLoadBackgroundBlob={onLoadBackgroundBlob}
                onRemovePhoto={(background) => {
                  void onRemovePhoto(background).catch(() => undefined);
                }}
              />
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
            <p className="rounded-lg border border-border bg-surface-muted px-3 py-4 text-sm font-semibold text-text-secondary text-pretty">
              This pack is empty.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
