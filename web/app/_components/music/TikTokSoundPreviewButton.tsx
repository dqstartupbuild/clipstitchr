"use client";

import { Music2, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/app/_components/ui/IconButton";

type TikTokSoundPreviewButtonProps = {
  playUrl?: string;
  title: string;
};

export function TikTokSoundPreviewButton({
  playUrl,
  title,
}: TikTokSoundPreviewButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const handleToggle = async () => {
    if (!playUrl) {
      return;
    }

    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!audioRef.current) {
        const audio = new Audio(playUrl);

        audio.preload = "auto";
        audio.addEventListener("ended", () => setIsPlaying(false));
        audio.addEventListener("pause", () => setIsPlaying(false));
        audioRef.current = audio;
      }

      if (audioRef.current.ended) {
        audioRef.current.currentTime = 0;
      }

      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setError("Unable to preview this sound.");
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
          : !playUrl
            ? `No preview for ${title}`
            : isPlaying
              ? `Pause ${title}`
              : `Preview ${title}`
      }
      icon={
        !playUrl ? (
          <Music2 aria-hidden className="h-4 w-4" />
        ) : isPlaying ? (
          <Pause aria-hidden className="h-4 w-4" />
        ) : (
          <Play aria-hidden className="h-4 w-4" />
        )
      }
      className={error ? "border-red-200 text-red-600" : undefined}
      disabled={isLoading || !playUrl}
      onClick={() => void handleToggle()}
    />
  );
}
