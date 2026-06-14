"use client";

import { Play } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { ClipPerformanceScoreBadge } from "@/app/_components/dashboard/ClipPerformanceScoreBadge";
import { VideoClipDetailsDialog } from "@/app/_components/dashboard/VideoClipDetailsDialog";
import { VideoClipEditDialog } from "@/app/_components/dashboard/VideoClipEditDialog";
import { SelectionCheckboxButton } from "@/app/_components/ui/SelectionCheckboxButton";
import {
  MediaCardActionMenu,
  type MediaCardActionMenuItem,
} from "@/app/_components/ui/MediaCardActionMenu";
import { useLazyBlobObjectUrl } from "@/lib/clipstitchr/hooks/useLazyBlobObjectUrl";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { VideoClipDetailsMusicEditor } from "@/lib/clipstitchr/types/VideoClipDetailsMusicEditor";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getVideoClipBadgeLabel } from "@/lib/clipstitchr/utils/getVideoClipBadgeLabel";
import { getVideoTrimDisplayDuration } from "@/lib/clipstitchr/utils/getVideoTrimDisplayDuration";

type OpenVideoClipDetailsOptions = {
  showEditDialog?: boolean;
  showControlsEditor?: boolean;
};

type VideoClipPreviewCardActions = {
  closeDetails: () => void;
  isLoading: boolean;
  loadFullClip: () => Promise<VideoClip | null>;
  openDetails: (options?: OpenVideoClipDetailsOptions) => void;
};

type VideoClipPreviewCardTrimEditor = {
  initialTrimRange: VideoTrimRange;
  saveLabel: string;
  title: string;
  onSave: (trimRange: VideoTrimRange) => void | Promise<void>;
};

type VideoClipPreviewCardMetadataEditor = {
  products?: ProductProfile[];
  onSave: (metadata: AssetMetadataUpdate) => void | Promise<void>;
};

type VideoClipPreviewCardProps = {
  clip: VideoClipMetadata;
  productName?: string;
  displayDuration?: number;
  isSelected?: boolean;
  isSelectionDisabled?: boolean;
  actions?: (actions: VideoClipPreviewCardActions) => MediaCardActionMenuItem[];
  footer?: (actions: VideoClipPreviewCardActions) => ReactNode;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onSelect?: () => void;
  cliprMusicEditor?: VideoClipDetailsMusicEditor;
  metadataEditor?: VideoClipPreviewCardMetadataEditor;
  trimEditor?: VideoClipPreviewCardTrimEditor;
};

export function VideoClipPreviewCard({
  clip,
  productName,
  displayDuration,
  isSelected = false,
  isSelectionDisabled = false,
  actions,
  footer,
  onLoadClip,
  onLoadPoster,
  onSelect,
  cliprMusicEditor,
  metadataEditor,
  trimEditor,
}: VideoClipPreviewCardProps) {
  const [loadedClipState, setLoadedClipState] = useState<{
    cacheKey: string;
    clip: VideoClip;
  } | null>(null);
  const [isClipLoading, setIsClipLoading] = useState(false);
  const [detailsMode, setDetailsMode] = useState<
    "details" | "controls" | "edit" | null
  >(null);
  const musicObjectKey = clip.cliprMetadata?.music?.audioObject.key;
  const musicEnabled = clip.cliprMetadata?.music?.enabled;
  const musicUpdatedAt = clip.cliprMetadata?.music?.updatedAt;
  const musicVolume = clip.cliprMetadata?.music?.volume;
  const clipCacheKey = [
    clip.id,
    clip.updatedAt,
    musicEnabled,
    musicObjectKey,
    musicUpdatedAt,
    musicVolume,
  ].join(":");
  const loadedClip =
    loadedClipState?.cacheKey === clipCacheKey ? loadedClipState.clip : null;
  const videoUrl = useObjectUrl(loadedClip?.blob);
  const loadPosterBlob = useCallback(
    () => onLoadPoster?.(clip.id) ?? Promise.resolve(null),
    [clip.id, onLoadPoster],
  );
  const posterUrl = useLazyBlobObjectUrl({
    cacheKey: clip.posterObject?.key,
    fallbackBlob: clip.posterBlob,
    loadBlob: loadPosterBlob,
  });
  const visibleDuration =
    displayDuration ??
    getVideoTrimDisplayDuration(clip.duration, getDefaultVideoTrimRange(clip));
  const loadFullClip = async () => {
    if (loadedClip) {
      return loadedClip;
    }

    setIsClipLoading(true);

    try {
      const nextClip = await onLoadClip(clip.id);

      setLoadedClipState(
        nextClip ? { cacheKey: clipCacheKey, clip: nextClip } : null,
      );
      return nextClip;
    } finally {
      setIsClipLoading(false);
    }
  };
  const openDetails = (options?: OpenVideoClipDetailsOptions) => {
    setDetailsMode(
      options?.showEditDialog
        ? "edit"
        : options?.showControlsEditor
          ? "controls"
          : "details",
    );
    void loadFullClip();
  };
  const closeDetails = () => {
    setDetailsMode(null);
  };
  const actionContext = {
    closeDetails,
    isLoading: isClipLoading,
    loadFullClip,
    openDetails,
  };
  const actionItems = actions?.(actionContext) ?? [];
  const footerContent = footer?.(actionContext);

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
            aria-label={`Open details for ${clip.name}`}
            className="group relative block aspect-square w-full text-left"
            onClick={() => openDetails()}
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
              clip.isPosted
                ? "border-emerald-200 text-emerald-700"
                : "border-purple-200 text-accent-dark",
            ].join(" ")}
          >
            {getVideoClipBadgeLabel(clip)}
          </span>
          {onSelect ? (
            <SelectionCheckboxButton
              isSelected={isSelected}
              label={`${isSelected ? "Deselect" : "Select"} ${clip.name}`}
              disabled={isSelectionDisabled && !isSelected}
              className="absolute right-2 top-2 z-10"
              onClick={onSelect}
            />
          ) : null}
        </div>
        <div className="mt-3 flex items-start justify-between gap-2">
          <button
            type="button"
            className="min-w-0 flex-1 rounded-md text-left outline-none transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={() => openDetails()}
          >
            <h3 className="truncate text-sm font-bold text-text-primary">
              {clip.name}
            </h3>
            <p className="mt-1 text-xs text-text-tertiary">
              {formatDuration(visibleDuration)} . {formatBytes(clip.size)}
            </p>
            {clip.performanceScore ? (
              <span className="mt-2 flex min-w-0">
                <ClipPerformanceScoreBadge score={clip.performanceScore} />
              </span>
            ) : null}
          </button>
          {actionItems.length ? (
            <MediaCardActionMenu
              label={`Actions for ${clip.name}`}
              items={actionItems}
            />
          ) : null}
        </div>
        {footerContent ? <div className="mt-4">{footerContent}</div> : null}
      </div>
      {detailsMode === "details" || detailsMode === "controls" ? (
        <VideoClipDetailsDialog
          actionItems={actionItems}
          clip={clip}
          productName={productName}
          initialControlsEditorOpen={detailsMode === "controls"}
          isLoading={isClipLoading}
          musicEditor={detailsMode === "controls" ? cliprMusicEditor : undefined}
          posterUrl={posterUrl}
          trimEditor={detailsMode === "controls" ? trimEditor : undefined}
          videoUrl={videoUrl}
          onClose={() => setDetailsMode(null)}
          onLoadPreview={() => {
            void loadFullClip();
          }}
        />
      ) : null}
      {detailsMode === "edit" && metadataEditor ? (
        <VideoClipEditDialog
          clip={clip}
          productName={productName}
          products={metadataEditor.products}
          isLoading={isClipLoading}
          musicEditor={cliprMusicEditor}
          posterUrl={posterUrl}
          trimEditor={trimEditor}
          videoUrl={videoUrl}
          onClose={() => setDetailsMode(null)}
          onLoadPreview={() => {
            void loadFullClip();
          }}
          onSaveMetadata={metadataEditor.onSave}
        />
      ) : null}
    </>
  );
}
