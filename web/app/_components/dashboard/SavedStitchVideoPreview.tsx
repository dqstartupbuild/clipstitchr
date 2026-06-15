"use client";

import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

type SavedStitchVideoPreviewProps = {
  posterUrl: string | null;
  stitch: Stitch;
  videoBlob: Blob;
};

export function SavedStitchVideoPreview({
  posterUrl,
  stitch,
  videoBlob,
}: SavedStitchVideoPreviewProps) {
  const videoUrl = useObjectUrl(videoBlob);

  if (!videoUrl) {
    return (
      <div className="mx-auto flex aspect-[9/16] w-full max-w-[280px] items-center justify-center rounded-lg bg-slate-950 px-4 text-center text-sm font-semibold text-slate-300">
        Preview unavailable
      </div>
    );
  }

  return (
    <video
      aria-label={`Preview ${stitch.name}`}
      className="mx-auto aspect-[9/16] w-full max-w-[280px] rounded-lg bg-slate-950 object-contain"
      controls
      playsInline
      poster={posterUrl ?? undefined}
      preload="metadata"
      src={videoUrl}
    />
  );
}
