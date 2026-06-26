"use client";

import { MusicSelectorButton } from "@/app/_components/music/MusicSelectorButton";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

type ClipAudioControlsProps = {
  includeDemoAudio: boolean;
  includeUgcAudio: boolean;
  isStitching: boolean;
  selectedMusicTrack: SharedMusicTrack | null;
  onIncludeDemoAudioChange: (includeDemoAudio: boolean) => void;
  onIncludeUgcAudioChange: (includeUgcAudio: boolean) => void;
  onSelectMusicTrack: (track: SharedMusicTrack) => void | Promise<void>;
};

export function ClipAudioControls({
  includeDemoAudio,
  includeUgcAudio,
  isStitching,
  selectedMusicTrack,
  onIncludeDemoAudioChange,
  onIncludeUgcAudioChange,
  onSelectMusicTrack,
}: ClipAudioControlsProps) {
  return (
    <section className="mt-4 border-t border-border pt-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="text-sm font-semibold text-accent-dark">Sound</h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
          <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-secondary">
            <input
              type="checkbox"
              checked={includeUgcAudio}
              className="h-4 w-4 accent-accent"
              disabled={isStitching}
              onChange={(event) =>
                onIncludeUgcAudioChange(event.currentTarget.checked)
              }
            />
            UGC audio
          </label>
          <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-secondary">
            <input
              type="checkbox"
              checked={includeDemoAudio}
              className="h-4 w-4 accent-accent"
              disabled={isStitching}
              onChange={(event) =>
                onIncludeDemoAudioChange(event.currentTarget.checked)
              }
            />
            Demo audio
          </label>
          <MusicSelectorButton
            label={selectedMusicTrack ? "Change sound" : "Add sound"}
            disabled={isStitching}
            source="stitchr"
            selectedTrackId={selectedMusicTrack?.id}
            onSelectTrack={onSelectMusicTrack}
          />
        </div>
      </div>
    </section>
  );
}
