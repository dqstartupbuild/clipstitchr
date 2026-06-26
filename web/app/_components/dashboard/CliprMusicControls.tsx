"use client";

import { Save } from "lucide-react";
import { MusicSelectorButton } from "@/app/_components/music/MusicSelectorButton";
import { Button } from "@/app/_components/ui/Button";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";

type CliprMusicControlsProps = {
  enabled: boolean;
  error: string | null;
  hasUnsavedChanges?: boolean;
  isLoadingPreview: boolean;
  isSaving: boolean;
  music: CliprMusicMetadata | null;
  showSaveButton?: boolean;
  volume: number;
  onEnabledChange: (enabled: boolean) => void;
  onRemove: () => void;
  onSave: () => void;
  onSelectTrack: (track: SharedMusicTrack) => void | Promise<void>;
  onVolumeChange: (volume: number) => void;
};

export function CliprMusicControls({
  enabled,
  error,
  hasUnsavedChanges = false,
  isLoadingPreview,
  isSaving,
  music,
  showSaveButton = true,
  volume,
  onEnabledChange,
  onRemove,
  onSave,
  onSelectTrack,
  onVolumeChange,
}: CliprMusicControlsProps) {
  const shouldShowSaveButton =
    showSaveButton && (Boolean(music) || hasUnsavedChanges);

  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-surface-elevated p-3">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
          Sound
        </p>
        {isLoadingPreview ? (
          <span className="text-xs font-semibold text-text-tertiary">
            Loading preview
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      {music ? (
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex min-w-0 items-start gap-3 rounded-lg border border-border bg-white p-3">
            <input
              type="checkbox"
              checked={enabled}
              className="mt-1 h-4 w-4 accent-accent"
              onChange={(event) => onEnabledChange(event.currentTarget.checked)}
            />
            <span className="min-w-0 text-sm leading-6 text-text-secondary">
              Include sound when exporting this Clip.
            </span>
          </label>
          <label className="block min-w-0 rounded-lg border border-border bg-white p-3">
            <span className="text-sm font-semibold text-text-primary">
              Sound volume
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              className="mt-3 w-full accent-accent"
              onChange={(event) =>
                onVolumeChange(Number(event.currentTarget.value) / 100)
              }
            />
            <span className="mt-1 block text-xs font-semibold text-text-tertiary">
              {Math.round(volume * 100)}%
            </span>
          </label>
        </div>
      ) : (
        <div className="mt-3 rounded-lg border border-dashed border-border bg-white p-4 text-sm font-semibold text-text-tertiary">
          No sound is attached to this Clip.
        </div>
      )}

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        {music ? (
          <Button
            type="button"
            variant="danger"
            size="sm"
            isLoading={isSaving}
            onClick={onRemove}
          >
            Remove sound
          </Button>
        ) : null}
        {shouldShowSaveButton ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Save aria-hidden className="h-4 w-4" />}
            isLoading={isSaving}
            onClick={onSave}
          >
            Save sound
          </Button>
        ) : null}
        <MusicSelectorButton
          label={music ? "Change sound" : "Add sound"}
          source="clipr"
          selectedTrackId={music?.sharedTrackId}
          onSelectTrack={onSelectTrack}
        />
      </div>
    </div>
  );
}
