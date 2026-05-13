"use client";

import { X } from "lucide-react";
import { LongVideoPreview } from "@/app/_components/dashboard/LongVideoPreview";
import { Badge } from "@/app/_components/ui/Badge";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type LongrVideoDetailsDialogProps = {
  longrVideo: LongrVideo;
  posterUrl: string | null;
  videoUrl: string | null;
  onClose: () => void;
};

export function LongrVideoDetailsDialog({
  longrVideo,
  posterUrl,
  videoUrl,
  onClose,
}: LongrVideoDetailsDialogProps) {
  const clipSegments = [...longrVideo.clipSegments].sort(
    (firstSegment, secondSegment) => firstSegment.order - secondSegment.order,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="longr-video-details-dialog-title"
        className="max-h-full w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              Long details
            </p>
            <h2
              id="longr-video-details-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {longrVideo.name}
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close Long details"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="grid gap-5 p-5 md:grid-cols-[280px_minmax(0,1fr)]">
          <LongVideoPreview
            duration={longrVideo.duration}
            label={longrVideo.name}
            posterSrc={posterUrl}
            src={videoUrl}
          />
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>LONG</Badge>
              <span className="text-xs font-semibold text-text-tertiary">
                {formatDuration(longrVideo.duration)}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                Title
              </p>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {longrVideo.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                Sequence
              </p>
              <div className="mt-2 space-y-2">
                {clipSegments.map((segment, index) => (
                  <div
                    key={`${segment.clipId}:${segment.order}`}
                    className="rounded-md border border-border px-3 py-2"
                  >
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {index + 1}. {segment.clipName}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-text-tertiary">
                      {segment.clipType.toUpperCase()} .{" "}
                      {formatDuration(segment.duration)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                File
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {longrVideo.width} x {longrVideo.height} .{" "}
                {formatDuration(longrVideo.duration)} total .{" "}
                {formatBytes(longrVideo.size)}
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                Created {formatDate(longrVideo.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
