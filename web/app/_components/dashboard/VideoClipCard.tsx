"use client";

import { Download, Edit3, Scissors, Trash2 } from "lucide-react";
import { useState } from "react";
import { VideoTrimDialog } from "@/app/_components/trim/VideoTrimDialog";
import { AssetMetadataEditDialog } from "@/app/_components/uploads/AssetMetadataEditDialog";
import { AssetTagList } from "@/app/_components/uploads/AssetTagList";
import { Badge } from "@/app/_components/ui/Badge";
import { IconButton } from "@/app/_components/ui/IconButton";
import { Panel } from "@/app/_components/ui/Panel";
import { VideoPreview } from "@/app/_components/ui/VideoPreview";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { downloadBlob } from "@/lib/clipstitchr/utils/downloadBlob";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getAssetDownloadFileName } from "@/lib/clipstitchr/utils/getAssetDownloadFileName";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getMimeTypeFileExtension } from "@/lib/clipstitchr/utils/getMimeTypeFileExtension";
import { getVideoClipBadgeLabel } from "@/lib/clipstitchr/utils/getVideoClipBadgeLabel";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type VideoClipCardProps = {
  clip: VideoClipMetadata;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onDelete: (id: string) => void | Promise<void>;
  onUpdateMetadata: (
    clip: VideoClipMetadata,
    metadata: AssetMetadataUpdate,
  ) => void | Promise<void>;
  onUpdateTrim: (
    clip: VideoClipMetadata,
    trimRange: VideoTrimRange,
  ) => void | Promise<void>;
};

export function VideoClipCard({
  clip,
  onLoadClip,
  onDelete,
  onUpdateMetadata,
  onUpdateTrim,
}: VideoClipCardProps) {
  const [loadedClip, setLoadedClip] = useState<VideoClip | null>(null);
  const [isClipLoading, setIsClipLoading] = useState(false);
  const url = useObjectUrl(loadedClip?.blob);
  const posterUrl = useObjectUrl(clip.posterBlob);
  const [isTrimOpen, setIsTrimOpen] = useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const defaultTrimRange = getDefaultVideoTrimRange(clip);
  const selectedDuration = getVideoTrimRangeDuration(defaultTrimRange);
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

  const handleDownload = async () => {
    const nextClip = await loadFullClip();

    if (!nextClip) {
      return;
    }

    downloadBlob(
      nextClip.blob,
      getAssetDownloadFileName(
        clip.name,
        getMimeTypeFileExtension(nextClip.blob.type || clip.mimeType, "mp4"),
      ),
    );
  };

  return (
    <>
      <Panel className="overflow-hidden">
        <VideoPreview
          src={url}
          posterSrc={posterUrl}
          label={clip.name}
          isLoading={isClipLoading}
          onLoadPreview={() => {
            void loadFullClip();
          }}
        />
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
              <AssetTagList
                tags={clip.tags}
                className="mt-3"
                requiredTag={clip.clipType}
              />
            </div>
            <Badge>{getVideoClipBadgeLabel(clip)}</Badge>
          </div>
          <div className="mt-4 flex gap-2">
            <IconButton
              label="Download clip"
              icon={<Download aria-hidden className="h-4 w-4" />}
              disabled={isClipLoading}
              onClick={() => void handleDownload()}
            />
            <IconButton
              label="Edit clip details"
              icon={<Edit3 aria-hidden className="h-4 w-4" />}
              onClick={() => setIsMetadataOpen(true)}
            />
            <IconButton
              label="Edit default trim"
              icon={<Scissors aria-hidden className="h-4 w-4" />}
              disabled={isClipLoading}
              onClick={() => {
                void loadFullClip().then((nextClip) => {
                  if (nextClip) {
                    setIsTrimOpen(true);
                  }
                });
              }}
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
      {isTrimOpen && loadedClip ? (
        <VideoTrimDialog
          clip={loadedClip}
          initialTrimRange={defaultTrimRange}
          title="Default trim"
          onClose={() => setIsTrimOpen(false)}
          onSave={async (trimRange) => {
            await onUpdateTrim(clip, trimRange);
            setIsTrimOpen(false);
          }}
        />
      ) : null}
      {isMetadataOpen ? (
        <AssetMetadataEditDialog
          title={clip.name}
          initialName={clip.name}
          initialTags={clip.tags}
          requiredTag={clip.clipType}
          onClose={() => setIsMetadataOpen(false)}
          onSave={async (metadata) => {
            await onUpdateMetadata(clip, metadata);
            setIsMetadataOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
