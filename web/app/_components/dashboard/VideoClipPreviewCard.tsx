"use client";

import { Play } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { VideoClipDetailsDialog } from "@/app/_components/dashboard/VideoClipDetailsDialog";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getVideoClipBadgeLabel } from "@/lib/clipstitchr/utils/getVideoClipBadgeLabel";

type VideoClipPreviewCardActions = {
  isLoading: boolean;
  loadFullClip: () => Promise<VideoClip | null>;
};

type VideoClipPreviewCardProps = {
  clip: VideoClipMetadata;
  isSelected?: boolean;
  actions?: (actions: VideoClipPreviewCardActions) => ReactNode;
  footer?: (actions: VideoClipPreviewCardActions) => ReactNode;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
};

export function VideoClipPreviewCard({
  clip,
  isSelected = false,
  actions,
  footer,
  onLoadClip,
}: VideoClipPreviewCardProps) {
  const [loadedClip, setLoadedClip] = useState<VideoClip | null>(null);
  const [isClipLoading, setIsClipLoading] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const videoUrl = useObjectUrl(loadedClip?.blob);
  const posterUrl = useObjectUrl(clip.posterBlob);
  const loadFullClip = async () => {
    if (loadedClip) {
      return loadedClip;
    }

    setIsClipLoading(true);

    try {
      const nextClip = await onLoadClip(clip.id);

      setLoadedClip(nextClip);
      return nextClip;
    } finally {
      setIsClipLoading(false);
    }
  };
  const openDetails = () => {
    setIsDetailsOpen(true);
    void loadFullClip();
  };
  const actionContext = {
    isLoading: isClipLoading,
    loadFullClip,
  };

  return (
    <>
      <div
        className={[
          "rounded-lg border bg-white p-2 transition-colors",
          isSelected ? "border-accent ring-2 ring-accent/15" : "border-border",
        ].join(" ")}
      >
        <div className="relative overflow-hidden rounded-md bg-slate-100">
          <button
            type="button"
            aria-label={`Open details for ${clip.name}`}
            className="group relative block aspect-square w-full text-left"
            onClick={openDetails}
          >
            {posterUrl ? (
              <span
                aria-hidden
                className="block h-full w-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${posterUrl})` }}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs text-text-tertiary">
                Video
              </span>
            )}
            <span className="absolute inset-0 bg-slate-950/10 transition-colors group-hover:bg-slate-950/20" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-accent shadow-lg shadow-slate-900/20">
                <Play aria-hidden className="ml-0.5 h-5 w-5 fill-current" />
              </span>
            </span>
          </button>
          <span className="pointer-events-none absolute left-2 top-2 max-w-[75%] truncate rounded-md border border-purple-200 bg-white/95 px-2 py-1 text-[11px] font-bold leading-none text-accent-dark shadow-sm shadow-slate-900/10">
            {getVideoClipBadgeLabel(clip)}
          </span>
        </div>
        <div className="mt-3 flex items-start justify-between gap-2">
          <button
            type="button"
            className="min-w-0 flex-1 rounded-md text-left outline-none transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={openDetails}
          >
            <h3 className="truncate text-sm font-bold text-text-primary">
              {clip.name}
            </h3>
            <p className="mt-1 text-xs text-text-tertiary">
              {formatDuration(clip.duration)} . {formatBytes(clip.size)}
            </p>
          </button>
          {actions ? (
            <div className="flex shrink-0 gap-1">{actions(actionContext)}</div>
          ) : null}
        </div>
        {footer ? <div className="mt-4">{footer(actionContext)}</div> : null}
      </div>
      {isDetailsOpen ? (
        <VideoClipDetailsDialog
          clip={clip}
          isLoading={isClipLoading}
          posterUrl={posterUrl}
          videoUrl={videoUrl}
          onClose={() => setIsDetailsOpen(false)}
          onLoadPreview={() => {
            void loadFullClip();
          }}
        />
      ) : null}
    </>
  );
}
