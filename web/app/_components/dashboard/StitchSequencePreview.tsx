"use client";

import { Loader2, Play } from "lucide-react";
import { LoadedStitchSequencePreview } from "@/app/_components/dashboard/LoadedStitchSequencePreview";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

type StitchSequencePreviewProps = {
  demoClip: VideoClip | null;
  isLoading: boolean;
  posterUrl: string | null;
  stitch: Stitch;
  ugcClip: VideoClip | null;
  onLoadPreview: () => void;
  onTextOverlayChange?: (textOverlays: TextOverlay[]) => void;
};

export function StitchSequencePreview({
  demoClip,
  isLoading,
  posterUrl,
  stitch,
  ugcClip,
  onLoadPreview,
  onTextOverlayChange,
}: StitchSequencePreviewProps) {
  if (!ugcClip || !demoClip) {
    return (
      <div
        className="aspect-[9/16] overflow-hidden rounded-lg bg-slate-950 bg-cover bg-center"
        style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
      >
        <button
          type="button"
          aria-label={
            isLoading
              ? `Loading preview for ${stitch.name}`
              : `Preview ${stitch.name}`
          }
          className={[
            "group relative flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold text-slate-300 transition-colors",
            posterUrl ? "" : "hover:bg-slate-900",
          ].join(" ")}
          disabled={isLoading}
          onClick={onLoadPreview}
        >
          <span className="absolute inset-0 bg-slate-950/20 transition-colors group-hover:bg-slate-950/30" />
          <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-accent shadow-lg">
            {isLoading ? (
              <Loader2 aria-hidden className="h-5 w-5 animate-spin" />
            ) : (
              <Play aria-hidden className="ml-0.5 h-5 w-5 fill-current" />
            )}
          </span>
        </button>
      </div>
    );
  }

  return (
    <LoadedStitchSequencePreview
      demoClip={demoClip}
      stitch={stitch}
      ugcClip={ugcClip}
      onTextOverlayChange={onTextOverlayChange}
    />
  );
}
