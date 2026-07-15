"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { VideoClipCard } from "@/app/_components/dashboard/VideoClipCard";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { ClipPerformanceScore } from "@/lib/clipstitchr/types/ClipPerformanceScore";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { QuickEditCrop } from "@/lib/clipstitchr/types/QuickEditCrop";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

type RecentUploadsSectionProps = {
  clips: VideoClipMetadata[];
  products?: ProductProfile[];
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onDelete: (id: string) => void | Promise<void>;
  onUpdateMetadata: (
    clip: VideoClipMetadata,
    metadata: AssetMetadataUpdate,
  ) => void | Promise<void>;
  onUpdateTrim: (
    clip: VideoClipMetadata,
    trimRange: VideoTrimRange,
  ) => void | Promise<void>;
  onUpdateCrop?: (
    clip: VideoClipMetadata,
    crop: QuickEditCrop | null,
  ) => void | Promise<void>;
  onUpdateCuts?: (
    clip: VideoClipMetadata,
    removeRanges: QuickEditRemoveRange[],
  ) => void | Promise<void>;
  onScoreClip?: (clip: VideoClipMetadata) => Promise<ClipPerformanceScore>;
  onApplyQuickEdit?: (clip: VideoClipMetadata) => Promise<void>;
  onResetQuickEdit?: (clip: VideoClipMetadata) => Promise<void>;
  onUpdatePostedStatus?: (
    clip: VideoClipMetadata,
    isPosted: boolean,
  ) => void | Promise<void>;
};

export function RecentUploadsSection({
  clips,
  products = [],
  onLoadClip,
  onLoadPoster,
  onDelete,
  onUpdateMetadata,
  onUpdateCrop,
  onUpdateCuts,
  onUpdateTrim,
  onScoreClip,
  onApplyQuickEdit,
  onResetQuickEdit,
  onUpdatePostedStatus,
}: RecentUploadsSectionProps) {
  return (
    <section id="recent-uploads" className="dashboard-content-section">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-text-primary">Fresh footage</h2>
        <SecondaryButtonLink
          href="/dashboard/library"
          className="h-9 px-3 text-xs"
        >
          See library
        </SecondaryButtonLink>
      </div>
      {clips.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {clips.map((clip) => (
            <VideoClipCard
              key={clip.id}
              clip={clip}
              products={products}
              onLoadClip={onLoadClip}
              onLoadPoster={onLoadPoster}
              onDelete={onDelete}
              onScore={onScoreClip}
              onApplyQuickEdit={onApplyQuickEdit}
              onResetQuickEdit={onResetQuickEdit}
              onUpdateCrop={onUpdateCrop}
              onUpdateCuts={onUpdateCuts}
              onUpdateMetadata={onUpdateMetadata}
              onUpdateTrim={onUpdateTrim}
              onUpdatePostedStatus={onUpdatePostedStatus}
            />
          ))}
        </div>
      ) : (
        <DashboardEmptyState
          title="No clips here yet"
          description="Upload the Hook/UGC clips or product demos you already have."
        />
      )}
    </section>
  );
}
