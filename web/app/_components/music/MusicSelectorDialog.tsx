"use client";

import { Search, Upload, X } from "lucide-react";
import { useMemo, useState } from "react";
import { MusicTrackListItem } from "@/app/_components/music/MusicTrackListItem";
import { TikTokSoundCandidateListItem } from "@/app/_components/music/TikTokSoundCandidateListItem";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import { ACCEPTED_MUSIC_TYPES } from "@/lib/clipstitchr/constants/acceptedMusicTypes";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { TikTokSoundCandidate } from "@/lib/clipstitchr/types/TikTokSoundCandidate";
import { getTikTokSoundCandidateIsSaved } from "@/lib/clipstitchr/utils/getTikTokSoundCandidateIsSaved";

type MusicSelectorDialogProps = {
  error: string | null;
  isLoading: boolean;
  isRightsAccepted: boolean;
  isRightsLoading: boolean;
  isRightsSaving: boolean;
  isSearchingTikTok: boolean;
  isSavingTikTokSound: boolean;
  isUploading: boolean;
  selectedTrackId?: string;
  tiktokCandidates: TikTokSoundCandidate[];
  tracks: SharedMusicTrack[];
  onAcceptRights: () => void | Promise<void>;
  onClose: () => void;
  onImportTikTokSound: (sourceUrl: string) => void | Promise<void>;
  onSearchTikTokSounds: (query: string) => void | Promise<void>;
  onSelect: (track: SharedMusicTrack) => void | Promise<void>;
  onUpload: (file: File, title: string) => void | Promise<void>;
};

export function MusicSelectorDialog({
  error,
  isLoading,
  isRightsAccepted,
  isRightsLoading,
  isRightsSaving,
  isSearchingTikTok,
  isSavingTikTokSound,
  isUploading,
  selectedTrackId,
  tiktokCandidates,
  tracks,
  onAcceptRights,
  onClose,
  onImportTikTokSound,
  onSearchTikTokSounds,
  onSelect,
  onUpload,
}: MusicSelectorDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tiktokSearchQuery, setTikTokSearchQuery] = useState("");
  const [tiktokUrl, setTikTokUrl] = useState("");
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="music-selector-title"
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-lg bg-white shadow-xl sm:max-h-[calc(100dvh-3rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">Sound</p>
            <h2
              id="music-selector-title"
              className="mt-0.5 text-base font-bold text-text-primary"
            >
              Add a sound
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close sound selector"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="min-h-0 overflow-y-auto">
          <div className="grid gap-3 border-b border-border p-4">
            {!isRightsAccepted ? (
              <div className="grid gap-2 rounded-lg border border-accent/25 bg-surface-muted p-3">
                <p className="text-sm font-semibold text-accent-dark">
                  Use sounds you can add to your videos.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  isLoading={isRightsLoading || isRightsSaving}
                  onClick={() => void onAcceptRights()}
                >
                  Continue
                </Button>
              </div>
            ) : null}
            <SearchInput
              label="Search saved sounds"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search your sounds"
            />
            <div className="grid gap-2 rounded-lg border border-border bg-surface-elevated p-3">
              <label className="block">
                <span className="text-sm font-semibold text-text-primary">
                  Find a sound
                </span>
                <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <input
                    type="text"
                    value={tiktokSearchQuery}
                    className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none transition focus:border-accent"
                    placeholder="Niche, mood, or product"
                    disabled={!isRightsAccepted}
                    onChange={(event) =>
                      setTikTokSearchQuery(event.currentTarget.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    icon={<Search aria-hidden className="h-4 w-4" />}
                    isLoading={isSearchingTikTok}
                    disabled={!isRightsAccepted || !tiktokSearchQuery.trim()}
                    onClick={() => void onSearchTikTokSounds(tiktokSearchQuery)}
                  >
                    Search
                  </Button>
                </div>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-text-primary">
                  Paste TikTok link
                </span>
                <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <input
                    type="url"
                    value={tiktokUrl}
                    className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none transition focus:border-accent"
                    placeholder="https://www.tiktok.com/@..."
                    disabled={!isRightsAccepted}
                    onChange={(event) => setTikTokUrl(event.currentTarget.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    icon={<Upload aria-hidden className="h-4 w-4" />}
                    isLoading={isSavingTikTokSound}
                    disabled={!isRightsAccepted || !tiktokUrl.trim()}
                    onClick={() => void onImportTikTokSound(tiktokUrl)}
                  >
                    Save
                  </Button>
                </div>
              </label>
              {tiktokCandidates.length ? (
                <ul className="overflow-hidden rounded-lg border border-border bg-white">
                  {tiktokCandidates.map((candidate) => (
                    <TikTokSoundCandidateListItem
                      key={`${candidate.musicId ?? candidate.sourceUrl}:${candidate.title}`}
                      candidate={candidate}
                      isSaved={getTikTokSoundCandidateIsSaved(
                        candidate,
                        tracks,
                      )}
                      isSaving={isSavingTikTokSound}
                      onSave={onImportTikTokSound}
                    />
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="grid gap-2 rounded-lg border border-dashed border-border bg-surface-elevated p-3">
              <label className="block">
                <span className="text-sm font-semibold text-text-primary">
                  Upload a sound
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
                    isUploading
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer",
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
                    disabled={isUploading || !isRightsAccepted}
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
                  disabled={!isRightsAccepted || !uploadFile}
                  onClick={() => {
                    if (uploadFile) {
                      void onUpload(uploadFile, uploadTitle);
                    }
                  }}
                >
                  Upload
                </Button>
              </div>
            </div>
            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {error}
              </p>
            ) : null}
          </div>
          <div>
            {isLoading ? (
              <div className="p-4 text-sm font-semibold text-text-tertiary">
                Loading sounds
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
                No sounds found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
