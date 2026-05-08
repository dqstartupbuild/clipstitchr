"use client";

import { Download, Edit3, Scissors, Trash2 } from "lucide-react";
import { useState } from "react";
import { VideoTrimDialog } from "@/app/_components/trim/VideoTrimDialog";
import { Badge } from "@/app/_components/ui/Badge";
import { IconButton } from "@/app/_components/ui/IconButton";
import { IconLink } from "@/app/_components/ui/IconLink";
import { Panel } from "@/app/_components/ui/Panel";
import { VideoPreview } from "@/app/_components/ui/VideoPreview";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getAssetDownloadFileName } from "@/lib/clipstitchr/utils/getAssetDownloadFileName";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getBlobFileExtension } from "@/lib/clipstitchr/utils/getBlobFileExtension";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type VideoClipCardProps = {
  clip: VideoClip;
  onDelete: (id: string) => void | Promise<void>;
  onRename: (clip: VideoClip, name: string) => void | Promise<void>;
  onUpdateTrim: (
    clip: VideoClip,
    trimRange: VideoTrimRange,
  ) => void | Promise<void>;
};

export function VideoClipCard({
  clip,
  onDelete,
  onRename,
  onUpdateTrim,
}: VideoClipCardProps) {
  const url = useObjectUrl(clip.blob);
  const posterUrl = useObjectUrl(clip.posterBlob);
  const [isTrimOpen, setIsTrimOpen] = useState(false);
  const defaultTrimRange = getDefaultVideoTrimRange(clip);
  const selectedDuration = getVideoTrimRangeDuration(defaultTrimRange);

  return (
    <>
      <Panel className="overflow-hidden">
        <VideoPreview src={url} posterSrc={posterUrl} label={clip.name} />
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-text-primary">
                {clip.name}
              </h3>
              <p className="mt-1 text-xs text-text-tertiary">
                {formatDuration(selectedDuration)} selected .{" "}
                {formatDuration(clip.duration)} total . {formatBytes(clip.size)}
              </p>
            </div>
            <Badge tone={clip.clipType === "ugc" ? "purple" : "green"}>
              {clip.clipType.toUpperCase()}
            </Badge>
          </div>
          <div className="mt-4 flex gap-2">
            {url ? (
              <IconLink
                label="Download clip"
                href={url}
                download={getAssetDownloadFileName(
                  clip.name,
                  getBlobFileExtension(clip.blob, "mp4"),
                )}
                icon={<Download aria-hidden className="h-4 w-4" />}
              />
            ) : null}
            <IconButton
              label="Rename clip"
              icon={<Edit3 aria-hidden className="h-4 w-4" />}
              onClick={() => {
                const nextName = window.prompt("Rename clip", clip.name);

                if (nextName?.trim()) {
                  void onRename(clip, nextName.trim());
                }
              }}
            />
            <IconButton
              label="Edit default trim"
              icon={<Scissors aria-hidden className="h-4 w-4" />}
              onClick={() => setIsTrimOpen(true)}
            />
            <IconButton
              label="Delete clip"
              variant="danger"
              icon={<Trash2 aria-hidden className="h-4 w-4" />}
              onClick={() => void onDelete(clip.id)}
            />
          </div>
        </div>
      </Panel>
      {isTrimOpen ? (
        <VideoTrimDialog
          clip={clip}
          initialTrimRange={defaultTrimRange}
          title="Default trim"
          onClose={() => setIsTrimOpen(false)}
          onSave={async (trimRange) => {
            await onUpdateTrim(clip, trimRange);
            setIsTrimOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
