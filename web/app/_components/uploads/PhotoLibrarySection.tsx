"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { PhotoAssetCard } from "@/app/_components/swapr/PhotoAssetCard";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { uploadLibraryPageSize } from "@/lib/clipstitchr/constants/uploadLibraryPageSize";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

type PhotoLibrarySectionProps = {
  id: string;
  photos: PhotoAssetMetadata[];
  emptyDescription: string;
  emptyTitle?: string;
  onLoadPhoto: (id: string) => Promise<PhotoAsset | null>;
  onDelete: (id: string) => void | Promise<void>;
  onUpdateMetadata: (
    photo: PhotoAssetMetadata,
    metadata: AssetMetadataUpdate,
  ) => void | Promise<void>;
};

export function PhotoLibrarySection({
  id,
  photos,
  emptyDescription,
  emptyTitle = "No photos yet",
  onLoadPhoto,
  onDelete,
  onUpdateMetadata,
}: PhotoLibrarySectionProps) {
  const pagination = usePagination(photos, {
    pageSize: uploadLibraryPageSize,
  });

  return (
    <section id={id}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-text-primary">Photos</h2>
        </div>
        <span className="text-sm font-semibold text-text-tertiary">
          {photos.length}
        </span>
      </div>
      {photos.length ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {pagination.pageItems.map((photo) => (
              <PhotoAssetCard
                key={photo.id}
                photo={photo}
                onLoadPhoto={onLoadPhoto}
                onDelete={onDelete}
                onUpdateMetadata={onUpdateMetadata}
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
        <DashboardEmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </section>
  );
}
