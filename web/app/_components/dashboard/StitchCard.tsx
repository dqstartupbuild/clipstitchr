"use client";

import { Download, Music2, Play, Shuffle, Trash2, Type } from "lucide-react";
import { useCallback, useState } from "react";
import { StitchDetailsDialog } from "@/app/_components/dashboard/StitchDetailsDialog";
import { StitchMusicSettingsDialog } from "@/app/_components/dashboard/StitchMusicSettingsDialog";
import { StitchTextSettingsDialog } from "@/app/_components/dashboard/StitchTextSettingsDialog";
import {
  MediaCardActionMenu,
  type MediaCardActionMenuItem,
} from "@/app/_components/ui/MediaCardActionMenu";
import { createStitchExportBlob } from "@/lib/clipstitchr/client/createStitchExportBlob";
import { useLazyBlobObjectUrl } from "@/lib/clipstitchr/hooks/useLazyBlobObjectUrl";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { downloadBlob } from "@/lib/clipstitchr/utils/downloadBlob";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getUseInSwaprStitchHref } from "@/lib/clipstitchr/utils/getUseInSwaprStitchHref";
import { capturePostHogException } from "@/lib/clipstitchr/analytics/capturePostHogException";
import { trackPostHogEvent } from "@/lib/clipstitchr/analytics/trackPostHogEvent";

type StitchCardProps = {
  stitch: Stitch;
  onDelete: (id: string) => void | Promise<void>;
  onGenerateMusic: (stitch: Stitch) => Promise<StitchMusicMetadata | null>;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onUpdateMusic: (
    stitch: Stitch,
    music: StitchMusicMetadata | null,
  ) => void | Promise<void>;
  onUpdateTextOverlay: (
    stitch: Stitch,
    textOverlay: TextOverlay | null,
  ) => void | Promise<void>;
};

export function StitchCard({
  stitch,
  onDelete,
  onGenerateMusic,
  onLoadClip,
  onLoadPoster,
  onUpdateMusic,
  onUpdateTextOverlay,
}: StitchCardProps) {
  const [previewState, setPreviewState] = useState<{
    demoClip: VideoClip;
    cacheKey: string;
    ugcClip: VideoClip;
  } | null>(null);
  const [previewErrorState, setPreviewErrorState] = useState<{
    cacheKey: string;
    message: string;
  } | null>(null);
  const previewCacheKey = [
    stitch.id,
    stitch.ugcClipId,
    stitch.demoClipId,
  ].join(":");
  const previewSources =
    previewState?.cacheKey === previewCacheKey ? previewState : null;
  const previewError =
    previewErrorState?.cacheKey === previewCacheKey
      ? previewErrorState.message
      : null;
  const loadPosterBlob = useCallback(
    () => onLoadPoster?.(stitch.id) ?? Promise.resolve(null),
    [onLoadPoster, stitch.id],
  );
  const posterUrl = useLazyBlobObjectUrl({
    cacheKey: stitch.posterObject?.key ?? stitch.ugcClipId,
    fallbackBlob: stitch.posterBlob,
    loadBlob: loadPosterBlob,
  });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [isTextOpen, setIsTextOpen] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [isSavingMusic, setIsSavingMusic] = useState(false);
  const [isSavingText, setIsSavingText] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [musicError, setMusicError] = useState<string | null>(null);
  const [textError, setTextError] = useState<string | null>(null);
  const fileSizeLabel = stitch.size
    ? formatBytes(stitch.size)
    : "Ready to download";

  const loadPreview = async () => {
    if (previewSources || isLoadingPreview) {
      return;
    }

    setIsLoadingPreview(true);
    setPreviewErrorState(null);

    try {
      const [ugcClip, demoClip] = await Promise.all([
        onLoadClip(stitch.ugcClipId),
        onLoadClip(stitch.demoClipId),
      ]);

      if (!ugcClip || !demoClip) {
        throw new Error("Unable to load the source videos for this stitch.");
      }

      setPreviewState({
        cacheKey: previewCacheKey,
        demoClip,
        ugcClip,
      });
    } catch (nextError) {
      setPreviewErrorState({
        cacheKey: previewCacheKey,
        message:
          nextError instanceof Error
            ? nextError.message
            : "Unable to preview this stitch.",
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };
  const openDetails = (shouldLoadPreview = false) => {
    setIsDetailsOpen(true);
    trackPostHogEvent("stitch_preview_viewed", {
      stitch_id: stitch.id,
      duration_seconds: stitch.duration,
      has_music: Boolean(stitch.music),
      has_text_overlay: Boolean(stitch.textOverlay),
    });

    if (shouldLoadPreview) {
      void loadPreview();
    }
  };
  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      downloadBlob(
        await createStitchExportBlob(stitch, { loadClip: onLoadClip }),
        stitch.name,
      );
      trackPostHogEvent("stitch_downloaded", {
        stitch_id: stitch.id,
        duration_seconds: stitch.duration,
        has_music: Boolean(stitch.music),
        has_text_overlay: Boolean(stitch.textOverlay),
        size_bytes: stitch.size,
      });
    } catch (nextError) {
      capturePostHogException(nextError, {
        feature: "stitch_download",
        stitch_id: stitch.id,
      });
      setDownloadError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to export this stitch.",
      );
    } finally {
      setIsDownloading(false);
    }
  };
  const handleGenerateMusic = async () => {
    setIsGeneratingMusic(true);
    setMusicError(null);

    try {
      const result = await onGenerateMusic(stitch);
      if (result) {
        trackPostHogEvent("stitch_music_generated", {
          stitch_id: stitch.id,
        });
      }
      return result;
    } catch (nextError) {
      capturePostHogException(nextError, {
        feature: "stitch_music_generation",
        stitch_id: stitch.id,
      });
      setMusicError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to generate stitch music.",
      );
      return null;
    } finally {
      setIsGeneratingMusic(false);
    }
  };
  const handleUpdateMusic = async (music: StitchMusicMetadata | null) => {
    setIsSavingMusic(true);
    setMusicError(null);

    try {
      await onUpdateMusic(stitch, music);
    } catch (nextError) {
      setMusicError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to update stitch music.",
      );
      throw nextError;
    } finally {
      setIsSavingMusic(false);
    }
  };
  const handleUpdateTextOverlay = async (textOverlay: TextOverlay | null) => {
    setIsSavingText(true);
    setTextError(null);

    try {
      await onUpdateTextOverlay(stitch, textOverlay);
    } catch (nextError) {
      setTextError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to update stitch text.",
      );
      throw nextError;
    } finally {
      setIsSavingText(false);
    }
  };
  const actionItems: MediaCardActionMenuItem[] = [
    {
      label: "Use in Swapr",
      href: getUseInSwaprStitchHref(stitch),
      icon: <Shuffle aria-hidden className="h-4 w-4" />,
    },
    {
      label: "Download stitch",
      icon: <Download aria-hidden className="h-4 w-4" />,
      disabled: isDownloading,
      onClick: () => void handleDownload(),
    },
    {
      label: "Edit stitch text",
      icon: <Type aria-hidden className="h-4 w-4" />,
      onClick: () => setIsTextOpen(true),
    },
    {
      label: "Edit stitch music",
      icon: <Music2 aria-hidden className="h-4 w-4" />,
      onClick: () => setIsMusicOpen(true),
    },
    {
      label: "Delete stitch",
      variant: "danger",
      icon: <Trash2 aria-hidden className="h-4 w-4" />,
      onClick: () => {
        trackPostHogEvent("stitch_deleted", {
          stitch_id: stitch.id,
          duration_seconds: stitch.duration,
          has_music: Boolean(stitch.music),
          has_text_overlay: Boolean(stitch.textOverlay),
        });
        void onDelete(stitch.id);
      },
    },
  ];

  return (
    <>
      <div className="mx-auto h-full w-full max-w-[280px] min-w-0 overflow-hidden rounded-lg border border-border bg-white p-2 transition-colors">
        <div className="relative overflow-hidden rounded-md bg-slate-100">
          <button
            type="button"
            aria-label={`Preview ${stitch.name}`}
            className="group relative block aspect-square w-full text-left"
            onClick={() => openDetails(true)}
          >
            {posterUrl ? (
              <span
                aria-hidden
                className="block h-full w-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${posterUrl})` }}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs text-text-tertiary">
                Video
              </span>
            )}
            <span className="absolute inset-0 bg-slate-950/10 transition-colors group-hover:bg-slate-950/20" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-accent shadow-lg shadow-slate-900/20">
                <Play aria-hidden className="ml-0.5 h-5 w-5 fill-current" />
              </span>
            </span>
          </button>
          <span className="pointer-events-none absolute left-2 top-2 max-w-[75%] truncate rounded-md border border-purple-200 bg-white/95 px-2 py-1 text-[11px] font-bold leading-none text-accent-dark shadow-sm shadow-slate-900/10">
            STITCH
          </span>
        </div>
        <div className="mt-3 flex items-start justify-between gap-2">
          <button
            type="button"
            className="min-w-0 flex-1 rounded-md text-left outline-none transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={() => openDetails(true)}
          >
            <h3 className="truncate text-sm font-bold text-text-primary">
              {stitch.name}
            </h3>
            <p className="mt-1 text-xs text-text-tertiary">
              {formatDuration(stitch.duration)} . {fileSizeLabel}
            </p>
            <p className="mt-2 text-xs text-text-secondary">
              {formatDate(stitch.createdAt)}
            </p>
          </button>
          <MediaCardActionMenu
            label={`Actions for ${stitch.name}`}
            items={actionItems}
          />
        </div>
        {downloadError ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
            {downloadError}
          </p>
        ) : null}
      </div>
      {isDetailsOpen ? (
        <StitchDetailsDialog
          demoClip={previewSources?.demoClip ?? null}
          isLoadingPreview={isLoadingPreview}
          posterUrl={posterUrl}
          previewError={previewError}
          stitch={stitch}
          ugcClip={previewSources?.ugcClip ?? null}
          onClose={() => setIsDetailsOpen(false)}
          onLoadPreview={() => {
            void loadPreview();
          }}
        />
      ) : null}
      {isMusicOpen ? (
        <StitchMusicSettingsDialog
          stitch={stitch}
          error={musicError}
          isGenerating={isGeneratingMusic}
          isSaving={isSavingMusic}
          onClose={() => setIsMusicOpen(false)}
          onGenerate={handleGenerateMusic}
          onRemove={() => handleUpdateMusic(null)}
          onSave={handleUpdateMusic}
        />
      ) : null}
      {isTextOpen ? (
        <StitchTextSettingsDialog
          stitch={stitch}
          error={textError}
          isSaving={isSavingText}
          onClose={() => setIsTextOpen(false)}
          onSave={handleUpdateTextOverlay}
        />
      ) : null}
    </>
  );
}
