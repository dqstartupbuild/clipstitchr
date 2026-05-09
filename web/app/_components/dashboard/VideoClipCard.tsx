"use client";

import { Download, Edit3, Scissors, Trash2 } from "lucide-react";
import { useState } from "react";
import { VideoClipPreviewCard } from "@/app/_components/dashboard/VideoClipPreviewCard";
import { VideoTrimDialog } from "@/app/_components/trim/VideoTrimDialog";
import { AssetMetadataEditDialog } from "@/app/_components/uploads/AssetMetadataEditDialog";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { downloadBlob } from "@/lib/clipstitchr/utils/downloadBlob";
import { getAssetDownloadFileName } from "@/lib/clipstitchr/utils/getAssetDownloadFileName";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getMimeTypeFileExtension } from "@/lib/clipstitchr/utils/getMimeTypeFileExtension";

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
  const [trimClip, setTrimClip] = useState<VideoClip | null>(null);
  const [isTrimOpen, setIsTrimOpen] = useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const defaultTrimRange = getDefaultVideoTrimRange(clip);
  const handleDownload = async (
    loadFullClip: () => Promise<VideoClip | null>,
  ) => {
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
      <VideoClipPreviewCard
        clip={clip}
        onLoadClip={onLoadClip}
        actions={({ isLoading, loadFullClip }) => (
          <>
            <IconButton
              label="Download clip"
              icon={<Download aria-hidden className="h-4 w-4" />}
              disabled={isLoading}
              onClick={() => void handleDownload(loadFullClip)}
            />
            <IconButton
              label="Edit clip details"
              icon={<Edit3 aria-hidden className="h-4 w-4" />}
              onClick={() => setIsMetadataOpen(true)}
            />
            <IconButton
              label="Edit default trim"
              icon={<Scissors aria-hidden className="h-4 w-4" />}
              disabled={isLoading}
              onClick={() => {
                void loadFullClip().then((nextClip) => {
                  if (nextClip) {
                    setTrimClip(nextClip);
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
          </>
        )}
      />
      {isTrimOpen && trimClip ? (
        <VideoTrimDialog
          clip={trimClip}
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
          initialLocationDescription={clip.locationDescription}
          initialMainPersonDescription={clip.mainPersonDescription}
          initialOutfitDescription={clip.outfitDescription}
          initialPoseDescription={clip.poseDescription}
          initialProductDescription={clip.productDescription}
          initialTags={clip.tags}
          initialVideoDescription={clip.videoDescription}
          requiredTag={clip.clipType}
          showMainPersonDescriptionFields={clip.clipType === "ugc"}
          showProductDescriptionField={clip.clipType === "demo"}
          showVideoDescriptionFields
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
