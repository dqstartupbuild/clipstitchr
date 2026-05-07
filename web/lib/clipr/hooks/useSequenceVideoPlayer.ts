"use client";

import { useCallback, useMemo, useRef, useState } from "react";

type UseSequenceVideoPlayerOptions = {
  ugcDuration: number;
};

export function useSequenceVideoPlayer({
  ugcDuration,
}: UseSequenceVideoPlayerOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activeSegment, setActiveSegment] = useState<"ugc" | "demo">("ugc");
  const [currentTime, setCurrentTime] = useState(0);

  const updateCurrentTime = useCallback(() => {
    const video = videoRef.current;
    const segmentTime = video?.currentTime ?? 0;

    setCurrentTime(activeSegment === "ugc" ? segmentTime : ugcDuration + segmentTime);
  }, [activeSegment, ugcDuration]);

  const handleEnded = useCallback(() => {
    if (activeSegment === "ugc") {
      setCurrentTime(ugcDuration);
      setActiveSegment("demo");
      window.requestAnimationFrame(() => {
        void videoRef.current?.play();
      });
      return;
    }

    setCurrentTime(0);
    setActiveSegment("ugc");
  }, [activeSegment, ugcDuration]);

  const restart = useCallback(() => {
    setActiveSegment("ugc");
    setCurrentTime(0);
    window.requestAnimationFrame(() => {
      if (!videoRef.current) {
        return;
      }

      videoRef.current.currentTime = 0;
      void videoRef.current.play();
    });
  }, []);

  return useMemo(
    () => ({
      videoRef,
      activeSegment,
      currentTime,
      handleEnded,
      updateCurrentTime,
      restart,
    }),
    [activeSegment, currentTime, handleEnded, restart, updateCurrentTime],
  );
}
