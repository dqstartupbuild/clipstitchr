"use client";

import {
  CheckCircle2,
  Download,
  Edit3,
  Gauge,
  RotateCcw,
  Scissors,
  Shuffle,
  Trash2,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { CreateAvatarFromClipDialog } from "@/app/_components/dashboard/CreateAvatarFromClipDialog";
import { VideoClipPreviewCard } from "@/app/_components/dashboard/VideoClipPreviewCard";
import type { MediaCardActionMenuItem } from "@/app/_components/ui/MediaCardActionMenu";
import { downloadMusicBlob } from "@/lib/clipstitchr/client/r2/downloadMusicBlob";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { ClipPerformanceScore } from "@/lib/clipstitchr/types/ClipPerformanceScore";
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
import { getClipCanBeScored } from "@/lib/clipstitchr/utils/getClipCanBeScored";
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
  isSelected?: boolean;
  isSelectionDisabled?: boolean;
  isCreatingAvatarFromClip?: boolean;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onDelete: (id: string) => void | Promise<void>;
  onSelect?: () => void;
  onUpdateMetadata: (
    clip: VideoClipMetadata,
    metadata: AssetMetadataUpdate,
  ) => void | Promise<void>;
  onGenerateCliprMusic?: (
    clip: VideoClipMetadata,
  ) => Promise<CliprMusicMetadata | null>;
  onScore?: (clip: VideoClipMetadata) => Promise<ClipPerformanceScore>;
  onUpdateCliprMusic?: (
    clip: VideoClipMetadata,
    music: CliprMusicMetadata | null,
  ) => void | Promise<void>;
  onUpdateTrim: (
    clip: VideoClipMetadata,
    trimRange: VideoTrimRange,
  ) => void | Promise<void>;
  onUpdatePostedStatus?: (
    clip: VideoClipMetadata,
    isPosted: boolean,
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
  isSelected = false,
  isSelectionDisabled = false,
  isCreatingAvatarFromClip = false,
  onLoadClip,
  onLoadPoster,
  onDelete,
  onSelect,
  onGenerateCliprMusic,
  onScore,
  onUpdateCliprMusic,
  onUpdateMetadata,
  onUpdateTrim,
  onUpdatePostedStatus,
  onCreateAvatarFromClip,
}: VideoClipCardProps) {
  const [isAvatarCreatorOpen, setIsAvatarCreatorOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [isSavingMusic, setIsSavingMusic] = useState(false);
  const [isSavingPostedStatus, setIsSavingPostedStatus] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [musicError, setMusicError] = useState<string | null>(null);
  const [postedStatusError, setPostedStatusError] = useState<string | null>(
    null,
  );
  const [scoreError, setScoreError] = useState<string | null>(null);
  const defaultTrimRange = getDefaultVideoTrimRange(clip);
  const isPosted = Boolean(clip.isPosted);
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
        posterBlob: nextClip.posterBlob ?? clip.posterBlob,
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
  const handleUpdatePostedStatus = async (nextIsPosted: boolean) => {
    if (!onUpdatePostedStatus) {
      return;
    }

    setIsSavingPostedStatus(true);
    setPostedStatusError(null);

    try {
      await onUpdatePostedStatus(clip, nextIsPosted);
    } catch (nextError) {
      setPostedStatusError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to update posted status.",
      );
    } finally {
      setIsSavingPostedStatus(false);
    }
  };
  const handleScore = async () => {
    if (!onScore) {
      return;
    }

    setIsScoring(true);
    setScoreError(null);

    try {
      await onScore(clip);
    } catch (nextError) {
      setScoreError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to score this clip.",
      );
    } finally {
      setIsScoring(false);
    }
  };

  return (
    <>
      <VideoClipPreviewCard
        clip={clip}
        productName={productName}
        displayDuration={displayDuration}
        isSelected={isSelected}
        isSelectionDisabled={isSelectionDisabled}
        onLoadClip={onLoadClip}
        onLoadPoster={onLoadPoster}
        onSelect={onSelect}
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
        metadataEditor={{
          products,
          onSave: (metadata) => onUpdateMetadata(clip, metadata),
        }}
        actions={({ closeDetails, isLoading, loadFullClip, openDetails }) => {
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
              label: "Edit clip",
              icon: <Edit3 aria-hidden className="h-4 w-4" />,
              disabled: isLoading,
              onClick: () => openDetails({ showEditDialog: true }),
            },
          );

          if (onUpdatePostedStatus) {
            items.push({
              label: isPosted ? "Mark as active" : "Mark as posted",
              icon: isPosted ? (
                <RotateCcw aria-hidden className="h-4 w-4" />
              ) : (
                <CheckCircle2 aria-hidden className="h-4 w-4" />
              ),
              disabled: isLoading || isSavingPostedStatus,
              onClick: () => void handleUpdatePostedStatus(!isPosted),
            });
          }

          if (onScore && getClipCanBeScored(clip)) {
            items.push({
              label: clip.performanceScore ? "Rescore clip" : "Score clip",
              icon: <Gauge aria-hidden className="h-4 w-4" />,
              disabled: isLoading || isScoring,
              onClick: () => void handleScore(),
            });
          }

          if (clip.clipType === "ugc" && onCreateAvatarFromClip) {
            items.push({
              label: "Create avatar from UGC",
              icon: <UserRound aria-hidden className="h-4 w-4" />,
              disabled: isLoading || isCreatingAvatarFromClip,
              onClick: () => {
                closeDetails();
                setIsAvatarCreatorOpen(true);
              },
            });
          }

          items.push({
            label: "Delete clip",
            variant: "danger",
            icon: <Trash2 aria-hidden className="h-4 w-4" />,
            onClick: () => {
              closeDetails();
              void onDelete(clip.id);
            },
          });

          return items;
        }}
        footer={() =>
          downloadError || postedStatusError || scoreError ? (
            <div className="flex flex-col gap-2">
              {downloadError ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                  {downloadError}
                </p>
              ) : null}
              {postedStatusError ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                  {postedStatusError}
                </p>
              ) : null}
              {scoreError ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                  {scoreError}
                </p>
              ) : null}
            </div>
          ) : null
        }
      />
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
