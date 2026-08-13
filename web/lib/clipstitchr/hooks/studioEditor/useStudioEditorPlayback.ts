"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useStudioEditorPlayback(durationSeconds: number) {
  const [playheadSeconds, setPlayheadSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const startedAtRef = useRef(0);
  const startedFromRef = useRef(0);

  const seek = useCallback(
    (seconds: number) => {
      const next = Math.min(durationSeconds, Math.max(0, seconds));
      setPlayheadSeconds(next);
      startedFromRef.current = next;
      startedAtRef.current = performance.now();
    },
    [durationSeconds],
  );

  const toggle = useCallback(() => {
    setIsPlaying((playing) => {
      if (!playing) {
        const nextStart =
          playheadSeconds >= durationSeconds ? 0 : playheadSeconds;
        setPlayheadSeconds(nextStart);
        startedFromRef.current = nextStart;
        startedAtRef.current = performance.now();
      }
      return !playing;
    });
  }, [durationSeconds, playheadSeconds]);

  useEffect(() => {
    if (!isPlaying) return;
    let frameId = 0;

    const advance = (now: number) => {
      const next = startedFromRef.current + (now - startedAtRef.current) / 1000;

      if (next >= durationSeconds) {
        setPlayheadSeconds(durationSeconds);
        setIsPlaying(false);
        return;
      }

      setPlayheadSeconds(next);
      frameId = window.requestAnimationFrame(advance);
    };

    frameId = window.requestAnimationFrame(advance);
    return () => window.cancelAnimationFrame(frameId);
  }, [durationSeconds, isPlaying]);

  return {
    isPlaying,
    playheadSeconds: Math.min(playheadSeconds, durationSeconds),
    seek,
    toggle,
  };
}
