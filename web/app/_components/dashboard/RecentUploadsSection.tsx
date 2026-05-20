"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { VideoClipCard } from "@/app/_components/dashboard/VideoClipCard";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
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
};

export function RecentUploadsSection({
  clips,
  products = [],
  onLoadClip,
  onLoadPoster,
  onDelete,
  onUpdateMetadata,
  onUpdateTrim,
}: RecentUploadsSectionProps) {
  return (
    <section id="recent-uploads">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-text-primary">
          Recent Uploads
        </h2>
        <SecondaryButtonLink
          href="/dashboard/uploads"
          className="h-9 px-3 text-xs"
        >
          See all
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
              onUpdateMetadata={onUpdateMetadata}
              onUpdateTrim={onUpdateTrim}
            />
          ))}
        </div>
      ) : (
        <DashboardEmptyState
          title="No uploads yet"
          description="Upload UGC or product demos to start building your ad library."
        />
      )}
    </section>
  );
}
