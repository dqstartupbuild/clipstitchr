"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/app/_components/ui/Button";

type CliprVoicePreviewButtonProps = {
  disabled?: boolean;
  isCompact?: boolean;
  src: string;
  voiceName: string;
};

export function CliprVoicePreviewButton({
  disabled = false,
  isCompact = false,
  src,
  voiceName,
}: CliprVoicePreviewButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);

    audio.preload = "none";
    audioRef.current = audio;

    const handleStop = () => setIsPlaying(false);

    audio.addEventListener("ended", handleStop);
    audio.addEventListener("pause", handleStop);

    return () => {
      audio.removeEventListener("ended", handleStop);
      audio.removeEventListener("pause", handleStop);
      audio.pause();
      audioRef.current = null;
    };
  }, [src]);

  const handleClick = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    audio.currentTime = 0;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const label = isPlaying ? "Pause" : "Preview";

  return (
    <Button
      type="button"
      variant="secondary"
      className={isCompact ? "h-10 w-10 !px-0" : ""}
      disabled={disabled}
      icon={
        isPlaying ? (
          <Pause aria-hidden className="h-4 w-4" />
        ) : (
          <Play aria-hidden className="h-4 w-4" />
        )
      }
      aria-label={`${label} ${voiceName} voice`}
      title={`${label} ${voiceName} voice`}
      onClick={handleClick}
    >
      {isCompact ? null : label}
    </Button>
  );
}
