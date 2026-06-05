"use client";

import {
  CheckCircle2,
  Download,
  Edit3,
  Play,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useCallback, useState } from "react";
import { StitchDetailsDialog } from "@/app/_components/dashboard/StitchDetailsDialog";
import { StitchEditDialog } from "@/app/_components/dashboard/StitchEditDialog";
import {
  MediaCardActionMenu,
  type MediaCardActionMenuItem,
} from "@/app/_components/ui/MediaCardActionMenu";
import { SelectionCheckboxButton } from "@/app/_components/ui/SelectionCheckboxButton";
import { createStitchExportBlob } from "@/lib/clipstitchr/client/createStitchExportBlob";
import { useLazyBlobObjectUrl } from "@/lib/clipstitchr/hooks/useLazyBlobObjectUrl";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import type { StitchPreviewErrorState } from "@/lib/clipstitchr/types/StitchPreviewErrorState";
import type { StitchPreviewSources } from "@/lib/clipstitchr/types/StitchPreviewSources";
import type { StitchSourceSettingsUpdate } from "@/lib/clipstitchr/types/StitchSourceSettingsUpdate";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { downloadBlob } from "@/lib/clipstitchr/utils/downloadBlob";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { createStitchPreviewCacheKey } from "@/lib/clipstitchr/utils/createStitchPreviewCacheKey";
import { getNonEmptyTextOverlays } from "@/lib/clipstitchr/utils/getNonEmptyTextOverlays";
import { getTextOverlayList } from "@/lib/clipstitchr/utils/getTextOverlayList";
import { getReuseStitchHref } from "@/lib/clipstitchr/utils/getReuseStitchHref";
import { capturePostHogException } from "@/lib/clipstitchr/analytics/capturePostHogException";
import { trackPostHogEvent } from "@/lib/clipstitchr/analytics/trackPostHogEvent";

type StitchCardProps = {
  stitch: Stitch;
  demoClips?: VideoClipMetadata[];
  isSelected?: boolean;
  isSelectionDisabled?: boolean;
  onDelete: (id: string) => void | Promise<void>;
  onGenerateMusic: (stitch: Stitch) => Promise<StitchMusicMetadata | null>;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onSelect?: () => void;
  onUpdateMusic: (
    stitch: Stitch,
    music: StitchMusicMetadata | null,
  ) => void | Promise<void>;
  onUpdateSourceSettings: (
    stitch: Stitch,
    update: StitchSourceSettingsUpdate,
  ) => void | Promise<void>;
  onUpdateTextOverlay: (
    stitch: Stitch,
    textOverlay: TextOverlay | TextOverlay[] | null,
  ) => void | Promise<void>;
  onUpdatePostedStatus: (
    stitch: Stitch,
    isPosted: boolean,
  ) => void | Promise<void>;
  ugcClips?: VideoClipMetadata[];
};

export function StitchCard({
  stitch,
  demoClips = [],
  isSelected = false,
  isSelectionDisabled = false,
  onDelete,
  onGenerateMusic,
  onLoadClip,
  onLoadPoster,
  onSelect,
  onUpdateMusic,
  onUpdatePostedStatus,
  onUpdateSourceSettings,
  onUpdateTextOverlay,
  ugcClips = [],
}: StitchCardProps) {
  const [previewState, setPreviewState] = useState<StitchPreviewSources | null>(
    null,
  );
  const [previewErrorState, setPreviewErrorState] =
    useState<StitchPreviewErrorState | null>(null);
  const previewCacheKey = createStitchPreviewCacheKey(
    stitch.id,
    stitch.ugcClipId,
    stitch.demoClipId,
  );
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
  const stitchTextOverlays = getTextOverlayList(
    stitch.textOverlays,
    stitch.textOverlay,
  );
  const hasTextOverlay =
    getNonEmptyTextOverlays(stitchTextOverlays).length > 0;
  const posterContentKey = JSON.stringify(
    stitch.textOverlays ?? stitch.textOverlay ?? null,
  );
  const posterUrl = useLazyBlobObjectUrl({
    cacheKey: stitch.posterObject?.key
      ? `${stitch.posterObject.key}:${stitch.posterVersion ?? 0}:${posterContentKey}`
      : stitch.ugcClipId,
    fallbackBlob: stitch.posterBlob,
    loadBlob: loadPosterBlob,
  });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [isSavingMusic, setIsSavingMusic] = useState(false);
  const [isSavingPostedStatus, setIsSavingPostedStatus] = useState(false);
  const [isSavingText, setIsSavingText] = useState(false);
  const [isSavingSourceSettings, setIsSavingSourceSettings] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [musicError, setMusicError] = useState<string | null>(null);
  const [postedStatusError, setPostedStatusError] = useState<string | null>(
    null,
  );
  const [textError, setTextError] = useState<string | null>(null);
  const [sourceSettingsError, setSourceSettingsError] = useState<string | null>(
    null,
  );
  const fileSizeLabel = stitch.size
    ? formatBytes(stitch.size)
    : "Ready to download";
  const isPosted = Boolean(stitch.isPosted);

  const loadPreview = async (
    ugcClipId = stitch.ugcClipId,
    demoClipId = stitch.demoClipId,
  ) => {
    const cacheKey = createStitchPreviewCacheKey(
      stitch.id,
      ugcClipId,
      demoClipId,
    );

    if (previewState?.cacheKey === cacheKey || isLoadingPreview) {
      return;
    }

    setIsLoadingPreview(true);
    setPreviewErrorState(null);

    try {
      const [ugcClip, demoClip] = await Promise.all([
        onLoadClip(ugcClipId),
        onLoadClip(demoClipId),
      ]);

      if (!ugcClip || !demoClip) {
        throw new Error("Unable to load the source videos for this stitch.");
      }

      setPreviewState({
        cacheKey,
        demoClip,
        ugcClip,
      });
    } catch (nextError) {
      setPreviewErrorState({
        cacheKey,
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
      has_text_overlay: hasTextOverlay,
    });

    if (shouldLoadPreview) {
      void loadPreview();
    }
  };
  const openEdit = () => {
    setIsDetailsOpen(false);
    setIsEditOpen(true);
    void loadPreview();
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
        has_text_overlay: hasTextOverlay,
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
  const handleUpdateTextOverlay = async (
    textOverlay: TextOverlay | TextOverlay[] | null,
    stitchOverride = stitch,
  ) => {
    setIsSavingText(true);
    setTextError(null);

    try {
      await onUpdateTextOverlay(stitchOverride, textOverlay);
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
  const handleUpdateSourceSettings = async (
    update: StitchSourceSettingsUpdate,
  ) => {
    setIsSavingSourceSettings(true);
    setSourceSettingsError(null);

    try {
      await onUpdateSourceSettings(stitch, update);
    } catch (nextError) {
      setSourceSettingsError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to update stitch sources.",
      );
      throw nextError;
    } finally {
      setIsSavingSourceSettings(false);
    }
  };
  const handleUpdatePostedStatus = async (nextIsPosted: boolean) => {
    setIsSavingPostedStatus(true);
    setPostedStatusError(null);

    try {
      await onUpdatePostedStatus(stitch, nextIsPosted);
      trackPostHogEvent(
        nextIsPosted ? "stitch_marked_posted" : "stitch_marked_unposted",
        {
          stitch_id: stitch.id,
          duration_seconds: stitch.duration,
          has_music: Boolean(stitch.music),
          has_text_overlay: hasTextOverlay,
        },
      );
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
  const actionItems: MediaCardActionMenuItem[] = [
    {
      label: "Reuse in Stitchr",
      href: getReuseStitchHref(stitch),
      icon: <RefreshCw aria-hidden className="h-4 w-4" />,
    },
    {
      label: "Download stitch",
      icon: <Download aria-hidden className="h-4 w-4" />,
      disabled: isDownloading,
      onClick: () => void handleDownload(),
    },
    {
      label: "Edit stitch",
      icon: <Edit3 aria-hidden className="h-4 w-4" />,
      onClick: openEdit,
    },
    {
      label: isPosted ? "Mark as active" : "Mark as posted",
      icon: isPosted ? (
        <RotateCcw aria-hidden className="h-4 w-4" />
      ) : (
        <CheckCircle2 aria-hidden className="h-4 w-4" />
      ),
      disabled: isSavingPostedStatus,
      onClick: () => void handleUpdatePostedStatus(!isPosted),
    },
    {
      label: "Delete stitch",
      variant: "danger",
      icon: <Trash2 aria-hidden className="h-4 w-4" />,
      onClick: () => {
        setIsDetailsOpen(false);
        trackPostHogEvent("stitch_deleted", {
          stitch_id: stitch.id,
          duration_seconds: stitch.duration,
          has_music: Boolean(stitch.music),
          has_text_overlay: hasTextOverlay,
        });
        void onDelete(stitch.id);
      },
    },
  ];

  return (
    <>
      <div
        className={[
          "mx-auto h-full w-full max-w-[280px] min-w-0 overflow-hidden rounded-lg border bg-white p-2 transition-colors",
          isSelected ? "border-accent ring-2 ring-accent/15" : "border-border",
        ].join(" ")}
      >
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
          <span
            className={[
              "pointer-events-none absolute left-2 top-2 max-w-[75%] truncate rounded-md border bg-white/95 px-2 py-1 text-[11px] font-bold leading-none shadow-sm shadow-slate-900/10",
              isPosted
                ? "border-emerald-200 text-emerald-700"
                : "border-purple-200 text-accent-dark",
            ].join(" ")}
          >
            {isPosted ? "POSTED" : "STITCH"}
          </span>
          {onSelect ? (
            <SelectionCheckboxButton
              isSelected={isSelected}
              label={`${isSelected ? "Deselect" : "Select"} ${stitch.name}`}
              disabled={isSelectionDisabled}
              className="absolute right-2 top-2 z-10"
              onClick={onSelect}
            />
          ) : null}
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
        {postedStatusError ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
            {postedStatusError}
          </p>
        ) : null}
      </div>
      {isDetailsOpen ? (
        <StitchDetailsDialog
          actionItems={actionItems}
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
      {isEditOpen ? (
        <StitchEditDialog
          demoClips={demoClips}
          isGeneratingMusic={isGeneratingMusic}
          isLoadingPreview={isLoadingPreview}
          isSavingMusic={isSavingMusic}
          isSavingSourceSettings={isSavingSourceSettings}
          isSavingText={isSavingText}
          musicError={musicError}
          posterUrl={posterUrl}
          previewErrorState={previewErrorState}
          previewSources={previewState}
          sourceSettingsError={sourceSettingsError}
          stitch={stitch}
          textError={textError}
          ugcClips={ugcClips}
          onClose={() => setIsEditOpen(false)}
          onGenerateMusic={handleGenerateMusic}
          onLoadPreview={(ugcClipId, demoClipId) => {
            void loadPreview(ugcClipId, demoClipId);
          }}
          onRemoveMusic={() => handleUpdateMusic(null)}
          onSaveMusic={handleUpdateMusic}
          onSaveSourceSettings={handleUpdateSourceSettings}
          onSaveTextOverlay={handleUpdateTextOverlay}
        />
      ) : null}
    </>
  );
}
