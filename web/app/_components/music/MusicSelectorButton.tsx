"use client";

import { Music2 } from "lucide-react";
import { useState } from "react";
import { MusicSelectorDialog } from "@/app/_components/music/MusicSelectorDialog";
import { Button } from "@/app/_components/ui/Button";
import { getAudioBlobDuration } from "@/lib/clipstitchr/client/getAudioBlobDuration";
import { importTikTokSound } from "@/lib/clipstitchr/client/importTikTokSound";
import { searchTikTokSounds } from "@/lib/clipstitchr/client/searchTikTokSounds";
import { uploadSharedMusicTrack } from "@/lib/clipstitchr/client/uploadSharedMusicTrack";
import { useSharedMusicTracks } from "@/lib/clipstitchr/hooks/useSharedMusicTracks";
import { useSoundPreferences } from "@/lib/clipstitchr/hooks/useSoundPreferences";
import type { MusicTrackSource } from "@/lib/clipstitchr/types/MusicTrackSource";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { TikTokSoundCandidate } from "@/lib/clipstitchr/types/TikTokSoundCandidate";
import { getMusicUploadTitle } from "@/lib/clipstitchr/utils/getMusicUploadTitle";

type MusicSelectorButtonProps = {
  disabled?: boolean;
  label?: string;
  selectedTrackId?: string;
  source: MusicTrackSource;
  onSelectTrack: (track: SharedMusicTrack) => void | Promise<void>;
};

export function MusicSelectorButton({
  disabled = false,
  label = "Select sound",
  selectedTrackId,
  source,
  onSelectTrack,
}: MusicSelectorButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const library = useSharedMusicTracks(isOpen);
  const soundPreferences = useSoundPreferences();
  const [tiktokCandidates, setTikTokCandidates] = useState<
    TikTokSoundCandidate[]
  >([]);
  const [isAcceptingRights, setIsAcceptingRights] = useState(false);
  const [isSearchingTikTok, setIsSearchingTikTok] = useState(false);
  const [isSavingTikTokSound, setIsSavingTikTokSound] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (track: SharedMusicTrack) => {
    setError(null);

    try {
      await onSelectTrack(track);
      setIsOpen(false);
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Unable to select sound.",
      );
    }
  };
  const handleAcceptRights = async () => {
    setIsAcceptingRights(true);
    setError(null);

    try {
      await soundPreferences.acceptRights();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to continue.",
      );
    } finally {
      setIsAcceptingRights(false);
    }
  };
  const handleSearchTikTokSounds = async (query: string) => {
    setIsSearchingTikTok(true);
    setError(null);

    try {
      setTikTokCandidates(await searchTikTokSounds(query));
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Unable to find sounds.",
      );
    } finally {
      setIsSearchingTikTok(false);
    }
  };
  const handleImportTikTokSound = async (sourceUrl: string) => {
    setIsSavingTikTokSound(true);
    setError(null);

    try {
      const track = await importTikTokSound(sourceUrl);

      await onSelectTrack(track);
      setIsOpen(false);
      setTikTokCandidates([]);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to save that sound.",
      );
    } finally {
      setIsSavingTikTokSound(false);
    }
  };
  const handleUpload = async (file: File, title: string) => {
    setIsUploading(true);
    setError(null);

    try {
      const durationSeconds = await getAudioBlobDuration(file);
      const track = await uploadSharedMusicTrack({
        durationSeconds,
        file,
        source,
        title: title.trim() || getMusicUploadTitle(file.name),
      });

      await onSelectTrack(track);
      setIsOpen(false);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to upload sound.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={<Music2 aria-hidden className="h-4 w-4" />}
        disabled={disabled}
        onClick={() => setIsOpen(true)}
      >
        {label}
      </Button>
      {isOpen ? (
        <MusicSelectorDialog
          error={error}
          isLoading={library.isLoading}
          isRightsAccepted={soundPreferences.hasAcceptedRights}
          isRightsLoading={soundPreferences.isLoading}
          isRightsSaving={isAcceptingRights}
          isSearchingTikTok={isSearchingTikTok}
          isSavingTikTokSound={isSavingTikTokSound}
          isUploading={isUploading}
          selectedTrackId={selectedTrackId}
          tiktokCandidates={tiktokCandidates}
          tracks={library.tracks}
          onAcceptRights={handleAcceptRights}
          onClose={() => setIsOpen(false)}
          onImportTikTokSound={handleImportTikTokSound}
          onSearchTikTokSounds={handleSearchTikTokSounds}
          onSelect={handleSelect}
          onUpload={handleUpload}
        />
      ) : null}
    </>
  );
}
