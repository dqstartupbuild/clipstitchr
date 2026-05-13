"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/app/_components/ui/IconButton";
import { createMusicTrackDownloadUrl } from "@/lib/clipstitchr/client/r2/createMusicTrackDownloadUrl";

type MusicTrackPreviewButtonProps = {
  trackId: string;
  trackTitle: string;
};

export function MusicTrackPreviewButton({
  trackId,
  trackTitle,
}: MusicTrackPreviewButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const handleToggle = async () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    try {
      if (!audioRef.current) {
        const downloadUrl = await createMusicTrackDownloadUrl(trackId);
        const audio = new Audio(downloadUrl.url);

        audio.addEventListener("ended", () => setIsPlaying(false));
        audioRef.current = audio;
      }

      await audioRef.current.play();
      setIsPlaying(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IconButton
      type="button"
      label={isPlaying ? `Pause ${trackTitle}` : `Preview ${trackTitle}`}
      icon={
        isPlaying ? (
          <Pause aria-hidden className="h-4 w-4" />
        ) : (
          <Play aria-hidden className="h-4 w-4" />
        )
      }
      disabled={isLoading}
      onClick={() => void handleToggle()}
    />
  );
}
