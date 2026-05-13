"use client";

import { Shuffle } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";
import type { SwaprMode } from "@/lib/clipstitchr/types/SwaprMode";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getSwaprReferenceDurationLimit } from "@/lib/clipstitchr/utils/getSwaprReferenceDurationLimit";

type SwaprControlsPanelProps = {
  prompt: string;
  mode: SwaprMode;
  characterOrientation: SwaprCharacterOrientation;
  keepOriginalSound: boolean;
  hasConsent: boolean;
  isGenerating: boolean;
  selectedClip?: VideoClipMetadata;
  isReady: boolean;
  referenceVideoMaxSizeBytes: number;
  onPromptChange: (prompt: string) => void;
  onModeChange: (mode: SwaprMode) => void;
  onCharacterOrientationChange: (
    characterOrientation: SwaprCharacterOrientation,
  ) => void;
  onKeepOriginalSoundChange: (keepOriginalSound: boolean) => void;
  onConsentChange: (hasConsent: boolean) => void;
  onGenerate: () => void;
};

export function SwaprControlsPanel({
  prompt,
  mode,
  characterOrientation,
  keepOriginalSound,
  hasConsent,
  isGenerating,
  selectedClip,
  isReady,
  referenceVideoMaxSizeBytes,
  onPromptChange,
  onModeChange,
  onCharacterOrientationChange,
  onKeepOriginalSoundChange,
  onConsentChange,
  onGenerate,
}: SwaprControlsPanelProps) {
  const durationLimit = getSwaprReferenceDurationLimit(characterOrientation);
  const isDurationValid = selectedClip
    ? selectedClip.duration >= 3 && selectedClip.duration <= durationLimit
    : true;
  const isSizeValid = selectedClip
    ? selectedClip.size <= referenceVideoMaxSizeBytes
    : true;

  return (
    <section className="border-t border-border pt-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-accent-dark">Setup</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Create new UGC
          </h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            The avatar supplies the face. The selected video supplies the motion.
          </p>
        </div>
        <div className="grid gap-2 lg:justify-items-end">
          <Button
            type="button"
            icon={<Shuffle aria-hidden className="h-4 w-4" />}
            isLoading={isGenerating}
            disabled={!isReady || !isDurationValid || !isSizeValid}
            onClick={onGenerate}
          >
            Create Swap
          </Button>
          <label className="flex max-w-xs items-start gap-2 text-xs leading-5 text-text-secondary">
            <input
              type="checkbox"
              checked={hasConsent}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-accent"
              onChange={(event) => onConsentChange(event.currentTarget.checked)}
            />
            <span>I have rights and consent for these inputs.</span>
          </label>
        </div>
      </div>

      <details className="mt-3 rounded-lg border border-border bg-surface-elevated">
        <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-text-primary">
          Advanced settings
        </summary>
        <div className="grid gap-3 border-t border-border p-3">
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              Scene notes
            </span>
            <textarea
              value={prompt}
              rows={2}
              className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
              placeholder="Keep the creator in the same casual indoor setting, natural phone-camera lighting."
              onChange={(event) => onPromptChange(event.target.value)}
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-text-primary">Quality</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={mode === "pro" ? "primary" : "secondary"}
                  onClick={() => onModeChange("pro")}
                >
                  Quality 1080p
                </Button>
                <Button
                  type="button"
                  variant={mode === "std" ? "primary" : "secondary"}
                  onClick={() => onModeChange("std")}
                >
                  Fast 720p
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-text-primary">
                Orientation
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={
                    characterOrientation === "video" ? "primary" : "secondary"
                  }
                  onClick={() => onCharacterOrientationChange("video")}
                >
                  Match Video
                </Button>
                <Button
                  type="button"
                  variant={
                    characterOrientation === "image" ? "primary" : "secondary"
                  }
                  onClick={() => onCharacterOrientationChange("image")}
                >
                  Match Photo
                </Button>
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-border bg-white p-3">
            <input
              type="checkbox"
              checked={keepOriginalSound}
              className="mt-1 h-4 w-4 accent-accent"
              onChange={(event) =>
                onKeepOriginalSoundChange(event.currentTarget.checked)
              }
            />
            <span className="text-sm leading-6 text-text-secondary">
              Keep the original audio when available.
            </span>
          </label>
        </div>
      </details>

      {selectedClip && !isDurationValid ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          This setting works with clips from 3s to {durationLimit}s. Selected:
          {" "}
          {formatDuration(selectedClip.duration)}.
        </div>
      ) : null}

      {selectedClip && !isSizeValid ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Choose a smaller source video. Limit:{" "}
          {formatBytes(referenceVideoMaxSizeBytes)}. Selected:{" "}
          {formatBytes(selectedClip.size)}.
        </div>
      ) : null}
    </section>
  );
}
