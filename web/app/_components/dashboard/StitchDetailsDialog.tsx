"use client";

import { X } from "lucide-react";
import { MediaActionButtonList } from "@/app/_components/dashboard/MediaActionButtonList";
import { Badge } from "@/app/_components/ui/Badge";
import { IconButton } from "@/app/_components/ui/IconButton";
import { StitchSocialCaptionCopyButton } from "@/app/_components/stitches/StitchSocialCaptionCopyButton";
import type { MediaCardActionMenuItem } from "@/app/_components/ui/MediaCardActionMenu";
import { StitchSequencePreview } from "@/app/_components/dashboard/StitchSequencePreview";
import { StitchScoreDetails } from "@/app/_components/dashboard/StitchScoreDetails";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getStitchTrimRangeLabel } from "@/lib/clipstitchr/utils/getStitchTrimRangeLabel";

type StitchDetailsDialogProps = {
  actionItems?: MediaCardActionMenuItem[];
  demoClip: VideoClip | null;
  isLoadingPreview: boolean;
  posterUrl: string | null;
  previewError: string | null;
  stitch: Stitch;
  stitchVideoBlob?: Blob | null;
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
  stitchVideoBlob = null,
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
  const socialCaption = stitch.socialCaption?.trim();
  const fileSizeLabel = stitch.size
    ? formatBytes(stitch.size)
    : "Ready to download";
  const detailItems = [
    { label: "Hook/UGC clip", value: stitch.ugcClipName },
    { label: "Demo clip", value: stitch.demoClipName },
    { label: "Hook/UGC trim", value: getStitchTrimRangeLabel(stitch.ugcTrimRange) },
    { label: "Demo trim", value: getStitchTrimRangeLabel(stitch.demoTrimRange) },
    {
      label: "Hook/UGC audio",
      value: stitch.includeUgcAudio === false ? "Muted" : "Included",
    },
    {
      label: "Demo audio",
      value: stitch.includeDemoAudio === false ? "Muted" : "Included",
    },
    { label: "Hook/UGC speed", value: `${stitch.ugcPlaybackRate ?? 1}x` },
    { label: "Demo speed", value: `${stitch.demoPlaybackRate ?? 1}x` },
    { label: "Music", value: musicLabel },
    { label: "Text overlay", value: textOverlayText },
    {
      isCopyable: true,
      label: "Caption and hashtags",
      value: socialCaption,
    },
  ].flatMap((item) =>
    item.value?.trim()
      ? [
          {
            isCopyable: item.isCopyable === true,
            label: item.label,
            value: item.value.trim(),
          },
        ]
      : [],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 px-2 py-3 sm:items-center sm:px-4 sm:py-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stitch-details-dialog-title"
        className="max-h-full w-full max-w-[calc(100vw-1rem)] min-w-0 overflow-x-hidden overflow-y-auto rounded-lg bg-white shadow-xl sm:max-w-4xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex min-w-0 items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
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
        <div className="grid min-w-0 max-w-full gap-4 p-4 sm:gap-5 sm:p-5 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <div className="grid min-w-0 gap-3">
            <StitchSequencePreview
              demoClip={demoClip}
              isLoading={isLoadingPreview}
              posterUrl={posterUrl}
              stitch={stitch}
              stitchVideoBlob={stitchVideoBlob}
              ugcClip={ugcClip}
              onLoadPreview={onLoadPreview}
            />
            {previewError ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {previewError}
              </p>
            ) : null}
          </div>
          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{stitch.isPosted ? "POSTED" : "STITCH"}</Badge>
              <span className="text-xs font-semibold text-text-tertiary">
                {formatDuration(stitch.duration)}
              </span>
            </div>
            <StitchScoreDetails score={stitch.stitchScore} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                Title
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-text-primary [overflow-wrap:anywhere]">
                {stitch.name}
              </p>
            </div>
            {detailItems.map((item) => (
              <div key={item.label} className="min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                    {item.label}
                  </p>
                  {item.isCopyable ? (
                    <StitchSocialCaptionCopyButton
                      socialCaption={item.value}
                      variant="icon"
                    />
                  ) : null}
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-text-secondary [overflow-wrap:anywhere]">
                  {item.value}
                </p>
              </div>
            ))}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                File
              </p>
              <p className="mt-1 break-words text-sm text-text-secondary [overflow-wrap:anywhere]">
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
