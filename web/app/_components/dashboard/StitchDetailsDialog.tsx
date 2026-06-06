"use client";

import { X } from "lucide-react";
import { MediaActionButtonList } from "@/app/_components/dashboard/MediaActionButtonList";
import { Badge } from "@/app/_components/ui/Badge";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { MediaCardActionMenuItem } from "@/app/_components/ui/MediaCardActionMenu";
import { StitchSequencePreview } from "@/app/_components/dashboard/StitchSequencePreview";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getVideoCropBoundsLabel } from "@/lib/clipstitchr/utils/getVideoCropBoundsLabel";
import { getStitchTrimRangeLabel } from "@/lib/clipstitchr/utils/getStitchTrimRangeLabel";

type StitchDetailsDialogProps = {
  actionItems?: MediaCardActionMenuItem[];
  demoClip: VideoClip | null;
  isLoadingPreview: boolean;
  posterUrl: string | null;
  previewError: string | null;
  stitch: Stitch;
  ugcClip: VideoClip | null;
  onClose: () => void;
  onLoadPreview: () => void;
};

export function StitchDetailsDialog({
  actionItems = [],
  demoClip,
  isLoadingPreview,
  posterUrl,
  previewError,
  stitch,
  ugcClip,
  onClose,
  onLoadPreview,
}: StitchDetailsDialogProps) {
  const musicLabel = stitch.music
    ? stitch.music.enabled
      ? `Enabled at ${Math.round(stitch.music.volume * 100)}%`
      : "Attached but disabled"
    : undefined;
  const textOverlayText = stitch.textOverlay?.text.trim();
  const fileSizeLabel = stitch.size
    ? formatBytes(stitch.size)
    : "Ready to download";
  const detailItems = [
    { label: "UGC clip", value: stitch.ugcClipName },
    { label: "Demo clip", value: stitch.demoClipName },
    { label: "UGC trim", value: getStitchTrimRangeLabel(stitch.ugcTrimRange) },
    { label: "Demo trim", value: getStitchTrimRangeLabel(stitch.demoTrimRange) },
    { label: "UGC crop", value: getVideoCropBoundsLabel(stitch.ugcCropBounds) },
    { label: "Demo crop", value: getVideoCropBoundsLabel(stitch.demoCropBounds) },
    {
      label: "UGC audio",
      value: stitch.includeUgcAudio === false ? "Muted" : "Included",
    },
    {
      label: "Demo audio",
      value: stitch.includeDemoAudio === false ? "Muted" : "Included",
    },
    { label: "UGC speed", value: `${stitch.ugcPlaybackRate ?? 1}x` },
    { label: "Demo speed", value: `${stitch.demoPlaybackRate ?? 1}x` },
    { label: "Music", value: musicLabel },
    { label: "Text overlay", value: textOverlayText },
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
        aria-labelledby="stitch-details-dialog-title"
        className="max-h-full w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              Stitch details
            </p>
            <h2
              id="stitch-details-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {stitch.name}
            </h2>
            <MediaActionButtonList items={actionItems} className="mt-3" />
          </div>
          <IconButton
            type="button"
            label="Close stitch details"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="grid gap-5 p-5 md:grid-cols-[280px_minmax(0,1fr)]">
          <div className="grid gap-3">
            <StitchSequencePreview
              demoClip={demoClip}
              isLoading={isLoadingPreview}
              posterUrl={posterUrl}
              stitch={stitch}
              ugcClip={ugcClip}
              onLoadPreview={onLoadPreview}
            />
            {previewError ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {previewError}
              </p>
            ) : null}
            </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{stitch.isPosted ? "POSTED" : "STITCH"}</Badge>
              <span className="text-xs font-semibold text-text-tertiary">
                {formatDuration(stitch.duration)}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                Title
              </p>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {stitch.name}
              </p>
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
                {stitch.width} x {stitch.height} .{" "}
                {formatDuration(stitch.duration)} total . {fileSizeLabel}
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                Created {formatDate(stitch.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
