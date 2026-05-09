"use client";

import { X } from "lucide-react";
import { AssetTagList } from "@/app/_components/uploads/AssetTagList";
import { IconButton } from "@/app/_components/ui/IconButton";
import { VideoPreview } from "@/app/_components/ui/VideoPreview";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getVideoClipBadgeLabel } from "@/lib/clipstitchr/utils/getVideoClipBadgeLabel";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type VideoClipDetailsDialogProps = {
  clip: VideoClipMetadata;
  isLoading: boolean;
  posterUrl: string | null;
  videoUrl: string | null;
  onClose: () => void;
  onLoadPreview: () => void;
};

export function VideoClipDetailsDialog({
  clip,
  isLoading,
  posterUrl,
  videoUrl,
  onClose,
  onLoadPreview,
}: VideoClipDetailsDialogProps) {
  const defaultTrimRange = getDefaultVideoTrimRange(clip);
  const selectedDuration = getVideoTrimRangeDuration(defaultTrimRange);
  const detailItems = [
    { label: "Description", value: clip.videoDescription },
    { label: "Product", value: clip.productDescription },
    { label: "Main person", value: clip.mainPersonDescription },
    { label: "Action", value: clip.poseDescription },
    { label: "Outfit", value: clip.outfitDescription },
    { label: "Location", value: clip.locationDescription },
  ].flatMap((item) =>
    item.value?.trim()
      ? [
          {
            label: item.label,
            value: item.value.trim(),
          },
        ]
      : [],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-details-dialog-title"
        className="max-h-full w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              Clip details
            </p>
            <h2
              id="video-details-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {clip.name}
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close clip details"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="grid gap-5 p-5 md:grid-cols-[280px_minmax(0,1fr)]">
          <VideoPreview
            src={videoUrl}
            posterSrc={posterUrl}
            label={clip.name}
            autoPlay
            isLoading={isLoading}
            onLoadPreview={onLoadPreview}
          />
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-semibold text-accent-dark">
                {getVideoClipBadgeLabel(clip)}
              </span>
              <span className="text-xs font-semibold text-text-tertiary">
                {clip.hasAudio ? "Audio" : "No audio"}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                Title
              </p>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {clip.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                Tags
              </p>
              <AssetTagList
                tags={clip.tags}
                className="mt-2"
                maxVisible={12}
                requiredTag={clip.clipType}
              />
            </div>
            {detailItems.map((item) => (
              <div key={item.label}>
                <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                  {item.label}
                </p>
                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  {item.value}
                </p>
              </div>
            ))}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                File
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {clip.width} x {clip.height} .{" "}
                {formatDuration(selectedDuration)} selected .{" "}
                {formatDuration(clip.duration)} total . {formatBytes(clip.size)}
              </p>
              <p className="mt-1 truncate text-xs text-text-tertiary">
                {clip.originalName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
