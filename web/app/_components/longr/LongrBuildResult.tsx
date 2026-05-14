"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import { createVideoBlobWithPosterMetadata } from "@/lib/clipstitchr/media/createVideoBlobWithPosterMetadata";
import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";
import { downloadBlob } from "@/lib/clipstitchr/utils/downloadBlob";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type LongrBuildResultProps = {
  longrVideo: LongrVideo | null;
};

export function LongrBuildResult({ longrVideo }: LongrBuildResultProps) {
  const posterUrl = useObjectUrl(longrVideo?.posterBlob);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!longrVideo) {
    return null;
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      downloadBlob(
        await createVideoBlobWithPosterMetadata({
          posterBlob: longrVideo.posterBlob,
          title: longrVideo.name,
          videoBlob: longrVideo.blob,
        }),
        longrVideo.name,
      );
    } catch (nextError) {
      setDownloadError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to download this Long.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Panel className="p-4">
      <div className="grid gap-3 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center">
        <div
          aria-label={longrVideo.name}
          role="img"
          className="aspect-[9/16] w-[72px] rounded-md bg-slate-950 bg-cover bg-center"
          style={
            posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined
          }
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-accent-dark">Long ready</p>
          <h2 className="mt-1 truncate text-base font-bold text-text-primary">
            {longrVideo.name}
          </h2>
          <p className="mt-1 text-xs text-text-tertiary">
            {formatDuration(longrVideo.duration)} . {formatBytes(longrVideo.size)}
          </p>
        </div>
        <Button
          type="button"
          icon={<Download aria-hidden className="h-4 w-4" />}
          isLoading={isDownloading}
          onClick={() => void handleDownload()}
        >
          Download
        </Button>
      </div>
      {downloadError ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {downloadError}
        </p>
      ) : null}
    </Panel>
  );
}
