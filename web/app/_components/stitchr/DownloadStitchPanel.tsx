"use client";

import { Download } from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";
import { VideoPreview } from "@/app/_components/ui/VideoPreview";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type DownloadStitchPanelProps = {
  stitch: Stitch | null;
};

export function DownloadStitchPanel({
  stitch,
}: DownloadStitchPanelProps) {
  const url = useObjectUrl(stitch?.blob);
  const posterUrl = useObjectUrl(stitch?.posterBlob);

  if (!stitch) {
    return null;
  }

  return (
    <Panel className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Download</p>
          <h2 className="mt-2 text-lg font-bold text-text-primary">
            {stitch.name}
          </h2>
          <p className="mt-1 text-xs text-text-tertiary">
            {formatDuration(stitch.duration)} . {formatBytes(stitch.size)}
          </p>
        </div>
        <a
          href={url ?? undefined}
          download={stitch.name}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
        >
          <Download aria-hidden className="h-4 w-4" />
          Download
        </a>
      </div>
      <div className="mx-auto max-w-[390px]">
        <VideoPreview
          src={url}
          posterSrc={posterUrl}
          label={stitch.name}
        />
      </div>
    </Panel>
  );
}
