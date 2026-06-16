"use client";

import { Music2 } from "lucide-react";
import { useState } from "react";
import { MusicSelectorDialog } from "@/app/_components/music/MusicSelectorDialog";
import { Button } from "@/app/_components/ui/Button";
import { getAudioBlobDuration } from "@/lib/clipstitchr/client/getAudioBlobDuration";
import { uploadSharedMusicTrack } from "@/lib/clipstitchr/client/uploadSharedMusicTrack";
import { useSharedMusicTracks } from "@/lib/clipstitchr/hooks/useSharedMusicTracks";
import type { MusicTrackSource } from "@/lib/clipstitchr/types/MusicTrackSource";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
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
  label = "Select music",
  selectedTrackId,
  source,
  onSelectTrack,
}: MusicSelectorButtonProps) {
  const library = useSharedMusicTracks();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (track: SharedMusicTrack) => {
    setError(null);

    try {
      await onSelectTrack(track);
      setIsOpen(false);
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Unable to select music.",
      );
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
          : "Unable to upload music.",
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
          isUploading={isUploading}
          selectedTrackId={selectedTrackId}
          tracks={library.tracks}
          onClose={() => setIsOpen(false)}
          onSelect={handleSelect}
          onUpload={handleUpload}
        />
      ) : null}
    </>
  );
}
