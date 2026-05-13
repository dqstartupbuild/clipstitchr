"use client";

import { Music2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { MusicTrackListItem } from "@/app/_components/music/MusicTrackListItem";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

type MusicSelectorDialogProps = {
  error: string | null;
  isGenerating: boolean;
  isLoading: boolean;
  selectedTrackId?: string;
  tracks: SharedMusicTrack[];
  onClose: () => void;
  onGenerate: (style: string) => void | Promise<void>;
  onSelect: (track: SharedMusicTrack) => void | Promise<void>;
};

export function MusicSelectorDialog({
  error,
  isGenerating,
  isLoading,
  selectedTrackId,
  tracks,
  onClose,
  onGenerate,
  onSelect,
}: MusicSelectorDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [style, setStyle] = useState("");
  const filteredTracks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return tracks;
    }

    return tracks.filter((track) =>
      [
        track.title,
        track.style,
        track.prompt,
        track.source,
        ...track.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchQuery, tracks]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 px-4 py-20"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="music-selector-title"
        className="w-full max-w-xl overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">Music</p>
            <h2
              id="music-selector-title"
              className="mt-0.5 text-base font-bold text-text-primary"
            >
              Select music
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close music selector"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="grid gap-3 border-b border-border p-4">
          <SearchInput
            label="Search music"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search tracks or tags"
          />
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <label className="block">
              <span className="sr-only">Music style</span>
              <input
                type="text"
                value={style}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none transition focus:border-accent"
                placeholder="Mood or style"
                onChange={(event) => setStyle(event.currentTarget.value)}
              />
            </label>
            <Button
              type="button"
              variant="secondary"
              icon={<Music2 aria-hidden className="h-4 w-4" />}
              isLoading={isGenerating}
              onClick={() => void onGenerate(style)}
            >
              Generate
            </Button>
          </div>
          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {error}
            </p>
          ) : null}
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-sm font-semibold text-text-tertiary">
              Loading music
            </div>
          ) : filteredTracks.length ? (
            <ul>
              {filteredTracks.map((track) => (
                <MusicTrackListItem
                  key={track.id}
                  isSelected={track.id === selectedTrackId}
                  track={track}
                  onSelect={onSelect}
                />
              ))}
            </ul>
          ) : (
            <div className="p-4 text-sm font-semibold text-text-tertiary">
              No tracks found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
