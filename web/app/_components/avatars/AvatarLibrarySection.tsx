"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { PhotoAssetCard } from "@/app/_components/swapr/PhotoAssetCard";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { uploadLibraryPageSize } from "@/lib/clipstitchr/constants/uploadLibraryPageSize";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

type AvatarLibrarySectionProps = {
  emptyDescription: string;
  emptyTitle?: string;
  avatars: Avatar[];
  photos: PhotoAssetMetadata[];
  selectedPhotoId?: string;
  onDelete: (id: string) => void | Promise<void>;
  onLoadPhoto: (id: string) => Promise<PhotoAsset | null>;
  onSelect: (photo: PhotoAssetMetadata) => void;
  onUpdateMetadata: (
    photo: PhotoAssetMetadata,
    metadata: AssetMetadataUpdate,
  ) => void | Promise<void>;
};

export function AvatarLibrarySection({
  emptyDescription,
  emptyTitle = "No avatars yet",
  avatars,
  photos,
  selectedPhotoId,
  onDelete,
  onLoadPhoto,
  onSelect,
  onUpdateMetadata,
}: AvatarLibrarySectionProps) {
  const pagination = usePagination(photos, {
    pageSize: uploadLibraryPageSize,
  });
  const avatarNamesById = new Map(
    avatars.map((avatar) => [avatar.id, avatar.name]),
  );

  return (
    <section id="avatars">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">Avatars</h2>
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
                avatarName={
                  photo.avatarId ? avatarNamesById.get(photo.avatarId) : undefined
                }
                photo={photo}
                isSelected={photo.id === selectedPhotoId}
                onDelete={onDelete}
                onLoadPhoto={onLoadPhoto}
                onSelect={onSelect}
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
