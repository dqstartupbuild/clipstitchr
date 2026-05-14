"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/app/_components/ui/IconButton";
import { downloadMusicBlob } from "@/lib/clipstitchr/client/r2/downloadMusicBlob";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

type MusicTrackPreviewButtonProps = {
  track: SharedMusicTrack;
};

export function MusicTrackPreviewButton({
  track,
}: MusicTrackPreviewButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioObjectUrlRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;

      if (audioObjectUrlRef.current) {
        URL.revokeObjectURL(audioObjectUrlRef.current);
        audioObjectUrlRef.current = null;
      }
    };
  }, []);

  const handleToggle = async () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!audioRef.current) {
        const blob = await downloadMusicBlob({
          audioObject: track.audioObject,
          sharedTrackId: track.id,
        });
        const objectUrl = URL.createObjectURL(blob);
        const audio = new Audio(objectUrl);

        audio.preload = "auto";
        audio.addEventListener("ended", () => setIsPlaying(false));
        audio.addEventListener("pause", () => setIsPlaying(false));
        audioObjectUrlRef.current = objectUrl;
        audioRef.current = audio;
      }

      if (audioRef.current.ended) {
        audioRef.current.currentTime = 0;
      }

      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setError("Unable to preview this track.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IconButton
      type="button"
      label={
        error
          ? error
          : isPlaying
            ? `Pause ${track.title}`
            : `Preview ${track.title}`
      }
      icon={
        isPlaying ? (
          <Pause aria-hidden className="h-4 w-4" />
        ) : (
          <Play aria-hidden className="h-4 w-4" />
        )
      }
      className={error ? "border-red-200 text-red-600" : undefined}
      disabled={isLoading}
      onClick={() => void handleToggle()}
    />
  );
}
