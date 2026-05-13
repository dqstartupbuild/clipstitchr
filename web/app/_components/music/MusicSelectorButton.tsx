"use client";

import { Music2 } from "lucide-react";
import { useState } from "react";
import { MusicSelectorDialog } from "@/app/_components/music/MusicSelectorDialog";
import { Button } from "@/app/_components/ui/Button";
import { generateSharedMusicTrack } from "@/lib/clipstitchr/client/generateSharedMusicTrack";
import { useSharedMusicTracks } from "@/lib/clipstitchr/hooks/useSharedMusicTracks";
import type { MusicTrackSource } from "@/lib/clipstitchr/types/MusicTrackSource";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

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
  const [isGenerating, setIsGenerating] = useState(false);
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
  const handleGenerate = async (style: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const track = await generateSharedMusicTrack({ source, style });

      await onSelectTrack(track);
      setIsOpen(false);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to generate music.",
      );
    } finally {
      setIsGenerating(false);
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
          isGenerating={isGenerating}
          isLoading={library.isLoading}
          selectedTrackId={selectedTrackId}
          tracks={library.tracks}
          onClose={() => setIsOpen(false)}
          onGenerate={handleGenerate}
          onSelect={handleSelect}
        />
      ) : null}
    </>
  );
}
