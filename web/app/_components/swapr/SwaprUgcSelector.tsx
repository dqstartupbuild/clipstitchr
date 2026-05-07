"use client";

import Link from "next/link";
import { SwaprUgcClipCard } from "@/app/_components/swapr/SwaprUgcClipCard";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { Panel } from "@/app/_components/ui/Panel";
import { clipSelectorPageSize } from "@/lib/clipr/constants/clipSelectorPageSize";
import { usePagination } from "@/lib/clipr/hooks/usePagination";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";

type SwaprUgcSelectorProps = {
  clips: VideoClip[];
  selectedClipId?: string;
  onSelect: (clip: VideoClip) => void;
};

export function SwaprUgcSelector({
  clips,
  selectedClipId,
  onSelect,
}: SwaprUgcSelectorProps) {
  const pagination = usePagination(clips, {
    pageSize: clipSelectorPageSize,
  });

  return (
    <Panel className="p-5">
      <div>
        <p className="text-sm font-semibold text-accent-dark">Source video</p>
        <h2 className="mt-2 text-xl font-bold text-text-primary">
          Choose UGC motion
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Swapr only uses UGC clips as motion references. Demo videos stay out
          of this flow.
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
            Upload a video and classify it as UGC before using Swapr.
          </p>
          <Link
            href="/dashboard/uploads#upload-panel"
            className="btn-secondary mt-4"
          >
            Upload UGC
          </Link>
        </div>
      )}
    </Panel>
  );
}
