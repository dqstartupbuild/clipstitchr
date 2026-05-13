"use client";

import { Music2, Save } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";

type CliprMusicControlsProps = {
  enabled: boolean;
  error: string | null;
  isGenerating: boolean;
  isLoadingPreview: boolean;
  isSaving: boolean;
  music: CliprMusicMetadata | null;
  volume: number;
  onEnabledChange: (enabled: boolean) => void;
  onGenerate: () => void;
  onRemove: () => void;
  onSave: () => void;
  onVolumeChange: (volume: number) => void;
};

export function CliprMusicControls({
  enabled,
  error,
  isGenerating,
  isLoadingPreview,
  isSaving,
  music,
  volume,
  onEnabledChange,
  onGenerate,
  onRemove,
  onSave,
  onVolumeChange,
}: CliprMusicControlsProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
          Music
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
          <label className="flex items-start gap-3 rounded-lg border border-border bg-white p-3">
            <input
              type="checkbox"
              checked={enabled}
              className="mt-1 h-4 w-4 accent-accent"
              onChange={(event) => onEnabledChange(event.currentTarget.checked)}
            />
            <span className="text-sm leading-6 text-text-secondary">
              Include music when exporting this Clip.
            </span>
          </label>
          <label className="block rounded-lg border border-border bg-white p-3">
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
          No music is attached to this Clip.
        </div>
      )}

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        {music ? (
          <>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isSaving}
              onClick={onRemove}
            >
              Remove music
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Save aria-hidden className="h-4 w-4" />}
              isLoading={isSaving}
              onClick={onSave}
            >
              Save music
            </Button>
          </>
        ) : null}
        <Button
          type="button"
          size="sm"
          icon={<Music2 aria-hidden className="h-4 w-4" />}
          isLoading={isGenerating}
          onClick={onGenerate}
        >
          {music ? "Generate new music" : "Generate music"}
        </Button>
      </div>
    </div>
  );
}
