"use client";

import Link from "next/link";
import { SwaprUgcClipCard } from "@/app/_components/swapr/SwaprUgcClipCard";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { Panel } from "@/app/_components/ui/Panel";
import { clipSelectorPageSize } from "@/lib/clipstitchr/constants/clipSelectorPageSize";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type SwaprUgcSelectorProps = {
  clips: VideoClipMetadata[];
  selectedClipId?: string;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onSelect: (clip: VideoClipMetadata) => void;
};

export function SwaprUgcSelector({
  clips,
  selectedClipId,
  onLoadClip,
  onSelect,
}: SwaprUgcSelectorProps) {
  const pagination = usePagination(clips, {
    pageSize: clipSelectorPageSize,
  });

  return (
    <Panel className="p-5">
      <div>
        <p className="text-sm font-semibold text-accent-dark">Source clip</p>
        <h2 className="mt-2 text-xl font-bold text-text-primary">
          Choose UGC motion
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Pick the UGC clip with the movement or reaction you want to reuse.
        </p>
      </div>

      {clips.length ? (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pagination.pageItems.map((clip) => (
              <SwaprUgcClipCard
                key={clip.id}
                clip={clip}
                isSelected={clip.id === selectedClipId}
                onLoadClip={onLoadClip}
                onSelect={onSelect}
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
            No UGC clips yet
          </h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Upload a UGC clip before using Swapr.
          </p>
          <Link
            href="/dashboard/uploads?tab=ugc&upload=open#upload-panel"
            className="btn-secondary mt-4"
          >
            Upload UGC
          </Link>
        </div>
      )}
    </Panel>
  );
}
