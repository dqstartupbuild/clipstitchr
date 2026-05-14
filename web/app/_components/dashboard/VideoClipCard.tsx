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
import type { MediaCardActionMenuItem } from "@/app/_components/ui/MediaCardActionMenu";
import { downloadMusicBlob } from "@/lib/clipstitchr/client/r2/downloadMusicBlob";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { CreateAvatarFromUgcClipOptions } from "@/lib/clipstitchr/types/CreateAvatarFromUgcClipOptions";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { createVideoBlobWithPosterMetadata } from "@/lib/clipstitchr/media/createVideoBlobWithPosterMetadata";
import { renderCliprVideoWithMusic } from "@/lib/clipstitchr/media/renderCliprVideoWithMusic";
import { downloadBlob } from "@/lib/clipstitchr/utils/downloadBlob";
import { getAssetDownloadFileName } from "@/lib/clipstitchr/utils/getAssetDownloadFileName";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getClipCanUseInSwapr } from "@/lib/clipstitchr/utils/getClipCanUseInSwapr";
import { getMimeTypeFileExtension } from "@/lib/clipstitchr/utils/getMimeTypeFileExtension";
import { getUseInStitchrHref } from "@/lib/clipstitchr/utils/getUseInStitchrHref";
import { getUseInSwaprClipHref } from "@/lib/clipstitchr/utils/getUseInSwaprClipHref";
import { getVideoTrimDisplayDuration } from "@/lib/clipstitchr/utils/getVideoTrimDisplayDuration";

type VideoClipCardProps = {
  clip: VideoClipMetadata;
  products?: ProductProfile[];
  productName?: string;
  avatarCreatorError?: string | null;
  isCreatingAvatarFromClip?: boolean;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onDelete: (id: string) => void | Promise<void>;
  onUpdateMetadata: (
    clip: VideoClipMetadata,
    metadata: AssetMetadataUpdate,
  ) => void | Promise<void>;
  onGenerateCliprMusic?: (
    clip: VideoClipMetadata,
  ) => Promise<CliprMusicMetadata | null>;
  onUpdateCliprMusic?: (
    clip: VideoClipMetadata,
    music: CliprMusicMetadata | null,
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
  products = [],
  productName,
  avatarCreatorError = null,
  isCreatingAvatarFromClip = false,
  onLoadClip,
  onDelete,
  onGenerateCliprMusic,
  onUpdateCliprMusic,
  onUpdateMetadata,
  onUpdateTrim,
  onCreateAvatarFromClip,
}: VideoClipCardProps) {
  const [isAvatarCreatorOpen, setIsAvatarCreatorOpen] = useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [isSavingMusic, setIsSavingMusic] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [musicError, setMusicError] = useState<string | null>(null);
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

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const music = nextClip.cliprMetadata?.music;
      const renderedBlob =
        music?.enabled && music.audioObject
          ? (
              await renderCliprVideoWithMusic({
                musicBlob: await downloadMusicBlob(music),
                videoBlob: nextClip.blob,
                volume: music.volume,
              })
            ).blob
          : nextClip.blob;
      const exportBlob = await createVideoBlobWithPosterMetadata({
        posterBlob: clip.posterBlob,
        title: clip.name,
        videoBlob: renderedBlob,
      });

      downloadBlob(
        exportBlob,
        getAssetDownloadFileName(
          clip.name,
          getMimeTypeFileExtension(exportBlob.type || clip.mimeType, "mp4"),
        ),
      );
    } catch (nextError) {
      setDownloadError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to export this Clip.",
      );
    } finally {
      setIsDownloading(false);
    }
  };
  const handleGenerateCliprMusic = async () => {
    if (!onGenerateCliprMusic) {
      return null;
    }

    setIsGeneratingMusic(true);
    setMusicError(null);

    try {
      return await onGenerateCliprMusic(clip);
    } catch (nextError) {
      setMusicError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to generate music for this Clip.",
      );
      return null;
    } finally {
      setIsGeneratingMusic(false);
    }
  };
  const handleUpdateCliprMusic = async (music: CliprMusicMetadata | null) => {
    if (!onUpdateCliprMusic) {
      return;
    }

    setIsSavingMusic(true);
    setMusicError(null);

    try {
      await onUpdateCliprMusic(clip, music);
    } catch (nextError) {
      setMusicError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to update music for this Clip.",
      );
      throw nextError;
    } finally {
      setIsSavingMusic(false);
    }
  };

  return (
    <>
      <VideoClipPreviewCard
        clip={clip}
        productName={productName}
        displayDuration={displayDuration}
        onLoadClip={onLoadClip}
        trimEditor={{
          initialTrimRange: defaultTrimRange,
          saveLabel: "Save trim",
          title: "Default trim",
          onSave: (trimRange) => onUpdateTrim(clip, trimRange),
        }}
        cliprMusicEditor={
          clip.cliprMetadata && onGenerateCliprMusic && onUpdateCliprMusic
            ? {
                error: musicError,
                isGenerating: isGeneratingMusic,
                isSaving: isSavingMusic,
                onGenerate: handleGenerateCliprMusic,
                onRemove: () => handleUpdateCliprMusic(null),
                onSave: handleUpdateCliprMusic,
              }
            : undefined
        }
        actions={({ isLoading, loadFullClip, openDetails }) => {
          const items: MediaCardActionMenuItem[] = [
            {
              label: "Use in Stitchr",
              href: getUseInStitchrHref(clip),
              icon: <Scissors aria-hidden className="h-4 w-4" />,
            },
          ];

          if (getClipCanUseInSwapr(clip)) {
            items.push({
              label: "Use in Swapr",
              href: getUseInSwaprClipHref(clip),
              icon: <Shuffle aria-hidden className="h-4 w-4" />,
            });
          }

          items.push(
            {
              label: "Download clip",
              icon: <Download aria-hidden className="h-4 w-4" />,
              disabled: isLoading || isDownloading,
              onClick: () => void handleDownload(loadFullClip),
            },
            {
              label: "Edit clip details",
              icon: <Edit3 aria-hidden className="h-4 w-4" />,
              onClick: () => setIsMetadataOpen(true),
            },
            {
              label:
                clip.cliprMetadata && onGenerateCliprMusic && onUpdateCliprMusic
                  ? "Edit trim and music"
                  : "Edit default trim",
              icon: <SlidersHorizontal aria-hidden className="h-4 w-4" />,
              disabled: isLoading,
              onClick: () => openDetails({ showControlsEditor: true }),
            },
          );

          if (clip.clipType === "ugc" && onCreateAvatarFromClip) {
            items.push({
              label: "Create avatar from UGC",
              icon: <UserRound aria-hidden className="h-4 w-4" />,
              disabled: isLoading || isCreatingAvatarFromClip,
              onClick: () => setIsAvatarCreatorOpen(true),
            });
          }

          items.push({
            label: "Delete clip",
            variant: "danger",
            icon: <Trash2 aria-hidden className="h-4 w-4" />,
            onClick: () => void onDelete(clip.id),
          });

          return items;
        }}
        footer={() =>
          downloadError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
              {downloadError}
            </p>
          ) : null
        }
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
          initialProductId={clip.productId}
          initialTags={clip.tags}
          initialVideoDescription={clip.videoDescription}
          products={products}
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
