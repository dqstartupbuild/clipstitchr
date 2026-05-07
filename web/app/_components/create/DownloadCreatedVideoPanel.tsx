"use client";

import { Download } from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";
import { VideoPreview } from "@/app/_components/ui/VideoPreview";
import { useObjectUrl } from "@/lib/clipr/hooks/useObjectUrl";
import type { CreatedVideo } from "@/lib/clipr/types/CreatedVideo";
import { formatBytes } from "@/lib/clipr/utils/formatBytes";
import { formatDuration } from "@/lib/clipr/utils/formatDuration";

type DownloadCreatedVideoPanelProps = {
  createdVideo: CreatedVideo | null;
};

export function DownloadCreatedVideoPanel({
  createdVideo,
}: DownloadCreatedVideoPanelProps) {
  const url = useObjectUrl(createdVideo?.blob);

  if (!createdVideo) {
    return null;
  }

  return (
    <Panel className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Download</p>
          <h2 className="mt-2 text-lg font-bold text-text-primary">
            {createdVideo.name}
          </h2>
          <p className="mt-1 text-xs text-text-tertiary">
            {formatDuration(createdVideo.duration)} . {formatBytes(createdVideo.size)}
          </p>
        </div>
        <a
          href={url ?? undefined}
          download={createdVideo.name}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
        >
          <Download aria-hidden className="h-4 w-4" />
          Download
        </a>
      </div>
      <VideoPreview src={url} label={createdVideo.name} />
    </Panel>
  );
}
