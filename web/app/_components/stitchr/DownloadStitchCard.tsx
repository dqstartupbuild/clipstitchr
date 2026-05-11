"use client";

import { Download } from "lucide-react";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type DownloadStitchCardProps = {
  stitch: Stitch;
};

export function DownloadStitchCard({ stitch }: DownloadStitchCardProps) {
  const url = useObjectUrl(stitch.blob);
  const posterUrl = useObjectUrl(stitch.posterBlob);

  return (
    <div className="grid min-w-0 gap-3 overflow-hidden rounded-lg border border-border bg-white p-3 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center">
      <div
        aria-label={stitch.name}
        role="img"
        className="aspect-[9/16] w-[72px] rounded-md bg-slate-950 bg-cover bg-center"
        style={
          posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined
        }
      />
      <div className="min-w-0">
        <h3 className="truncate text-sm font-bold text-text-primary">
          {stitch.name}
        </h3>
        <p className="mt-1 text-xs text-text-tertiary">
          {formatDuration(stitch.duration)} . {formatBytes(stitch.size)}
        </p>
      </div>
      <a
        href={url ?? undefined}
        download={stitch.name}
        aria-disabled={!url}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark aria-disabled:pointer-events-none aria-disabled:opacity-60"
      >
        <Download aria-hidden className="h-4 w-4" />
        Download
      </a>
    </div>
  );
}
