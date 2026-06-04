"use client";

import { Music2, Save, Type, X } from "lucide-react";
import { useMemo, useState } from "react";
import { StitchSourceSettingsPanel } from "@/app/_components/dashboard/StitchSourceSettingsPanel";
import { StitchSequencePreview } from "@/app/_components/dashboard/StitchSequencePreview";
import { TextOverlayEditor } from "@/app/_components/stitchr/TextOverlayEditor";
import { MusicSelectorButton } from "@/app/_components/music/MusicSelectorButton";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import type { StitchPreviewErrorState } from "@/lib/clipstitchr/types/StitchPreviewErrorState";
import type { StitchPreviewSources } from "@/lib/clipstitchr/types/StitchPreviewSources";
import type { StitchSourceSettingsUpdate } from "@/lib/clipstitchr/types/StitchSourceSettingsUpdate";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import { clampTextOverlays } from "@/lib/clipstitchr/utils/clampTextOverlays";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { createStitchPreviewCacheKey } from "@/lib/clipstitchr/utils/createStitchPreviewCacheKey";
import { createStitchMusicMetadataFromSharedTrack } from "@/lib/clipstitchr/utils/createStitchMusicMetadataFromSharedTrack";
import { findVideoClipMetadataById } from "@/lib/clipstitchr/utils/findVideoClipMetadataById";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getDownloadFileName } from "@/lib/clipstitchr/utils/getDownloadFileName";
import { getNonEmptyTextOverlays } from "@/lib/clipstitchr/utils/getNonEmptyTextOverlays";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";
import { getStitchIsLongr } from "@/lib/clipstitchr/utils/getStitchIsLongr";
import { getStitchTrimRangeLabel } from "@/lib/clipstitchr/utils/getStitchTrimRangeLabel";
import { getTextOverlayList } from "@/lib/clipstitchr/utils/getTextOverlayList";

type StitchEditDialogProps = {
  demoClips: VideoClipMetadata[];
  isGeneratingMusic: boolean;
  isLoadingPreview: boolean;
  isSavingMusic: boolean;
  isSavingSourceSettings: boolean;
  isSavingText: boolean;
  musicError: string | null;
  posterUrl: string | null;
  previewErrorState: StitchPreviewErrorState | null;
  previewSources: StitchPreviewSources | null;
  sourceSettingsError: string | null;
  stitch: Stitch;
  textError: string | null;
  ugcClips: VideoClipMetadata[];
  onClose: () => void;
  onGenerateMusic: () => Promise<StitchMusicMetadata | null>;
  onLoadPreview: (ugcClipId?: string, demoClipId?: string) => void;
  onRemoveMusic: () => Promise<void>;
  onSaveMusic: (music: StitchMusicMetadata) => Promise<void>;
  onSaveSourceSettings: (
    update: StitchSourceSettingsUpdate,
  ) => Promise<void>;
  onSaveTextOverlay: (
    textOverlay: TextOverlay | TextOverlay[] | null,
    stitchOverride?: Stitch,
  ) => Promise<void>;
};

export function StitchEditDialog({
  demoClips,
  isGeneratingMusic,
  isLoadingPreview,
  isSavingMusic,
  isSavingSourceSettings,
  isSavingText,
  musicError,
  posterUrl,
  previewErrorState,
  previewSources,
  sourceSettingsError,
  stitch,
  textError,
  ugcClips,
  onClose,
  onGenerateMusic,
  onLoadPreview,
  onRemoveMusic,
  onSaveMusic,
  onSaveSourceSettings,
  onSaveTextOverlay,
}: StitchEditDialogProps) {
  const isLongrStitch = getStitchIsLongr(stitch);
  const currentUgcFallbackClip = {
    id: stitch.ugcClipId,
    name: stitch.ugcClipName,
  };
  const currentDemoFallbackClip = {
    id: stitch.demoClipId,
    name: stitch.demoClipName,
  };
  const sourceUgcClips = useMemo(
    () =>
      previewSources?.ugcClip
        ? [previewSources.ugcClip, ...ugcClips]
        : ugcClips,
    [previewSources, ugcClips],
  );
  const sourceDemoClips = useMemo(
    () =>
      previewSources?.demoClip
        ? [previewSources.demoClip, ...demoClips]
        : demoClips,
    [previewSources, demoClips],
  );
  const initialUgcClip = findVideoClipMetadataById(
    sourceUgcClips,
    stitch.ugcClipId,
  );
  const initialDemoClip = findVideoClipMetadataById(
    sourceDemoClips,
    stitch.demoClipId,
  );
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>(
    () => getTextOverlayList(stitch.textOverlays, stitch.textOverlay),
  );
  const [activeTextOverlayId, setActiveTextOverlayId] = useState<string | null>(
    null,
  );
  const [music, setMusic] = useState<StitchMusicMetadata | null>(
    stitch.music ?? null,
  );
  const [enabled, setEnabled] = useState(music?.enabled ?? true);
  const [volume, setVolume] = useState(music?.volume ?? 1);
  const [selectedUgcClipId, setSelectedUgcClipId] = useState(
    stitch.ugcClipId,
  );
  const [selectedDemoClipId, setSelectedDemoClipId] = useState(
    stitch.demoClipId,
  );
  const [ugcTrimRange, setUgcTrimRange] = useState(() =>
    initialUgcClip
      ? clampVideoTrimRange(
          stitch.ugcTrimRange ?? getDefaultVideoTrimRange(initialUgcClip),
          initialUgcClip.duration,
        )
      : (stitch.ugcTrimRange ?? { start: 0, end: 0 }),
  );
  const [demoTrimRange, setDemoTrimRange] = useState(() =>
    initialDemoClip
      ? clampVideoTrimRange(
          stitch.demoTrimRange ?? getDefaultVideoTrimRange(initialDemoClip),
          initialDemoClip.duration,
        )
      : (stitch.demoTrimRange ?? { start: 0, end: 0 }),
  );
  const [ugcPlaybackRate, setUgcPlaybackRate] = useState<VideoPlaybackRate>(
    stitch.ugcPlaybackRate ?? 1,
  );
  const [demoPlaybackRate, setDemoPlaybackRate] = useState<VideoPlaybackRate>(
    stitch.demoPlaybackRate ?? 1,
  );
  const selectedUgcClip = findVideoClipMetadataById(
    sourceUgcClips,
    selectedUgcClipId,
  );
  const selectedDemoClip = findVideoClipMetadataById(
    sourceDemoClips,
    selectedDemoClipId,
  );
  const clampedUgcTrimRange = selectedUgcClip
    ? clampVideoTrimRange(ugcTrimRange, selectedUgcClip.duration)
    : ugcTrimRange;
  const clampedDemoTrimRange = selectedDemoClip
    ? clampVideoTrimRange(demoTrimRange, selectedDemoClip.duration)
    : demoTrimRange;
  const ugcDuration = selectedUgcClip
    ? getPlaybackRateDuration(clampedUgcTrimRange, ugcPlaybackRate)
    : 0;
  const demoDuration = selectedDemoClip
    ? getPlaybackRateDuration(clampedDemoTrimRange, demoPlaybackRate)
    : 0;
  const sourceDuration = ugcDuration + demoDuration;
  const selectedPreviewCacheKey = createStitchPreviewCacheKey(
    stitch.id,
    selectedUgcClipId,
    selectedDemoClipId,
  );
  const selectedPreviewSources =
    previewSources?.cacheKey === selectedPreviewCacheKey
      ? previewSources
      : null;
  const selectedPreviewError =
    previewErrorState?.cacheKey === selectedPreviewCacheKey
      ? previewErrorState.message
      : null;
  const draftStitch: Stitch = {
    ...stitch,
    demoClipId: selectedDemoClipId,
    demoClipName: selectedDemoClip?.name ?? stitch.demoClipName,
    demoPlaybackRate,
    demoTrimRange: clampedDemoTrimRange,
    duration: sourceDuration || stitch.duration,
    music: music ?? undefined,
    textOverlay: textOverlays[0],
    textOverlays: textOverlays.length ? textOverlays : undefined,
    ugcClipId: selectedUgcClipId,
    ugcClipName: selectedUgcClip?.name ?? stitch.ugcClipName,
    ugcPlaybackRate,
    ugcTrimRange: clampedUgcTrimRange,
  };
  const fileSizeLabel = stitch.size
    ? formatBytes(stitch.size)
    : "Ready to download";

  const handleSaveText = async () => {
    const nextTextOverlays = getNonEmptyTextOverlays(
      clampTextOverlays(textOverlays, draftStitch.duration),
    );

    try {
      await onSaveTextOverlay(
        nextTextOverlays.length ? nextTextOverlays : null,
        draftStitch,
      );
      setTextOverlays(nextTextOverlays);
    } catch {
      return;
    }
  };
  const handleSelectUgcClip = (clipId: string) => {
    const nextClip = findVideoClipMetadataById(sourceUgcClips, clipId);

    setSelectedUgcClipId(clipId);

    if (nextClip) {
      setUgcTrimRange(getDefaultVideoTrimRange(nextClip));
    }

    onLoadPreview(clipId, selectedDemoClipId);
  };
  const handleSelectDemoClip = (clipId: string) => {
    const nextClip = findVideoClipMetadataById(sourceDemoClips, clipId);

    setSelectedDemoClipId(clipId);

    if (nextClip) {
      setDemoTrimRange(getDefaultVideoTrimRange(nextClip));
    }

    onLoadPreview(selectedUgcClipId, clipId);
  };
  const handleSaveSourceSettings = async () => {
    if (!selectedUgcClip || !selectedDemoClip) {
      return;
    }

    const nextName =
      selectedUgcClip.id === stitch.ugcClipId &&
      selectedDemoClip.id === stitch.demoClipId
        ? stitch.name
        : getDownloadFileName(selectedUgcClip.name, selectedDemoClip.name);

    try {
      await onSaveSourceSettings({
        demoClipId: selectedDemoClip.id,
        demoClipName: selectedDemoClip.name,
        demoPlaybackRate,
        demoTrimRange: clampedDemoTrimRange,
        duration: sourceDuration,
        name: nextName,
        ugcClipId: selectedUgcClip.id,
        ugcClipName: selectedUgcClip.name,
        ugcPlaybackRate,
        ugcTrimRange: clampedUgcTrimRange,
      });
      setDemoTrimRange(clampedDemoTrimRange);
      setUgcTrimRange(clampedUgcTrimRange);
    } catch {
      return;
    }
  };
  const handleGenerateMusic = async () => {
    const nextMusic = await onGenerateMusic();

    if (nextMusic) {
      setMusic(nextMusic);
      setEnabled(nextMusic.enabled);
      setVolume(nextMusic.volume);
    }
  };
  const handleSelectTrack = async (track: SharedMusicTrack) => {
    const nextMusic = createStitchMusicMetadataFromSharedTrack(track);

    try {
      await onSaveMusic(nextMusic);
      setMusic(nextMusic);
      setEnabled(nextMusic.enabled);
      setVolume(nextMusic.volume);
    } catch {
      return;
    }
  };
  const handleRemoveMusic = async () => {
    try {
      await onRemoveMusic();
      setMusic(null);
    } catch {
      return;
    }
  };
  const handleSaveMusic = async () => {
    if (!music) {
      return;
    }

    const nextMusic = {
      ...music,
      enabled,
      volume,
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSaveMusic(nextMusic);
      setMusic(nextMusic);
    } catch {
      return;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stitch-edit-dialog-title"
        className="max-h-full w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              Edit stitch
            </p>
            <h2
              id="stitch-edit-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {stitch.name}
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close stitch editor"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <StitchSequencePreview
              demoClip={selectedPreviewSources?.demoClip ?? null}
              isLoading={isLoadingPreview}
              posterUrl={posterUrl}
              stitch={draftStitch}
              ugcClip={selectedPreviewSources?.ugcClip ?? null}
              onLoadPreview={() =>
                onLoadPreview(selectedUgcClipId, selectedDemoClipId)
              }
              onTextOverlayChange={setTextOverlays}
            />
            {selectedPreviewError ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {selectedPreviewError}
              </p>
            ) : null}
            <div className="rounded-lg border border-border bg-surface-elevated p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>STITCH</Badge>
                <span className="text-xs font-semibold text-text-tertiary">
                  {formatDuration(draftStitch.duration)}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-text-primary">
                {draftStitch.ugcClipName} to {draftStitch.demoClipName}
              </p>
              <p className="mt-2 text-xs font-semibold text-text-tertiary">
                UGC {getStitchTrimRangeLabel(draftStitch.ugcTrimRange)} . Demo{" "}
                {getStitchTrimRangeLabel(draftStitch.demoTrimRange)}
              </p>
              <p className="mt-2 text-xs text-text-tertiary">
                {stitch.width} x {stitch.height} . {fileSizeLabel}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {!isLongrStitch ? (
              <StitchSourceSettingsPanel
                canSave={Boolean(selectedUgcClip && selectedDemoClip)}
                demoClips={demoClips}
                demoFallbackClip={currentDemoFallbackClip}
                demoPlaybackRate={demoPlaybackRate}
                demoTrimDuration={selectedDemoClip?.duration ?? 0}
                demoTrimRange={clampedDemoTrimRange}
                error={sourceSettingsError}
                isSaving={isSavingSourceSettings}
                selectedDemoClipId={selectedDemoClipId}
                selectedUgcClipId={selectedUgcClipId}
                totalDuration={draftStitch.duration}
                ugcClips={ugcClips}
                ugcFallbackClip={currentUgcFallbackClip}
                ugcPlaybackRate={ugcPlaybackRate}
                ugcTrimDuration={selectedUgcClip?.duration ?? 0}
                ugcTrimRange={clampedUgcTrimRange}
                onDemoClipChange={handleSelectDemoClip}
                onDemoPlaybackRateChange={setDemoPlaybackRate}
                onDemoTrimChange={setDemoTrimRange}
                onSave={() => void handleSaveSourceSettings()}
                onUgcClipChange={handleSelectUgcClip}
                onUgcPlaybackRateChange={setUgcPlaybackRate}
                onUgcTrimChange={setUgcTrimRange}
              />
            ) : null}
            <section className="rounded-lg border border-border p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-text-primary">Text</h3>
                <Button
                  type="button"
                  size="sm"
                  icon={<Type aria-hidden className="h-4 w-4" />}
                  isLoading={isSavingText}
                  onClick={() => void handleSaveText()}
                >
                  Save text
                </Button>
              </div>
              {textError ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {textError}
                </div>
              ) : null}
              <TextOverlayEditor
                textOverlays={textOverlays}
                totalDuration={draftStitch.duration}
                ugcDuration={ugcDuration}
                currentTime={0}
                activeTextOverlayId={activeTextOverlayId}
                onActiveTextOverlayIdChange={setActiveTextOverlayId}
                onChange={setTextOverlays}
              />
            </section>
            <section className="rounded-lg border border-border p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-text-primary">Music</h3>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    icon={<Music2 aria-hidden className="h-4 w-4" />}
                    isLoading={isGeneratingMusic}
                    onClick={() => void handleGenerateMusic()}
                  >
                    {music ? "Generate new" : "Generate"}
                  </Button>
                  <MusicSelectorButton
                    source="stitchr"
                    selectedTrackId={music?.sharedTrackId}
                    onSelectTrack={handleSelectTrack}
                  />
                </div>
              </div>
              {musicError ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {musicError}
                </div>
              ) : null}
              {music ? (
                <div className="grid gap-3">
                  <label className="flex items-start gap-3 rounded-lg border border-border bg-surface-elevated p-3">
                    <input
                      type="checkbox"
                      checked={enabled}
                      className="mt-1 h-4 w-4 accent-accent"
                      onChange={(event) =>
                        setEnabled(event.currentTarget.checked)
                      }
                    />
                    <span className="text-sm leading-6 text-text-secondary">
                      Include music when exporting this stitch.
                    </span>
                  </label>
                  <label className="block rounded-lg border border-border bg-surface-elevated p-3">
                    <span className="text-sm font-semibold text-text-primary">
                      Music volume
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(volume * 100)}
                      className="mt-3 w-full accent-accent"
                      onChange={(event) =>
                        setVolume(Number(event.currentTarget.value) / 100)
                      }
                    />
                    <span className="mt-1 block text-xs font-semibold text-text-tertiary">
                      {Math.round(volume * 100)}%
                    </span>
                  </label>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="danger"
                      isLoading={isSavingMusic}
                      onClick={() => void handleRemoveMusic()}
                    >
                      Remove music
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      icon={<Save aria-hidden className="h-4 w-4" />}
                      isLoading={isSavingMusic}
                      onClick={() => void handleSaveMusic()}
                    >
                      Save music
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-slate-50 p-4 text-sm font-semibold text-text-tertiary">
                  No music is attached to this stitch.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
