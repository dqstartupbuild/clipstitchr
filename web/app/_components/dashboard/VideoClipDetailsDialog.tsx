"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { ClipPerformanceScoreDetails } from "@/app/_components/dashboard/ClipPerformanceScoreDetails";
import { CliprMusicControls } from "@/app/_components/dashboard/CliprMusicControls";
import { MediaActionButtonList } from "@/app/_components/dashboard/MediaActionButtonList";
import { VideoClipMusicPreview } from "@/app/_components/dashboard/VideoClipMusicPreview";
import { VideoTrimEditor } from "@/app/_components/trim/VideoTrimEditor";
import { AssetTagList } from "@/app/_components/uploads/AssetTagList";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { MediaCardActionMenuItem } from "@/app/_components/ui/MediaCardActionMenu";
import { useVideoClipDetailsMusic } from "@/lib/clipstitchr/hooks/useVideoClipDetailsMusic";
import type { VideoClipDetailsMusicEditor } from "@/lib/clipstitchr/types/VideoClipDetailsMusicEditor";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getVideoClipBadgeLabel } from "@/lib/clipstitchr/utils/getVideoClipBadgeLabel";
import { getVideoTrimDisplayDuration } from "@/lib/clipstitchr/utils/getVideoTrimDisplayDuration";

type VideoClipDetailsTrimEditor = {
  initialTrimRange: VideoTrimRange;
  saveLabel: string;
  title: string;
  onSave: (trimRange: VideoTrimRange) => void | Promise<void>;
};

type VideoClipDetailsDialogProps = {
  actionItems?: MediaCardActionMenuItem[];
  clip: VideoClipMetadata;
  productName?: string;
  initialControlsEditorOpen?: boolean;
  isLoading: boolean;
  musicEditor?: VideoClipDetailsMusicEditor;
  posterUrl: string | null;
  trimEditor?: VideoClipDetailsTrimEditor;
  videoUrl: string | null;
  onClose: () => void;
  onLoadPreview: () => void;
};

export function VideoClipDetailsDialog({
  actionItems = [],
  clip,
  productName,
  initialControlsEditorOpen = false,
  isLoading,
  musicEditor,
  posterUrl,
  trimEditor,
  videoUrl,
  onClose,
  onLoadPreview,
}: VideoClipDetailsDialogProps) {
  const defaultTrimRange = getDefaultVideoTrimRange(clip);
  const initialTrimRange = trimEditor?.initialTrimRange ?? defaultTrimRange;
  const [activeTrimRange, setActiveTrimRange] = useState(() =>
    clampVideoTrimRange(initialTrimRange, clip.duration),
  );
  const [savedTrimRange, setSavedTrimRange] = useState(() =>
    clampVideoTrimRange(initialTrimRange, clip.duration),
  );
  const [isControlsEditorOpen, setIsControlsEditorOpen] = useState(
    Boolean((trimEditor || musicEditor) && initialControlsEditorOpen),
  );
  const musicState = useVideoClipDetailsMusic({ clip, musicEditor });
  const displayDuration = getVideoTrimDisplayDuration(
    clip.duration,
    activeTrimRange,
  );
  const musicDetail = musicState.music
    ? musicState.musicEnabled
      ? `Enabled at ${Math.round(musicState.musicVolume * 100)}%`
      : "Attached but disabled"
    : undefined;
  const detailItems = [
    { label: "Clipr hook", value: clip.cliprMetadata?.filledHook },
    { label: "Clipr product", value: clip.cliprMetadata?.productName },
    { label: "Linked product", value: productName },
    { label: "Clipr music", value: musicDetail },
    { label: "Description", value: clip.videoDescription },
    { label: "Product description", value: clip.productDescription },
    { label: "Main person", value: clip.mainPersonDescription },
    { label: "Action", value: clip.poseDescription },
    { label: "Outfit", value: clip.outfitDescription },
    { label: "Location", value: clip.locationDescription },
  ].flatMap((item) =>
    item.value?.trim()
      ? [
          {
            label: item.label,
            value: item.value.trim(),
          },
        ]
      : [],
  );

  const handleCancelTrim = () => {
    setActiveTrimRange(savedTrimRange);
  };

  const handleSaveTrim = async (trimRange: VideoTrimRange) => {
    if (!trimEditor) {
      return;
    }

    const clampedTrimRange = clampVideoTrimRange(trimRange, clip.duration);

    await trimEditor.onSave(clampedTrimRange);
    setActiveTrimRange(clampedTrimRange);
    setSavedTrimRange(clampedTrimRange);
  };
  const controlsLabel =
    trimEditor && musicEditor ? "Trim & music" : trimEditor ? "Trim" : "Music";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 px-2 py-3 sm:items-center sm:px-4 sm:py-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-details-dialog-title"
        className="max-h-full w-full max-w-[calc(100vw-1rem)] min-w-0 overflow-x-hidden overflow-y-auto rounded-lg bg-white shadow-xl sm:max-w-4xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex min-w-0 items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              Clip details
            </p>
            <h2
              id="video-details-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {clip.name}
            </h2>
            <MediaActionButtonList items={actionItems} className="mt-3" />
          </div>
          <IconButton
            type="button"
            label="Close clip details"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="grid min-w-0 max-w-full gap-4 p-4 sm:gap-5 sm:p-5 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <VideoClipMusicPreview
            src={videoUrl}
            posterSrc={posterUrl}
            label={clip.name}
            autoPlay
            hasSourceAudio={clip.hasAudio}
            isLoading={isLoading}
            musicBlob={musicState.musicBlob}
            musicEnabled={musicState.musicEnabled}
            musicVolume={musicState.musicVolume}
            trimRange={activeTrimRange}
            onLoadPreview={onLoadPreview}
          />
          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-semibold text-accent-dark">
                  {getVideoClipBadgeLabel(clip)}
                </span>
                <span className="text-xs font-semibold text-text-tertiary">
                  {clip.hasAudio ? "Audio" : "No audio"}
                </span>
              </div>
              {trimEditor || musicEditor ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<SlidersHorizontal aria-hidden className="h-4 w-4" />}
                  onClick={() => {
                    if (isControlsEditorOpen) {
                      handleCancelTrim();
                    }

                    setIsControlsEditorOpen((isOpen) => !isOpen);
                  }}
                >
                  {controlsLabel}
                </Button>
              ) : null}
            </div>
            {isControlsEditorOpen ? (
              <div className="flex min-w-0 flex-col gap-3">
                {trimEditor ? (
                  <VideoTrimEditor
                    duration={clip.duration}
                    title={trimEditor.title}
                    saveLabel={trimEditor.saveLabel}
                    value={activeTrimRange}
                    onCancel={handleCancelTrim}
                    onChange={setActiveTrimRange}
                    onSave={handleSaveTrim}
                  />
                ) : null}
                {musicEditor ? (
                  <CliprMusicControls
                    enabled={musicState.musicEnabled}
                    error={musicState.error}
                    hasUnsavedChanges={musicState.hasUnsavedChanges}
                    isGenerating={musicState.isGenerating}
                    isLoadingPreview={musicState.isMusicLoading}
                    isSaving={musicState.isSaving}
                    music={musicState.music}
                    volume={musicState.musicVolume}
                    onEnabledChange={musicState.setMusicEnabled}
                    onGenerate={() => void musicState.generateMusic()}
                    onRemove={() => void musicState.removeMusic()}
                    onSave={() => void musicState.saveMusic()}
                    onSelectTrack={(track) =>
                      void musicState.selectMusicTrack(track)
                    }
                    onVolumeChange={musicState.setMusicVolume}
                  />
                ) : null}
              </div>
            ) : null}
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                Title
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-text-primary">
                {clip.name}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                Tags
              </p>
              <AssetTagList
                tags={clip.tags}
                className="mt-2"
                maxVisible={12}
                requiredTag={clip.clipType}
              />
            </div>
            <ClipPerformanceScoreDetails score={clip.performanceScore} />
            {detailItems.map((item) => (
              <div key={item.label} className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                  {item.label}
                </p>
                <p className="mt-1 break-words text-sm leading-6 text-text-secondary">
                  {item.value}
                </p>
              </div>
            ))}
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                File
              </p>
              <p className="mt-1 break-words text-sm text-text-secondary [overflow-wrap:anywhere]">
                {clip.width} x {clip.height} .{" "}
                {formatDuration(displayDuration)} total . {formatBytes(clip.size)}
              </p>
              <p className="mt-1 truncate text-xs text-text-tertiary">
                {clip.originalName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
