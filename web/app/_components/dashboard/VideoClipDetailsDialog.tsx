"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { ClipPerformanceScoreDetails } from "@/app/_components/dashboard/ClipPerformanceScoreDetails";
import { CliprMusicControls } from "@/app/_components/dashboard/CliprMusicControls";
import { MediaActionButtonList } from "@/app/_components/dashboard/MediaActionButtonList";
import { VideoClipMusicPreview } from "@/app/_components/dashboard/VideoClipMusicPreview";
import { VideoCutEditor } from "@/app/_components/cuts/VideoCutEditor";
import { VideoTrimEditor } from "@/app/_components/trim/VideoTrimEditor";
import { AssetTagList } from "@/app/_components/uploads/AssetTagList";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { MediaCardActionMenuItem } from "@/app/_components/ui/MediaCardActionMenu";
import { useVideoClipDetailsMusic } from "@/lib/clipstitchr/hooks/useVideoClipDetailsMusic";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import type { VideoClipDetailsMusicEditor } from "@/lib/clipstitchr/types/VideoClipDetailsMusicEditor";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clamp } from "@/lib/clipstitchr/utils/clamp";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";
import { getQuickEditSuggestionsWithReplacedRemoveRanges } from "@/lib/clipstitchr/utils/getQuickEditSuggestionsWithReplacedRemoveRanges";
import { getVideoClipBadgeLabel } from "@/lib/clipstitchr/utils/getVideoClipBadgeLabel";
import { normalizeQuickEditRemoveRanges } from "@/lib/clipstitchr/utils/normalizeQuickEditRemoveRanges";

type VideoClipDetailsTrimEditor = {
  initialTrimRange: VideoTrimRange;
  saveLabel: string;
  title: string;
  onSave: (trimRange: VideoTrimRange) => void | Promise<void>;
};

type VideoClipDetailsCutEditor = {
  initialRemoveRanges: QuickEditRemoveRange[];
  onSave: (removeRanges: QuickEditRemoveRange[]) => void | Promise<void>;
};

type VideoClipDetailsSeekRequest = {
  id: number;
  seconds: number;
};

type VideoClipDetailsDialogProps = {
  actionItems?: MediaCardActionMenuItem[];
  clip: VideoClipMetadata;
  cutEditor?: VideoClipDetailsCutEditor;
  productName?: string;
  initialControlsEditorOpen?: boolean;
  isLoading: boolean;
  musicEditor?: VideoClipDetailsMusicEditor;
  posterUrl: string | null;
  quickEdit?: QuickEditSuggestions | null;
  trimEditor?: VideoClipDetailsTrimEditor;
  videoUrl: string | null;
  onClose: () => void;
  onLoadPreview: () => void;
};

export function VideoClipDetailsDialog({
  actionItems = [],
  clip,
  cutEditor,
  productName,
  initialControlsEditorOpen = false,
  isLoading,
  musicEditor,
  posterUrl,
  quickEdit = null,
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
  const [activeRemoveRanges, setActiveRemoveRanges] = useState(() =>
    normalizeQuickEditRemoveRanges(
      cutEditor?.initialRemoveRanges ?? quickEdit?.removeRanges ?? [],
      clip.duration,
    ),
  );
  const [savedRemoveRanges, setSavedRemoveRanges] = useState(() =>
    normalizeQuickEditRemoveRanges(
      cutEditor?.initialRemoveRanges ?? quickEdit?.removeRanges ?? [],
      clip.duration,
    ),
  );
  const [isControlsEditorOpen, setIsControlsEditorOpen] = useState(
    Boolean((trimEditor || cutEditor || musicEditor) && initialControlsEditorOpen),
  );
  const [cutPreviewPlayheadSeconds, setCutPreviewPlayheadSeconds] = useState(
    activeTrimRange.start,
  );
  const [cutPreviewSeekRequest, setCutPreviewSeekRequest] =
    useState<VideoClipDetailsSeekRequest | null>(null);
  const musicState = useVideoClipDetailsMusic({ clip, musicEditor });
  const activeQuickEdit = getQuickEditSuggestionsWithReplacedRemoveRanges({
    duration: clip.duration,
    quickEdit: quickEdit ?? undefined,
    removeRanges: activeRemoveRanges,
  });
  const displayDuration = getQuickEditPlaybackDuration(
    activeTrimRange,
    clip.duration,
    activeRemoveRanges,
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
    setActiveRemoveRanges(savedRemoveRanges);
    setCutPreviewPlayheadSeconds(savedTrimRange.start);
  };

  const handleActiveTrimRangeChange = (trimRange: VideoTrimRange) => {
    setActiveTrimRange(trimRange);
    setCutPreviewPlayheadSeconds((currentTime) =>
      clamp(currentTime, trimRange.start, trimRange.end),
    );
  };

  const handleSaveTrim = async (trimRange: VideoTrimRange) => {
    if (!trimEditor) {
      return;
    }

    const clampedTrimRange = clampVideoTrimRange(trimRange, clip.duration);

    await trimEditor.onSave(clampedTrimRange);
    setActiveTrimRange(clampedTrimRange);
    setSavedTrimRange(clampedTrimRange);
    setCutPreviewPlayheadSeconds((currentTime) =>
      clamp(currentTime, clampedTrimRange.start, clampedTrimRange.end),
    );
  };
  const handleSaveCuts = async (removeRanges: QuickEditRemoveRange[]) => {
    if (!cutEditor) {
      return;
    }

    const normalizedRemoveRanges = normalizeQuickEditRemoveRanges(
      removeRanges,
      clip.duration,
    );

    await cutEditor.onSave(normalizedRemoveRanges);
    setActiveRemoveRanges(normalizedRemoveRanges);
    setSavedRemoveRanges(normalizedRemoveRanges);
  };
  const handleCutPreviewSeek = (seconds: number) => {
    const clampedSeconds = clamp(seconds, activeTrimRange.start, activeTrimRange.end);

    setCutPreviewPlayheadSeconds(clampedSeconds);
    setCutPreviewSeekRequest((currentRequest) => ({
      id: (currentRequest?.id ?? 0) + 1,
      seconds: clampedSeconds,
    }));
  };
  const handlePreviewSourceTimeChange = (sourceTime: number) => {
    setCutPreviewPlayheadSeconds(clamp(sourceTime, 0, clip.duration));
  };
  const controlLabels = [
    trimEditor ? "trim" : null,
    cutEditor ? "cuts" : null,
    musicEditor ? "music" : null,
  ].filter(Boolean) as string[];
  const controlsLabel = controlLabels
    .map((label, index) =>
      index === 0 ? `${label.charAt(0).toUpperCase()}${label.slice(1)}` : label,
    )
    .join(" & ");

  return (
    <div
      className="dashboard-dialog-viewport"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-details-dialog-title"
        className="flex max-h-full min-h-0 w-full max-w-[calc(100vw-1rem)] min-w-0 flex-col overflow-hidden rounded-lg bg-white shadow-xl sm:max-w-4xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex min-w-0 shrink-0 items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
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
        </header>
        <div className="grid min-h-0 min-w-0 max-w-full gap-4 overflow-x-hidden overflow-y-auto p-4 sm:gap-5 sm:p-5 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
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
            quickEdit={activeQuickEdit}
            seekRequest={cutPreviewSeekRequest}
            sourceDuration={clip.duration}
            trimRange={activeTrimRange}
            onLoadPreview={onLoadPreview}
            onSourceTimeChange={cutEditor ? handlePreviewSourceTimeChange : undefined}
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
              {trimEditor || cutEditor || musicEditor ? (
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
                    onChange={handleActiveTrimRangeChange}
                    onSave={handleSaveTrim}
                  />
                ) : null}
                {cutEditor ? (
                  <VideoCutEditor
                    duration={clip.duration}
                    playheadSeconds={cutPreviewPlayheadSeconds}
                    title="Cuts"
                    saveLabel="Save cuts"
                    trimRange={activeTrimRange}
                    value={activeRemoveRanges}
                    onCancel={handleCancelTrim}
                    onChange={setActiveRemoveRanges}
                    onSave={handleSaveCuts}
                    onSeek={handleCutPreviewSeek}
                  />
                ) : null}
                {musicEditor ? (
                  <CliprMusicControls
                    enabled={musicState.musicEnabled}
                    error={musicState.error}
                    hasUnsavedChanges={musicState.hasUnsavedChanges}
                    isLoadingPreview={musicState.isMusicLoading}
                    isSaving={musicState.isSaving}
                    music={musicState.music}
                    volume={musicState.musicVolume}
                    onEnabledChange={musicState.setMusicEnabled}
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
