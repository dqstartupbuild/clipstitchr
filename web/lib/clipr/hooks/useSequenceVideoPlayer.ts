"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { VideoTrimRange } from "@/lib/clipr/types/VideoTrimRange";
import { clamp } from "@/lib/clipr/utils/clamp";
import { getVideoTrimRangeDuration } from "@/lib/clipr/utils/getVideoTrimRangeDuration";

type UseSequenceVideoPlayerOptions = {
  ugcTrimRange: VideoTrimRange;
  demoTrimRange: VideoTrimRange;
};

export function useSequenceVideoPlayer({
  ugcTrimRange,
  demoTrimRange,
}: UseSequenceVideoPlayerOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activeSegment, setActiveSegment] = useState<"ugc" | "demo">("ugc");
  const [currentTime, setCurrentTime] = useState(0);
  const ugcDuration = getVideoTrimRangeDuration(ugcTrimRange);
  const demoDuration = getVideoTrimRangeDuration(demoTrimRange);

  const getActiveTrimRange = useCallback(
    (segment: "ugc" | "demo") =>
      segment === "ugc" ? ugcTrimRange : demoTrimRange,
    [demoTrimRange, ugcTrimRange],
  );

  const updateCurrentTime = useCallback(
    (segment: "ugc" | "demo" = activeSegment) => {
      const video = videoRef.current;
      const trimRange = getActiveTrimRange(segment);
      const segmentDuration = segment === "ugc" ? ugcDuration : demoDuration;
      const rawSegmentTime =
        (video?.currentTime ?? trimRange.start) - trimRange.start;
      const segmentTime = clamp(rawSegmentTime, 0, segmentDuration);

      setCurrentTime(
        segment === "ugc" ? segmentTime : ugcDuration + segmentTime,
      );
    },
    [activeSegment, demoDuration, getActiveTrimRange, ugcDuration],
  );

  const handleEnded = useCallback(() => {
    if (activeSegment === "ugc") {
      setCurrentTime(ugcDuration);
      setActiveSegment("demo");
      window.requestAnimationFrame(() => {
        if (!videoRef.current) {
          return;
        }

        videoRef.current.currentTime = demoTrimRange.start;
        void videoRef.current.play();
      });
      return;
    }

    setCurrentTime(0);
    setActiveSegment("ugc");
    window.requestAnimationFrame(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = ugcTrimRange.start;
      }
    });
  }, [activeSegment, demoTrimRange.start, ugcDuration, ugcTrimRange.start]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    const trimRange = getActiveTrimRange(activeSegment);

    if (!video) {
      return;
    }

    if (
      video.currentTime < trimRange.start ||
      video.currentTime >= trimRange.end
    ) {
      video.currentTime = trimRange.start;
    }

    updateCurrentTime();
  }, [activeSegment, getActiveTrimRange, updateCurrentTime]);

  const handleSeeking = useCallback(() => {
    const video = videoRef.current;
    const trimRange = getActiveTrimRange(activeSegment);

    if (!video) {
      return;
    }

    if (video.currentTime < trimRange.start) {
      video.currentTime = trimRange.start;
    }

    if (video.currentTime > trimRange.end) {
      video.currentTime = Math.max(trimRange.start, trimRange.end - 0.01);
    }

    updateCurrentTime();
  }, [activeSegment, getActiveTrimRange, updateCurrentTime]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    const trimRange = getActiveTrimRange(activeSegment);

    updateCurrentTime();

    if (!video || video.currentTime < trimRange.end) {
      return;
    }

    handleEnded();
  }, [activeSegment, getActiveTrimRange, handleEnded, updateCurrentTime]);

  const restart = useCallback(() => {
    setActiveSegment("ugc");
    setCurrentTime(0);
    window.requestAnimationFrame(() => {
      if (!videoRef.current) {
        return;
      }

      videoRef.current.currentTime = ugcTrimRange.start;
      void videoRef.current.play();
    });
  }, [ugcTrimRange.start]);

  return useMemo(
    () => ({
      videoRef,
      activeSegment,
      currentTime,
      handleEnded,
      handleLoadedMetadata,
      handleSeeking,
      handleTimeUpdate,
      restart,
    }),
    [
      activeSegment,
      currentTime,
      handleEnded,
      handleLoadedMetadata,
      handleSeeking,
      handleTimeUpdate,
      restart,
    ],
  );
}
