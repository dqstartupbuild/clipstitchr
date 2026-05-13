"use client";

import { Music2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type CliprMusicSettingsDialogProps = {
  clip: VideoClipMetadata;
  error: string | null;
  isGenerating: boolean;
  isSaving: boolean;
  onClose: () => void;
  onGenerate: () => Promise<CliprMusicMetadata | null>;
  onRemove: () => Promise<void>;
  onSave: (music: CliprMusicMetadata) => Promise<void>;
};

export function CliprMusicSettingsDialog({
  clip,
  error,
  isGenerating,
  isSaving,
  onClose,
  onGenerate,
  onRemove,
  onSave,
}: CliprMusicSettingsDialogProps) {
  const clipMusic = clip.cliprMetadata?.music ?? null;
  const [music, setMusic] = useState<CliprMusicMetadata | null>(clipMusic);
  const [enabled, setEnabled] = useState(music?.enabled ?? true);
  const [volume, setVolume] = useState(music?.volume ?? 1);

  const handleGenerate = async () => {
    const nextMusic = await onGenerate();

    if (nextMusic) {
      setMusic(nextMusic);
      setEnabled(nextMusic.enabled);
      setVolume(nextMusic.volume);
    }
  };
  const handleRemove = async () => {
    try {
      await onRemove();
      setMusic(null);
    } catch {
      return;
    }
  };
  const handleSave = async () => {
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
      await onSave(nextMusic);
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
        aria-labelledby="clipr-music-dialog-title"
        className="w-full max-w-lg rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">Music</p>
            <h2
              id="clipr-music-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {clip.name}
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close music settings"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="flex flex-col gap-4 p-5">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {music ? (
            <>
              <label className="flex items-start gap-3 rounded-lg border border-border bg-surface-elevated p-3">
                <input
                  type="checkbox"
                  checked={enabled}
                  className="mt-1 h-4 w-4 accent-accent"
                  onChange={(event) => setEnabled(event.currentTarget.checked)}
                />
                <span className="text-sm leading-6 text-text-secondary">
                  Include music when exporting this Clip.
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
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-slate-50 p-4 text-sm font-semibold text-text-tertiary">
              No music is attached to this Clip.
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            {music ? (
              <>
                <Button
                  type="button"
                  variant="danger"
                  isLoading={isSaving}
                  onClick={() => void handleRemove()}
                >
                  Remove music
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  isLoading={isSaving}
                  onClick={() => void handleSave()}
                >
                  Save settings
                </Button>
              </>
            ) : null}
            <Button
              type="button"
              icon={<Music2 aria-hidden className="h-4 w-4" />}
              isLoading={isGenerating}
              onClick={() => void handleGenerate()}
            >
              {music ? "Generate new music" : "Generate music"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
