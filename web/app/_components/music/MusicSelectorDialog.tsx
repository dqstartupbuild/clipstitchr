"use client";

import { Upload, X } from "lucide-react";
import { useMemo, useState } from "react";
import { MusicTrackListItem } from "@/app/_components/music/MusicTrackListItem";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import { ACCEPTED_MUSIC_TYPES } from "@/lib/clipstitchr/constants/acceptedMusicTypes";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

type MusicSelectorDialogProps = {
  error: string | null;
  isLoading: boolean;
  isUploading: boolean;
  selectedTrackId?: string;
  tracks: SharedMusicTrack[];
  onClose: () => void;
  onSelect: (track: SharedMusicTrack) => void | Promise<void>;
  onUpload: (file: File, title: string) => void | Promise<void>;
};

export function MusicSelectorDialog({
  error,
  isLoading,
  isUploading,
  selectedTrackId,
  tracks,
  onClose,
  onSelect,
  onUpload,
}: MusicSelectorDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
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
          <div className="grid gap-2 rounded-lg border border-dashed border-border bg-surface-elevated p-3">
            <label className="block">
              <span className="text-sm font-semibold text-text-primary">
                Add music everyone can use
              </span>
              <input
                type="text"
                value={uploadTitle}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none transition focus:border-accent"
                placeholder="Track title"
                onChange={(event) => setUploadTitle(event.currentTarget.value)}
              />
            </label>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <label
                className={[
                  "inline-flex h-10 min-w-0 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary transition-colors hover:border-accent",
                  isUploading ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                ].join(" ")}
              >
                <Upload aria-hidden className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {uploadFile ? uploadFile.name : "Choose audio"}
                </span>
                <input
                  type="file"
                  accept={ACCEPTED_MUSIC_TYPES.join(",")}
                  className="sr-only"
                  disabled={isUploading}
                  onChange={(event) => {
                    setUploadFile(event.currentTarget.files?.[0] ?? null);
                  }}
                />
              </label>
              <Button
                type="button"
                variant="secondary"
                icon={<Upload aria-hidden className="h-4 w-4" />}
                isLoading={isUploading}
                disabled={!uploadFile}
                onClick={() => {
                  if (uploadFile) {
                    void onUpload(uploadFile, uploadTitle);
                  }
                }}
              >
                Upload
              </Button>
            </div>
            <p className="text-xs font-semibold text-text-tertiary">
              Music you upload is added to the shared music pool. Only upload
              tracks you have the rights to use.
            </p>
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
