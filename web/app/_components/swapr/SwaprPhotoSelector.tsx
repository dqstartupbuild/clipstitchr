"use client";

import Link from "next/link";
import { PhotoAssetCard } from "@/app/_components/swapr/PhotoAssetCard";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { clipSelectorPageSize } from "@/lib/clipstitchr/constants/clipSelectorPageSize";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

type SwaprPhotoSelectorProps = {
  avatars: Avatar[];
  photos: PhotoAssetMetadata[];
  selectedPhotoId?: string;
  onSelect: (photo: PhotoAssetMetadata) => void;
};

export function SwaprPhotoSelector({
  avatars,
  photos,
  selectedPhotoId,
  onSelect,
}: SwaprPhotoSelectorProps) {
  const pagination = usePagination(photos, {
    pageSize: clipSelectorPageSize,
  });
  const avatarNamesById = new Map(
    avatars.map((avatar) => [avatar.id, avatar.name]),
  );

  return (
    <section className="min-w-0">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
          A
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Avatar photo</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Pick the face
          </h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Choose the avatar photo you want to use.
          </p>
        </div>
      </div>
      {photos.length ? (
        <>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {pagination.pageItems.map((photo) => (
              <div key={photo.id} className="w-36 shrink-0">
                <PhotoAssetCard
                  avatarName={
                    photo.avatarId ? avatarNamesById.get(photo.avatarId) : undefined
                  }
                  photo={photo}
                  isSelected={photo.id === selectedPhotoId}
                  onSelect={onSelect}
                  showDownload={false}
                  showUseInSwapr={false}
                />
              </div>
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
        <div className="mt-3 rounded-lg border border-border bg-surface-elevated p-4">
          <h3 className="text-sm font-bold text-text-primary">
            No avatar photos yet
          </h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Upload an avatar photo before creating a Swapr clip.
          </p>
          <Link
            href="/dashboard/avatars?upload=open#upload-panel"
            className="btn-secondary mt-4"
          >
            Upload Photos
          </Link>
        </div>
      )}
    </section>
  );
}
