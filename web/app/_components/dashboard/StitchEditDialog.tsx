"use client";

import { Music2, Save, Type, X } from "lucide-react";
import { useState } from "react";
import { StitchSequencePreview } from "@/app/_components/dashboard/StitchSequencePreview";
import { TextOverlayEditor } from "@/app/_components/stitchr/TextOverlayEditor";
import { MusicSelectorButton } from "@/app/_components/music/MusicSelectorButton";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { createStitchMusicMetadataFromSharedTrack } from "@/lib/clipstitchr/utils/createStitchMusicMetadataFromSharedTrack";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";
import { getStitchTrimRangeLabel } from "@/lib/clipstitchr/utils/getStitchTrimRangeLabel";

type StitchEditDialogProps = {
  demoClip: VideoClip | null;
  isGeneratingMusic: boolean;
  isLoadingPreview: boolean;
  isSavingMusic: boolean;
  isSavingText: boolean;
  musicError: string | null;
  posterUrl: string | null;
  previewError: string | null;
  stitch: Stitch;
  textError: string | null;
  ugcClip: VideoClip | null;
  onClose: () => void;
  onGenerateMusic: () => Promise<StitchMusicMetadata | null>;
  onLoadPreview: () => void;
  onRemoveMusic: () => Promise<void>;
  onSaveMusic: (music: StitchMusicMetadata) => Promise<void>;
  onSaveTextOverlay: (textOverlay: TextOverlay | null) => Promise<void>;
};

export function StitchEditDialog({
  demoClip,
  isGeneratingMusic,
  isLoadingPreview,
  isSavingMusic,
  isSavingText,
  musicError,
  posterUrl,
  previewError,
  stitch,
  textError,
  ugcClip,
  onClose,
  onGenerateMusic,
  onLoadPreview,
  onRemoveMusic,
  onSaveMusic,
  onSaveTextOverlay,
}: StitchEditDialogProps) {
  const [textOverlay, setTextOverlay] = useState<TextOverlay | null>(
    stitch.textOverlay ?? null,
  );
  const [music, setMusic] = useState<StitchMusicMetadata | null>(
    stitch.music ?? null,
  );
  const [enabled, setEnabled] = useState(music?.enabled ?? true);
  const [volume, setVolume] = useState(music?.volume ?? 1);
  const ugcDuration = stitch.ugcTrimRange
    ? getPlaybackRateDuration(stitch.ugcTrimRange, stitch.ugcPlaybackRate)
    : 0;
  const fileSizeLabel = stitch.size
    ? formatBytes(stitch.size)
    : "Ready to download";

  const handleSaveText = async () => {
    const nextTextOverlay =
      textOverlay && textOverlay.text.trim().length > 0
        ? clampTextOverlay(textOverlay, stitch.duration)
        : null;

    try {
      await onSaveTextOverlay(nextTextOverlay);
      setTextOverlay(nextTextOverlay);
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
              demoClip={demoClip}
              isLoading={isLoadingPreview}
              posterUrl={posterUrl}
              stitch={{
                ...stitch,
                music: music ?? undefined,
                textOverlay: textOverlay ?? undefined,
              }}
              ugcClip={ugcClip}
              onLoadPreview={onLoadPreview}
              onTextOverlayChange={setTextOverlay}
            />
            {previewError ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {previewError}
              </p>
            ) : null}
            <div className="rounded-lg border border-border bg-surface-elevated p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>STITCH</Badge>
                <span className="text-xs font-semibold text-text-tertiary">
                  {formatDuration(stitch.duration)}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-text-primary">
                {stitch.ugcClipName} to {stitch.demoClipName}
              </p>
              <p className="mt-2 text-xs font-semibold text-text-tertiary">
                UGC {getStitchTrimRangeLabel(stitch.ugcTrimRange)} . Demo{" "}
                {getStitchTrimRangeLabel(stitch.demoTrimRange)}
              </p>
              <p className="mt-2 text-xs text-text-tertiary">
                {stitch.width} x {stitch.height} . {fileSizeLabel}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
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
                textOverlay={textOverlay}
                totalDuration={stitch.duration}
                ugcDuration={ugcDuration}
                currentTime={0}
                onChange={setTextOverlay}
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
