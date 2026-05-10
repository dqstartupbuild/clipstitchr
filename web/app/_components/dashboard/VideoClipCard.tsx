"use client";

import {
  Download,
  Edit3,
  Scissors,
  SlidersHorizontal,
  Shuffle,
  Trash2,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { CreateAvatarFromClipDialog } from "@/app/_components/dashboard/CreateAvatarFromClipDialog";
import { VideoClipPreviewCard } from "@/app/_components/dashboard/VideoClipPreviewCard";
import { AssetMetadataEditDialog } from "@/app/_components/uploads/AssetMetadataEditDialog";
import { IconButton } from "@/app/_components/ui/IconButton";
import { IconButtonLink } from "@/app/_components/ui/IconButtonLink";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { CreateAvatarFromUgcClipOptions } from "@/lib/clipstitchr/types/CreateAvatarFromUgcClipOptions";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { downloadBlob } from "@/lib/clipstitchr/utils/downloadBlob";
import { getAssetDownloadFileName } from "@/lib/clipstitchr/utils/getAssetDownloadFileName";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getMimeTypeFileExtension } from "@/lib/clipstitchr/utils/getMimeTypeFileExtension";
import { getUseInStitchrHref } from "@/lib/clipstitchr/utils/getUseInStitchrHref";
import { getUseInSwaprClipHref } from "@/lib/clipstitchr/utils/getUseInSwaprClipHref";
import { getVideoTrimDisplayDuration } from "@/lib/clipstitchr/utils/getVideoTrimDisplayDuration";

type VideoClipCardProps = {
  clip: VideoClipMetadata;
  avatarCreatorError?: string | null;
  isCreatingAvatarFromClip?: boolean;
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
  onCreateAvatarFromClip?: (
    clip: VideoClipMetadata,
    options: CreateAvatarFromUgcClipOptions,
  ) => Promise<boolean>;
};

export function VideoClipCard({
  clip,
  avatarCreatorError = null,
  isCreatingAvatarFromClip = false,
  onLoadClip,
  onDelete,
  onUpdateMetadata,
  onUpdateTrim,
  onCreateAvatarFromClip,
}: VideoClipCardProps) {
  const [isAvatarCreatorOpen, setIsAvatarCreatorOpen] = useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const defaultTrimRange = getDefaultVideoTrimRange(clip);
  const displayDuration = getVideoTrimDisplayDuration(
    clip.duration,
    defaultTrimRange,
  );
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
        displayDuration={displayDuration}
        onLoadClip={onLoadClip}
        trimEditor={{
          initialTrimRange: defaultTrimRange,
          saveLabel: "Save trim",
          title: "Default trim",
          onSave: (trimRange) => onUpdateTrim(clip, trimRange),
        }}
        actions={({ isLoading, loadFullClip, openDetails }) => (
          <>
            <IconButtonLink
              label="Use in Stitchr"
              href={getUseInStitchrHref(clip)}
              icon={<Scissors aria-hidden className="h-4 w-4" />}
            />
            {clip.clipType === "demo" ? (
              <IconButtonLink
                label="Use in Swapr"
                href={getUseInSwaprClipHref(clip)}
                icon={<Shuffle aria-hidden className="h-4 w-4" />}
              />
            ) : null}
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
              icon={<SlidersHorizontal aria-hidden className="h-4 w-4" />}
              disabled={isLoading}
              onClick={() => openDetails({ showTrimEditor: true })}
            />
            {clip.clipType === "ugc" && onCreateAvatarFromClip ? (
              <IconButton
                label="Create avatar from UGC"
                icon={<UserRound aria-hidden className="h-4 w-4" />}
                disabled={isLoading || isCreatingAvatarFromClip}
                onClick={() => setIsAvatarCreatorOpen(true)}
              />
            ) : null}
            <IconButton
              label="Delete clip"
              variant="danger"
              icon={<Trash2 aria-hidden className="h-4 w-4" />}
              onClick={() => void onDelete(clip.id)}
            />
          </>
        )}
      />
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
      {isAvatarCreatorOpen && onCreateAvatarFromClip ? (
        <CreateAvatarFromClipDialog
          clip={clip}
          error={avatarCreatorError}
          isGenerating={isCreatingAvatarFromClip}
          onClose={() => setIsAvatarCreatorOpen(false)}
          onCreate={(options) => onCreateAvatarFromClip(clip, options)}
        />
      ) : null}
    </>
  );
}
