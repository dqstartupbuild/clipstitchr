"use client";

import { useCallback, useMemo, useRef, useState } from "react";

export function useSequenceVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activeSegment, setActiveSegment] = useState<"ugc" | "demo">("ugc");

  const handleEnded = useCallback(() => {
    if (activeSegment === "ugc") {
      setActiveSegment("demo");
      window.requestAnimationFrame(() => {
        void videoRef.current?.play();
      });
      return;
    }

    setActiveSegment("ugc");
  }, [activeSegment]);

  const restart = useCallback(() => {
    setActiveSegment("ugc");
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
      handleEnded,
      restart,
    }),
    [activeSegment, handleEnded, restart],
  );
}
