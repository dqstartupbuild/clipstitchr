"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { SwiprSwipeCard } from "@/app/_components/dashboard/SwiprSwipeCard";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { uploadLibraryPageSize } from "@/lib/clipstitchr/constants/uploadLibraryPageSize";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SaveSwiprSwipeInput } from "@/lib/clipstitchr/types/SwiprLibraryValue";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

type SwiprSwipesSectionProps = {
  backgrounds: SwiprBackgroundAsset[];
  emptyDescription?: string;
  emptyTitle?: string;
  id?: string;
  isSaving?: boolean;
  swipes: SwiprSwipe[];
  title?: string;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onDelete: (id: string) => void | Promise<void>;
  onSave: (input: SaveSwiprSwipeInput) => Promise<SwiprSwipe>;
};

export function SwiprSwipesSection({
  backgrounds,
  emptyDescription = "Save a carousel from Swipr to reuse and download it later.",
  emptyTitle = "No Swipes yet",
  id = "swipes",
  isSaving = false,
  swipes,
  title = "Swipes",
  onLoadBackgroundBlob,
  onLoadPoster,
  onDelete,
  onSave,
}: SwiprSwipesSectionProps) {
  const backgroundsById = new Map(
    backgrounds.map((background) => [background.id, background]),
  );
  const visibleSwipes = swipes.filter((swipe) =>
    backgroundsById.has(swipe.backgroundId),
  );
  const pagination = usePagination(visibleSwipes, {
    pageSize: uploadLibraryPageSize,
  });

  return (
    <section id={id}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        <span className="text-sm font-semibold text-text-tertiary">
          {visibleSwipes.length}
        </span>
      </div>
      {visibleSwipes.length ? (
        <>
          <div className="grid justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {pagination.pageItems.map((swipe) => {
              const background = backgroundsById.get(swipe.backgroundId);

              if (!background) {
                return null;
              }

              return (
                <SwiprSwipeCard
                  key={swipe.id}
                  background={background}
                  backgrounds={backgrounds}
                  isSaving={isSaving}
                  swipe={swipe}
                  onLoadBackgroundBlob={onLoadBackgroundBlob}
                  onLoadPoster={onLoadPoster}
                  onDelete={onDelete}
                  onSave={onSave}
                />
              );
            })}
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
        <DashboardEmptyState
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </section>
  );
}
