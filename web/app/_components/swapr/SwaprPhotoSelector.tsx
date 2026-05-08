"use client";

import Link from "next/link";
import { PhotoAssetCard } from "@/app/_components/swapr/PhotoAssetCard";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { Panel } from "@/app/_components/ui/Panel";
import { clipSelectorPageSize } from "@/lib/clipstitchr/constants/clipSelectorPageSize";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

type SwaprPhotoSelectorProps = {
  photos: PhotoAssetMetadata[];
  selectedPhotoId?: string;
  onSelect: (photo: PhotoAssetMetadata) => void;
};

export function SwaprPhotoSelector({
  photos,
  selectedPhotoId,
  onSelect,
}: SwaprPhotoSelectorProps) {
  const pagination = usePagination(photos, {
    pageSize: clipSelectorPageSize,
  });

  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Your photo</p>
          <h2 className="mt-2 text-xl font-bold text-text-primary">
            Pick the person
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Select a saved photo from the uploads library. Photos are uploaded
            and managed from the Photos tab.
          </p>
        </div>
      </div>

      {photos.length ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pagination.pageItems.map((photo) => (
              <PhotoAssetCard
                key={photo.id}
                photo={photo}
                isSelected={photo.id === selectedPhotoId}
                onSelect={onSelect}
                showDownload={false}
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
        <div className="mt-5 rounded-lg border border-border bg-surface-elevated p-5">
          <h3 className="text-sm font-bold text-text-primary">
            No photos yet
          </h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Upload a person photo from the Photos tab before using Swapr.
          </p>
          <Link
            href="/dashboard/uploads?tab=photos#upload-panel"
            className="btn-secondary mt-4"
          >
            Upload Photos
          </Link>
        </div>
      )}
    </Panel>
  );
}
